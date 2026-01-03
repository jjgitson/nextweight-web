// /lib/drug-config.ts

// 4-Stage Metabolic Bridge 구간 정의
export const STAGES = [
  { phase: 'adaptation', name: '적응기', icon: '💧', start: 0, end: 4.9, color: '#3B82F6', msg: "많은 분들이 이 시기에 충분한 수분 섭취가 몸의 적응을 돕는다고 느낍니다." },
  { phase: 'loss', name: '감량기', icon: '🔥', start: 5, end: 16.9, color: '#10B981', msg: "이 시점에서는 체지방 위주의 감량을 확인하는 것이 성취감을 높이는 데 효과적입니다." },
  { phase: 'bridge', name: '가교기', icon: '🌉', start: 17, end: 36.9, color: '#F59E0B', msg: "많은 사람들이 이 단계에서 근손실 관리가 향후 유지의 핵심임을 인지하기 시작합니다." },
  { phase: 'maintenance', name: '유지기', icon: '🛡️', start: 37, end: 72, color: '#8B5CF6', msg: "이제는 스스로의 루틴만으로도 건강한 대사 체계가 유지된다는 확신을 갖게 되는 시기입니다." }
];

export const CLINICAL_DATA = {
  WEGOVY: {
    name: "Wegovy", // STEP-1 trial (NEJM 2021)
    weeks: [0, 4, 8, 12, 20, 36, 52, 72],
    values: [0, -2.2, -4.0, -6.0, -9.4, -13.3, -15.4, -16.0]
  },
  MOUNJARO: {
    name: "Tirzepatide", // SURMOUNT-1 (NEJM 2022)
    weeks: [0, 4, 8, 12, 20, 36, 52, 72],
    dose: {
      "15mg": [0, -3.8, -7.0, -9.0, -12.0, -19.0, -21.5, -22.5]
    }
  }
};

export const DRUG_TYPES = {
  MOUNJARO: { name: "터제타파이드", steps: [2.5, 5, 7.5, 10, 12.5, 15], unit: "mg" },
  WEGOVY: { name: "위고비", steps: [0.25, 0.5, 1.0, 1.7, 2.4], unit: "mg" }
};
