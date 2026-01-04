// /lib/roadmap-engine.ts

export type DrugType = "MOUNJARO" | "WEGOVY";

export interface UserData {
  userName: string;
  userAge: number;
  userGender: string;

  currentWeight: number;
  targetWeight: number;
  startWeightBeforeDrug: number;

  drugType: DrugType;
  currentDose: number;
  currentWeek: number;
  drugStatus: string;

  budget: string;
  muscleMass: string;
  exercise: string;
  mainConcern: string;
  resolution?: string;

  // 신규 필드
  startDate?: string;
  weekMode?: string;
}

type Stage = {
  phase: string;
  name: string;
  start: number;
  end: number;
  color: string;
  msg: string;
};

type ChartPoint = {
  week: number;
  value: number;
};

const CLINICAL_CURVES: Record<string, { weeks: number[]; values: number[] }> = {
  WEGOVY_24: {
    weeks: [0, 4, 8, 12, 20, 36, 52, 72],
    values: [0, -2.2, -4, -6, -9.4, -13.3, -15.4, -16],
  },
  MOUNJARO_5: {
    weeks: [0, 4, 8, 12, 20, 36, 52, 72],
    values: [0, -3, -6, -8, -11, -14, -15.5, -16],
  },
  MOUNJARO_10: {
    weeks: [0, 4, 8, 12, 20, 36, 52, 72],
    values: [0, -3.5, -6.5, -8.5, -11.5, -18, -20.5, -21.4],
  },
  MOUNJARO_15: {
    weeks: [0, 4, 8, 12, 20, 36, 52, 72],
    values: [0, -3.8, -7, -9, -12, -19, -21.5, -22.5],
  },
};

function buildWeeklySeries(curve: { weeks: number[]; values: number[] }, maxWeek: number) {
  const result: ChartPoint[] = [];
  for (let w = 0; w <= maxWeek; w++) {
    let idx = curve.weeks.findIndex((v) => v >= w);
    if (idx === -1) idx = curve.weeks.length - 1;
    const val = curve.values[idx];
    result.push({ week: w, value: val });
  }
  return result;
}

function pickClinicalCurve(user: UserData) {
  if (user.drugType === "WEGOVY") return CLINICAL_CURVES.WEGOVY_24;
  if (user.currentDose >= 15) return CLINICAL_CURVES.MOUNJARO_15;
  if (user.currentDose >= 10) return CLINICAL_CURVES.MOUNJARO_10;
  return CLINICAL_CURVES.MOUNJARO_5;
}

function buildStages(): Stage[] {
  return [
    {
      phase: "early",
      name: "적응기",
      start: 0,
      end: 4,
      color: "#3B82F6",
      msg: "몸이 약물에 적응하는 시기입니다. 수분 섭취와 가벼운 활동에 집중하세요.",
    },
    {
      phase: "loss",
      name: "감량기",
      start: 5,
      end: 16,
      color: "#10B981",
      msg: "감량 효과가 본격화됩니다. 단백질과 근력운동을 병행하세요.",
    },
    {
      phase: "bridge",
      name: "가교기",
      start: 17,
      end: 36,
      color: "#F59E0B",
      msg: "약물 의존에서 벗어나 대사 전환을 설계해야 할 시점입니다.",
    },
    {
      phase: "maintain",
      name: "유지기",
      start: 37,
      end: 72,
      color: "#8B5CF6",
      msg: "요요 방어선 완성 단계입니다. 생활 패턴을 고정화하세요.",
    },
  ];
}

function getCurrentStage(week: number, stages: Stage[]) {
  return stages.find((s) => week >= s.start && week <= s.end) || stages[0];
}

export function generatePersonalizedAnalysis(user: UserData) {
  const horizon = Math.min(72, Math.max(1, Math.floor(user.currentWeek)));
  const clinical = pickClinicalCurve(user);
  const chartData = buildWeeklySeries(clinical, horizon);

  const stages = buildStages();
  const currentStage = getCurrentStage(horizon, stages);

  return {
    chartData,
    currentStage,
    statusCard: {
      comparison: "평균 곡선과 유사한 속도",
    },
    gps: [
      { label: "GLP-1", value: user.drugType === "MOUNJARO" ? "마운자로" : "위고비", status: "good" },
      { label: "Protein", value: "100g/day", status: user.muscleMass === "이하" ? "attention" : "good" },
      { label: "Strength", value: user.exercise || "미입력", status: user.exercise === "안 함" ? "attention" : "good" },
    ],
  };
}
