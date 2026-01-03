// /lib/roadmap-engine.ts
// 기준: (Next Weight Lab) 대사 가교 전략 및 ROI 마스터 시트.pdf
import { CLINICAL_DATA, DRUG_TYPES, STAGES, type BudgetTier, type DrugTypeKey, type StageDef } from './drug-config';

export interface UserData {
  userName: string;
  userAge: number;
  userGender: string;
  currentWeight: number;
  targetWeight: number;
  startWeightBeforeDrug: number;
  drugType: DrugTypeKey;
  currentDose: number;
  currentWeek: number;
  drugStatus: string;
  budget: BudgetTier | string;
  muscleMass: string;
  exercise: string;
  mainConcern: string;
  resolution: string;
}

type StageResult = {
  phase: StageDef['phase'];
  name: string;
  icon: string;
  start: number;
  end: number;
  color: string;
  msg: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function interpolateAt(weeks: number[], values: number[], week: number) {
  if (weeks.length === 0) return 0;
  if (week <= weeks[0]) return values[0] ?? 0;
  if (week >= weeks[weeks.length - 1]) return values[values.length - 1] ?? 0;

  for (let i = 0; i < weeks.length - 1; i++) {
    const w0 = weeks[i];
    const w1 = weeks[i + 1];
    if (week >= w0 && week <= w1) {
      const v0 = values[i] ?? 0;
      const v1 = values[i + 1] ?? 0;
      const t = (week - w0) / (w1 - w0);
      return lerp(v0, v1, t);
    }
  }
  return values[values.length - 1] ?? 0;
}

function buildWeeklySeries(curve: { weeks: number[]; values: number[] }, horizonWeek: number) {
  const maxW = Math.max(0, Math.floor(horizonWeek));
  const weeks: number[] = [];
  const values: number[] = [];
  for (let w = 0; w <= maxW; w++) {
    weeks.push(w);
    values.push(interpolateAt(curve.weeks, curve.values, w));
  }
  return { weeks, values };
}

function getDrugLabel(drugType: DrugTypeKey) {
  return DRUG_TYPES[drugType]?.name ?? drugType;
}

// 터제타파이드 용량(숫자)을 5/10/15mg 곡선 사이에서 선형 보간
function getClinicalCurve(drugType: DrugTypeKey, dose: number) {
  if (drugType === 'WEGOVY') {
    // 표는 2.4mg 기준. 다른 용량도 “참고 곡선”으로 동일 곡선을 사용.
    return CLINICAL_DATA.WEGOVY_24;
  }

  const d = Number(dose);
  const c5 = CLINICAL_DATA.MOUNJARO_5;
  const c10 = CLINICAL_DATA.MOUNJARO_10;
  const c15 = CLINICAL_DATA.MOUNJARO_15;

  if (!Number.isFinite(d)) return c15;
  if (d <= 5) return c5;
  if (d >= 15) return c15;

  if (d <= 10) {
    const t = (d - 5) / 5; // 5->10
    return {
      name: `터제타파이드 ${dose}mg (보간)`,
      weeks: c5.weeks,
      values: c5.values.map((v, i) => lerp(v, c10.values[i] ?? v, t)),
    };
  }

  // 10->15
  const t = (d - 10) / 5;
  return {
    name: `터제타파이드 ${dose}mg (보간)`,
    weeks: c10.weeks,
    values: c10.values.map((v, i) => lerp(v, c15.values[i] ?? v, t)),
  };
}

function formatTemplate(template: string, vars: Record<string, string>) {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, v);
  }
  return out;
}

function computeGoalWeek(args: { weeks: number[]; predictedLossPct: number[]; targetLossPct: number }) {
  const { weeks, predictedLossPct, targetLossPct } = args;
  for (let i = 0; i < weeks.length; i++) {
    if (predictedLossPct[i] <= targetLossPct) return weeks[i];
  }
  return null as number | null;
}

function computeStage(args: {
  currentWeek: number;
  goalWeek: number | null;
  stopWeek: number | null;
  drugTypeLabel: string;
  budgetLabel: string;
}): StageResult {
  const { currentWeek, goalWeek, stopWeek, drugTypeLabel, budgetLabel } = args;

  // PDF 기준
  // 적응기: 0~4
  // 감량기: 5 ~ (목표도달 - 8주)
  // 가교기: (목표 - 8주) ~ 투약 종료
  // 유지기: 투약 종료 ~ 종료 + 12주

  const w = currentWeek;
  const safeGoal = goalWeek ?? null;
  const safeStop = stopWeek ?? (safeGoal ?? null);

  const bridgeStart = safeGoal != null ? Math.max(0, safeGoal - 8) : null;
  const lossEnd = bridgeStart != null ? Math.max(5, bridgeStart) : 9999;

  const phaseVars = {
    drugType: drugTypeLabel,
    budget: budgetLabel,
  };

  if (w >= 0 && w <= 4) {
    const s = STAGES.find(x => x.phase === 'adaptation') ?? STAGES[0];
    return {
      phase: s.phase,
      name: s.name,
      icon: s.icon,
      color: s.color,
      start: 0,
      end: 4,
      msg: formatTemplate(s.msgTemplate, phaseVars),
    };
  }

  if (w >= 5 && w < lossEnd) {
    const s = STAGES.find(x => x.phase === 'loss') ?? STAGES[1];
    return {
      phase: s.phase,
      name: s.name,
      icon: s.icon,
      color: s.color,
      start: 5,
      end: lossEnd,
      msg: formatTemplate(s.msgTemplate, phaseVars),
    };
  }

  if (bridgeStart != null && w >= bridgeStart && (safeStop == null || w <= safeStop)) {
    const s = STAGES.find(x => x.phase === 'bridge') ?? STAGES[2];
    return {
      phase: s.phase,
      name: s.name,
      icon: s.icon,
      color: s.color,
      start: bridgeStart,
      end: safeStop ?? bridgeStart,
      msg: formatTemplate(s.msgTemplate, phaseVars),
    };
  }

  if (safeStop != null && w >= safeStop) {
    const s = STAGES.find(x => x.phase === 'maintenance') ?? STAGES[3];
    return {
      phase: s.phase,
      name: s.name,
      icon: s.icon,
      color: s.color,
      start: safeStop,
      end: safeStop + 12,
      msg: formatTemplate(s.msgTemplate, phaseVars),
    };
  }

  const s = STAGES.find(x => x.phase === 'loss') ?? STAGES[1];
  return {
    phase: s.phase,
    name: s.name,
    icon: s.icon,
    color: s.color,
    start: 5,
    end: lossEnd,
    msg: formatTemplate(s.msgTemplate, phaseVars),
  };
}

export function generatePersonalizedAnalysis(userData: UserData) {
  const startWeight = userData.startWeightBeforeDrug || userData.currentWeight || 1;
  const userLossPctRaw = ((userData.currentWeight - startWeight) / startWeight) * 100;
  const userLossPct = Number(userLossPctRaw.toFixed(1));

  const drugTypeLabel = getDrugLabel(userData.drugType);
  const budgetLabel = (userData.budget as string) || '표준형';

  // 1) 임상 평균 곡선(선택 약물/용량 기준)
  const clinicalCurve = getClinicalCurve(userData.drugType, userData.currentDose);

  // 2) 표시할 horizon 설정
  const horizon = Math.max(72, Math.floor(userData.currentWeek));

  const clinicalWeekly = buildWeeklySeries(clinicalCurve, Math.min(horizon, 72));

  // 72주 이후는 72주 값을 그대로 유지
  const extendedWeeks: number[] = [];
  const extendedClinical: number[] = [];
  const lastClinical = clinicalWeekly.values[clinicalWeekly.values.length - 1] ?? 0;

  for (let w = 0; w <= horizon; w++) {
    extendedWeeks.push(w);
    if (w <= clinicalWeekly.weeks[clinicalWeekly.weeks.length - 1]) {
      extendedClinical.push(clinicalWeekly.values[w] ?? lastClinical);
    } else {
      extendedClinical.push(lastClinical);
    }
  }

  // 3) 개인 곡선: 임상 곡선의 형태 유지 + 현재 감량률에 맞춰 스케일링
  const clinicalAtCurrent = interpolateAt(clinicalCurve.weeks, clinicalCurve.values, userData.currentWeek);
  const scale =
    clinicalAtCurrent === 0 ? 1 : clamp(userLossPct / clinicalAtCurrent, 0.3, 2.0);

  const predictedLossPct = extendedClinical.map((v) => Number((v * scale).toFixed(2)));

  // 4) 목표 도달 주차 추정
  const targetLossPct = ((userData.targetWeight - startWeight) / startWeight) * 100;
  const goalWeek = computeGoalWeek({
    weeks: extendedWeeks,
    predictedLossPct,
    targetLossPct,
  });

  // 5) 투약 종료 주차: 입력이 없으므로 목표 도달 주차를 종료로 가정
  const stopWeek = goalWeek;

  // 6) 현재 단계 계산(PDF 기준)
  const currentStage = computeStage({
    currentWeek: userData.currentWeek,
    goalWeek,
    stopWeek,
    drugTypeLabel,
    budgetLabel,
  });

  // 7) 비교 문구(현재 주차 기준)
  const diffPct = Number((userLossPct - clinicalAtCurrent).toFixed(1));

  const drugConfig = DRUG_TYPES[userData.drugType];

  return {
    // 기존 UI 호환
    userLossPct,
    currentStage,
    statusCard: {
      stageName: currentStage.name,
      weekText: `${userData.currentWeek}주차`,
      drugInfo: `${drugConfig.name} ${userData.currentDose}mg`,
      budget: budgetLabel,
      mainConcern: userData.mainConcern,
      comparison: `동일 주차 기준, ${drugTypeLabel} 평균 대비 ${Math.abs(diffPct)}%p ${diffPct <= 0 ? '아래' : '위'}`,
    },
    gps: [
      { label: 'G Drug', value: `${drugConfig.name} ${userData.currentDose}mg`, status: 'normal' },
      { label: 'P Protein', value: userData.muscleMass, status: userData.muscleMass === '이하' ? 'attention' : 'normal' },
      { label: 'S Strength', value: userData.exercise, status: userData.exercise === '안 함' ? 'attention' : 'normal' },
    ],
    roiSummary: `현재 예산 전략(${budgetLabel}) 기준, 투약 종료 전후 리바운드 구간에 대비한 가교 전략이 중요합니다.`,

    // 차트용 시계열(신규)
    weeks: extendedWeeks,
    userLossPctSeries: predictedLossPct,

    // 참고값(확인용)
    clinicalAtCurrent: Number(clinicalAtCurrent.toFixed(2)),
    targetLossPct: Number(targetLossPct.toFixed(2)),
    goalWeek,
    stopWeek,
  };
}
