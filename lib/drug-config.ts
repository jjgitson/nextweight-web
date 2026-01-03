// /lib/drug-config.ts
export const CLINICAL_WEEKS = [0, 4, 8, 12, 20, 36, 52, 72];

export interface MounjaroPoint {
  week: number; placebo: number; mg5: number; mg10: number; mg15: number;
}

export interface WegovyPoint {
  week: number; placebo: number; mg24: number;
}

export interface Stage {
  phase: string;
  name: string;
  icon: string;
  color: string;
  start: number;
  end: number;
  msg: string;
  actionTooltip: string;
}

export const STAGES: Stage[] = [
  { phase: 'adaptation', name: '적응기', icon: '💧', start: 0, end: 4, color: '#3B82F6', msg: "많은 분들이 이 시기에 충분한 수분 섭취가 몸의 적응을 돕는다고 느낍니다.", actionTooltip: "수분 섭취와 가벼운 산책이 몸의 적응을 돕는 시기입니다." },
  { phase: 'loss', name: '감량기', icon: '🔥', start: 4, end: 16, color: '#10B981', msg: "이 시점에서는 체지방 위주의 감량을 확인하는 것이 성취감을 높이는 데 효과적입니다.", actionTooltip: "단백질 위주의 식단이 체지방 연소 효율을 높인다고 합니다." },
  { phase: 'bridge', name: '가교기', icon: '🌉', start: 16, end: 36, color: '#F59E0B', msg: "많은 사람들이 이 단계에서 근손실 관리가 향후 유지의 핵심임을 인지하기 시작합니다.", actionTooltip: "저항성 운동이 대사율 저하를 막는 승부처입니다." },
  { phase: 'maintenance', name: '유지기', icon: '🛡️', start: 36, end: 72, color: '#8B5CF6', msg: "이제는 스스로의 루틴만으로도 건강한 대사 체계가 유지된다는 확신을 갖게 되는 시기입니다.", actionTooltip: "약물 없이도 스스로 체중을 방어하는 대사 엔진이 완성된 시기입니다." }
];

export const DRUG_TYPES = {
  MOUNJARO: {
    name: "터제타파이드",
    steps: [2.5, 5, 7.5, 10, 12.5, 15],
    unit: "mg",
    clinicalData: [
      { week: 0, placebo: 0, mg5: 0, mg10: 0, mg15: 0 },
      { week: 4, placebo: -1, mg5: -3, mg10: -3.5, mg15: -3.8 },
      { week: 8, placebo: -1.6, mg5: -6, mg10: -6.5, mg15: -7 },
      { week: 12, placebo: -2, mg5: -8, mg10: -8.5, mg15: -9 },
      { week: 20, placebo: -2.7, mg5: -11, mg10: -11.5, mg15: -12 },
      { week: 36, placebo: -3, mg5: -14, mg10: -18, mg15: -19 },
      { week: 52, placebo: -3.2, mg5: -15.5, mg10: -20.5, mg15: -21.5 },
      { week: 72, placebo: -2.4, mg5: -16, mg10: -21.4, mg15: -22.5 }
    ] as MounjaroPoint[]
  },
  WEGOVY: {
    name: "위고비",
    steps: [0.25, 0.5, 1.0, 1.7, 2.4],
    unit: "mg",
    clinicalData: [
      { week: 0, placebo: 0, mg24: 0 },
      { week: 4, placebo: -1, mg24: -2.2 },
      { week: 8, placebo: -1.6, mg24: -4 },
      { week: 12, placebo: -2, mg24: -6 },
      { week: 20, placebo: -2.7, mg24: -9.4 },
      { week: 36, placebo: -3, mg24: -13.3 },
      { week: 52, placebo: -3.2, mg24: -15.4 },
      { week: 72, placebo: -2.4, mg24: -16.0 }
    ] as WegovyPoint[]
  }
};
