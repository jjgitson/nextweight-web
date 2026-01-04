export type DrugType = "WEGOVY" | "MOUNJARO";
export type DrugStatus = "PRE" | "ON";

export type BudgetTier = "실속형" | "표준형" | "집중형";
export type MuscleMassTier = "이하" | "표준" | "이상" | "모름";
export type ExerciseTier = "안 함" | "주 1회" | "주 1~2회" | "주 3회 이상";
export type MainConcern = "요요" | "근감소" | "부작용" | "비용" | "정체기" | "기타";

export interface UserData {
  userName?: string;
  userAge?: number;
  userGender?: "남성" | "여성";

  currentWeight: number;
  targetWeight: number;

  drugStatus: DrugStatus;
  drugType: DrugType;
  startWeightBeforeDrug?: number;

  currentDose?: string;
  currentWeek: number;
  startDate?: string;

  muscleMass: MuscleMassTier;
  exercise: ExerciseTier;
  budget: BudgetTier;

  mainConcern: MainConcern;
  resolution?: string;
}

export type StageKey = "ADAPT" | "LOSS" | "BRIDGE" | "MAINTAIN";

export interface StageInfo {
  key: StageKey;
  title: string;
  subtitle: string;
  message: string;
  color: string;
}

export interface AnalysisResult {
  stage: StageInfo;
  percentileText: string;
  headlineQuote: string;
  g: string;
  p: string;
  s: string;

  chart: {
    weeks: number[];
    userSeries: number[];
    clinicalSeries: number[];
    lastValue: number;
    lastWeek: number;
  };
}

type Curve = { name: string; weeks: readonly number[]; values: readonly number[] };

const CLINICAL_DATA: Record<DrugType, Curve[]> = {
  WEGOVY: [
    { name: "위고비 2.4mg", weeks: [0, 4, 8, 12, 20, 36, 52, 72], values: [0, -2.2, -4, -6, -9.4, -13.3, -15.4, -16] },
  ],
  MOUNJARO: [
    { name: "터제타파이드 5mg", weeks: [0, 4, 8, 12, 20, 36, 52, 72], values: [0, -3, -6, -8, -11, -14, -15.5, -16] },
    { name: "터제타파이드 10mg", weeks: [0, 4, 8, 12, 20, 36, 52, 72], values: [0, -3.5, -6.5, -8.5, -11.5, -18, -20.5, -21.4] },
    { name: "터제타파이드 15mg", weeks: [0, 4, 8, 12, 20, 36, 52, 72], values: [0, -3.8, -7, -9, -12, -19, -21.5, -22.5] },
  ],
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function buildWeeklySeries(curve: { weeks: readonly number[]; values: readonly number[] }, horizon: number) {
  const out = new Array(horizon + 1).fill(0).map((_, i) => i);
  const values = out.map((w) => {
    if (w <= curve.weeks[0]) return curve.values[0];
    if (w >= curve.weeks[curve.weeks.length - 1]) return curve.values[curve.values.length - 1];

    for (let i = 0; i < curve.weeks.length - 1; i++) {
      const w0 = curve.weeks[i];
      const w1 = curve.weeks[i + 1];
      if (w >= w0 && w <= w1) {
        const t = (w - w0) / (w1 - w0);
        return lerp(curve.values[i], curve.values[i + 1], t);
      }
    }
    return curve.values[curve.values.length - 1];
  });

  return { weeks: out, values };
}

function pickClinicalCurve(drugType: DrugType, doseLabel?: string): Curve {
  const list = CLINICAL_DATA[drugType];
  if (drugType === "WEGOVY") return list[0];

  if (!doseLabel) return list[list.length - 1];

  const d = doseLabel.replace(/\s/g, "").toLowerCase();
  const has15 = d.includes("15");
  const has10 = d.includes("10");
  const has5 = d.includes("5");

  if (has15) return list.find((x) => x.name.includes("15")) ?? list[list.length - 1];
  if (has10) return list.find((x) => x.name.includes("10")) ?? list[list.length - 1];
  if (has5) return list.find((x) => x.name.includes("5")) ?? list[list.length - 1];

  return list[list.length - 1];
}

function computeStage(userWeek: number, remainingToGoalWeek: number, drugStatus: DrugStatus): StageInfo {
  if (drugStatus === "PRE") {
    return {
      key: "ADAPT",
      title: "준비의 시간",
      subtitle: "프리-브릿지",
      message: "투약 전 근육 저축이 투약 비용을 아낍니다.",
      color: "#F3F4F6",
    };
  }

  if (userWeek <= 4) {
    return {
      key: "ADAPT",
      title: "대사 적응",
      subtitle: "몸의 변화 인지",
      message: "몸이 변화를 받아들이는 중입니다. 무리하지 마세요.",
      color: "#DBEAFE",
    };
  }

  if (remainingToGoalWeek > 8) {
    return {
      key: "LOSS",
      title: "체지방 연소",
      subtitle: "감량기",
      message: "근육은 지키고 지방만 태우는 구간입니다.",
      color: "#D1FAE5",
    };
  }

  if (remainingToGoalWeek >= 0) {
    return {
      key: "BRIDGE",
      title: "대사 가교",
      subtitle: "가장 중요한 전환",
      message: "가장 중요한 시기! 자생 대사 엔진을 켭니다.",
      color: "#FEF3C7",
    };
  }

  return {
    key: "MAINTAIN",
    title: "유지기",
    subtitle: "요요 방어선 완성",
    message: "축하합니다! 건강한 대사 체계가 안착되도록 관리하세요.",
    color: "#EDE9FE",
  };
}

function estimateGoalWeek(currentWeight: number, targetWeight: number, avgWeeklyLossKg = 0.5) {
  const diff = Math.max(0, currentWeight - targetWeight);
  const weeks = diff / avgWeeklyLossKg;
  return Math.max(4, Math.ceil(weeks));
}

function computePercentileText(userData: UserData): string {
  // 단순 규칙 기반 (현재는 UI 문구용)
  const w = Math.max(1, Math.floor(userData.currentWeek));
  const base = userData.drugType === "MOUNJARO" ? 50 : 45;
  const adjBudget = userData.budget === "집중형" ? 10 : userData.budget === "표준형" ? 5 : 0;
  const adjExercise = userData.exercise === "주 3회 이상" ? 8 : userData.exercise === "주 1~2회" ? 4 : 0;
  const adjMuscle = userData.muscleMass === "이하" ? -6 : userData.muscleMass === "이상" ? 4 : 0;

  const p = Math.max(1, Math.min(99, Math.round(base + adjBudget + adjExercise + adjMuscle - Math.min(20, w * 0.2))));
  const label = userData.drugType === "MOUNJARO" ? "터제타파이드" : "위고비";
  return `동일 주차 기준, ${label} 평균 대비 ${p}%p ${p >= 50 ? "위" : "아래"}`;
}

function computeHeadlineQuote(stageKey: StageKey, drugType: DrugType): string {
  if (stageKey === "ADAPT") return `현재 ${drugType === "MOUNJARO" ? "터제타파이드" : "위고비"}에 적응 중입니다. 수분 2L 섭취로 부작용을 관리하세요.`;
  if (stageKey === "LOSS") return "감량 속도가 빠릅니다. 감량 효과를 근육 자산으로 전환할 때입니다.";
  if (stageKey === "BRIDGE") return "약물 농도가 낮아집니다. 예산 전략에 따른 저항성 운동이 핵심입니다!";
  return "이제 스스로 에너지를 태우는 대사 체계가 안착되도록 유지 전략을 이어가세요.";
}

export function generatePersonalizedAnalysis(userData: UserData): AnalysisResult {
  const goalWeek = estimateGoalWeek(userData.currentWeight, userData.targetWeight);
  const userWeek = Math.max(0, Math.floor(userData.currentWeek || 0));
  const remainingToGoalWeek = Math.max(0, goalWeek - userWeek);

  const stage = computeStage(userWeek, remainingToGoalWeek, userData.drugStatus);
  const percentileText = computePercentileText(userData);

  const drugLabel = userData.drugType === "MOUNJARO" ? "터제타파이드" : "위고비";
  const dose = userData.currentDose ? `${userData.currentDose}` : "0mg";
  const g = `${drugLabel} ${dose}`;

  const p = userData.budget === "실속형" ? "단백질 100g/day" : userData.budget === "표준형" ? "HMB 3g + 유청 단백질" : "HMB + Creatine + 고단백";
  const s = userData.exercise === "안 함" ? "안 함" : userData.exercise;

  const clinicalCurve = pickClinicalCurve(userData.drugType, userData.currentDose);
  const horizon = Math.max(72, userWeek);
  const clinicalWeekly = buildWeeklySeries(clinicalCurve, Math.min(horizon, 72));

  // 72주 이후는 72주 값을 유지
  const weeks: number[] = [];
  const clinicalSeries: number[] = [];
  for (let w = 0; w <= horizon; w++) {
    weeks.push(w);
    if (w <= 72) clinicalSeries.push(clinicalWeekly.values[w]);
    else clinicalSeries.push(clinicalWeekly.values[72]);
  }

  // 사용자 예측은 임상 평균 기반으로, 근육/운동/예산에 따른 작은 보정
  const adjMuscle = userData.muscleMass === "이하" ? 0.92 : userData.muscleMass === "이상" ? 1.04 : 1.0;
  const adjExercise = userData.exercise === "주 3회 이상" ? 1.06 : userData.exercise === "주 1~2회" ? 1.03 : 1.0;
  const adjBudget = userData.budget === "집중형" ? 1.05 : userData.budget === "표준형" ? 1.02 : 0.98;

  const userSeries = clinicalSeries.map((v) => v * adjMuscle * adjExercise * adjBudget);

  const lastWeek = weeks[weeks.length - 1];
  const lastValue = userSeries[userSeries.length - 1];

  return {
    stage,
    percentileText,
    headlineQuote: computeHeadlineQuote(stage.key, userData.drugType),
    g,
    p,
    s,
    chart: {
      weeks,
      userSeries,
      clinicalSeries,
      lastValue,
      lastWeek,
    },
  };
}
