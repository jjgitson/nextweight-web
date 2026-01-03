// /lib/roadmap-engine.ts
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

type Curve = {
  name: string;
  weeks: readonly number[];
  values: readonly number[];
};

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

function interpolateAt(weeks: readonly number[], values: readonly number[], week: number) {
  if (weeks.length === 0) return 0;

  const firstW = weeks[0] ?? 0;
  const lastW = weeks[weeks.length - 1] ?? 0;

  if (week <= firstW) return Number(values[0] ?? 0);
  if (week >= lastW) return Number(values[values.length - 1] ?? 0);

  for (let i = 0; i < weeks.length - 1; i++) {
    const w0 = Number(weeks[i]);
    const w1 = Number(weeks[i + 1]);
    if (week >= w0 && week <= w1) {
      const v0 = Number(values[i] ?? 0);
      const v1 = Number(values[i + 1] ?? 0);
      const t = (week - w0) / (w1 - w0);
      return lerp(v0, v1, t);
    }
  }

  return Number(values[values.length - 1] ?? 0);
}

function buildWeeklySeries(curve: Curve, horizonWeek: number) {
  // readonly 배열을 내부에서 안전하게 다루기 위해 복사
  const weeksSrc = Array.from(curve.weeks);
  const valuesSrc = Array.from(curve.values);

  const maxW = Math.max(0, Math.floor(horizonWeek));
  const weeks: number[] = [];
  const values: number[] = [];

  for (let w = 0; w <= maxW; w++) {
    weeks.push(w);
    values.push(interpolateAt(weeksSrc, valuesSrc, w));
  }

  return { weeks, values };
}

function getDrugLabel(drugType: DrugTypeKey) {
  return DRUG_TYPES[drugType]?.name ?? drugType;
}

// 터제타파이드 용량을 5/10/15mg 곡선 사이에서 선형 보간
function getClinicalCurve(drugType: DrugTypeKey, dose: number): Curve {
  if (drugType === 'WEGOVY') return CLINICAL_DATA.WEGOVY_24;

  const d = Number(dose);
  const c5 = CLINICAL_DATA.MOUNJARO_5;
  const c10 = CLINICAL_DATA.MOUNJARO_10;
  const c15 = CLINICAL_DATA.MOUNJARO_15;

  if (!Number.isFinite(d)) return c15;
  if (d <= 5) return c5;
  if (d >= 15) return c15;

  const baseWeeks = c5.weeks; // 모두 동일한 주차 구조라고 가정(표 기준)

  if (d <= 10) {
    const t = (d - 5) / 5;
    const values = baseWeeks.map((_, i) => lerp(Number(c5.values[i]), Number(c10.values[i]), t));
    return { name: `터제타파이드 ${dose}mg (보간)`, weeks: baseWeeks, values };
  }

  const t = (d - 10) / 5;
  const values = baseWeeks.map((_, i) => lerp(Number(c10.values[i]), Number(c15.values[i]), t));
  return { name: `터제타파이드 ${dose}mg (보간)`, weeks: baseWeeks, values };
}

function formatTemplate(template: string, vars: Record<string, string>) {
  let out = template;
  for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, v);
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

  const vars = { drugType: drugTypeLabel, budget: budgetLabel };

  if (w >= 0 && w <= 4) {
    const s = STAGES.find(x => x.phase === 'adaptation') ?? STAGES[0];
    return { phase: s.phase, name: s.name, icon: s.icon, color: s.color, start: 0, end: 4, msg: formatTemplate(s.msgTemplate, vars) };
  }

  if (w >= 5 && w < lossEnd) {
    const s = STAGES.find(x => x.phase === 'loss') ?? STAGES[1];
    return { phase: s.phase, name: s.name, icon: s.icon, color: s.color, start: 5, end: lossEnd, msg: formatTemplate(s.msgTemplate, vars) };
  }

  if (bridgeStart != null && w >= bridgeStart && (safeStop == null || w <= safeStop)) {
    const s = STAGES.find(x => x.phase === 'bridge') ?? STAGES[2];
    return { phase: s.phase, name: s.name, icon: s.icon, color: s.color, start: bridgeStart, end: safeStop ?? bridgeStart, msg: formatTemplate(s.msgTemplate, vars) };
  }

  if (safeStop != null && w >= safeStop) {
    const s = STAGES.find(x => x.phase === 'maintenance') ?? STAGES[3];
    return { phase: s.phase, name: s.name, icon: s.icon, color: s.color, start: safeStop, end: safeStop + 12, msg: formatTemplate(s.msgTemplate, vars) };
  }

  const s = STAGES.find(x => x.phase === 'loss') ?? STAGES[1];
  return { phase: s.phase, name: s.name, icon: s.icon, color: s.color, start: 5, end: lossEnd, msg: formatTemplate(s.msgTemplate, vars) };
}

export function generatePersonalizedAnalysis(userData: UserData) {
  const startWeight = userData.startWeightBeforeDrug || userData.currentWeight || 1;

  const userLossPctRaw = ((userData.currentWeight - startWeight) / startWeight) * 100;
  const userLossPct = Number(userLossPctRaw.toFixed(1));

  const drugTypeLabel = getDrugLabel(userData.drugType);
  const budgetLabel = (userData.budget as string) || '표준형';

  // 1) 임상 평균 곡선(약물/용량)
  const clinicalCurve = getClinicalCurve(userData.drugType, userData.currentDose);

  // 2) horizon
  const horizon = Math.max(72, Math.floor(userData.currentWeek));

  const clinicalWeekly = buildWeeklySeries(clinicalCurve, Math.min(horizon, 72));

  // 72주 이후는 72주 값을 유지
  const extendedWeeks: number[] = [];
  const extendedClinical: number[] = [];
  const lastClinical = clinicalWeekly.values[clinicalWeekly.values.length - 1] ?? 0;

  for (let w = 0; w <= horizon; w++) {
    extendedWeeks.push(w);
    if (w <= (clinicalWeekly.weeks[clinicalWeekly.weeks.length - 1] ?? 72)) {
      extendedClinical.push(clinicalWeekly.values[w] ?? lastClinical);
    } else {
      extendedClinical.push(lastClinical);
    }
  }

  // 3) 개인 곡선: 임상 곡선 형태 유지 + 현재 값 기준 스케일링
  const clinicalAtCurrent = interpolateAt(clinicalCurve.weeks, clinicalCurve.values, userData.currentWeek);
  const scale = clinicalAtCurrent === 0 ? 1 : clamp(userLossPct / clinicalAtCurrent, 0.3, 2.0);

  const userLossPctSeries = extendedClinical.map((v) => Number((v * scale).toFixed(2)));

  // 4) 목표 도달 주차 추정
  const targetLossPct = ((userData.targetWeight - startWeight) / startWeight) * 100;
  const goalWeek = computeGoalWeek({
    weeks: extendedWeeks,
    predictedLossPct: userLossPctSeries,
    targetLossPct,
  });

  // 5) 투약 종료 주차: 목표 도달을 종료로 가정
  const stopWeek = goalWeek;

  // 6) 단계
  const currentStage = computeStage({
    currentWeek: userData.currentWeek,
    goalWeek,
    stopWeek,
    drugTypeLabel,
    budgetLabel,
  });

  // 7) 비교 문구
  const diffPct = Number((userLossPct - clinicalAtCurrent).toFixed(1));
  const drugConfig = DRUG_TYPES[userData.drugType];

  return {
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

    // 차트용
    weeks: extendedWeeks,
    userLossPctSeries,

    // 디버그/확인용
    clinicalAtCurrent: Number(clinicalAtCurrent.toFixed(2)),
    targetLossPct: Number(targetLossPct.toFixed(2)),
    goalWeek,
    stopWeek,
  };
}
