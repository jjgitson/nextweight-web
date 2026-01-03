// /lib/drug-config.ts

// 4단계 스테이지 정의
export const STAGES = [
  { phase: 'adaptation', name: '적응기', icon: '💧', start: 0, end: 4, color: '#3B82F6', msg: "많은 분들이 이 시기에 충분한 수분 섭취가 몸의 적응을 돕는다고 느낍니다." },
  { phase: 'loss', name: '감량기', icon: '🔥', start: 4, end: 16, color: '#10B981', msg: "이 시점에서는 체지방 위주의 감량을 확인하는 것이 성취감을 높이는 데 효과적입니다." },
  { phase: 'bridge', name: '가교기', icon: '🌉', start: 16, end: 36, color: '#F59E0B', msg: "많은 사람들이 이 단계에서 근손실 관리가 향후 유지의 핵심임을 인지하기 시작합니다." },
  { phase: 'maintenance', name: '유지기', icon: '🛡️', start: 36, end: 72, color: '#8B5CF6', msg: "이제는 스스로의 루틴만으로도 건강한 대사 체계가 유지된다는 확신을 갖게 되는 시기입니다." }
];

export const CLINICAL_DATA = {
  WEGOVY: {
    name: "위고비", // STEP-1 (NEJM 2021)
    weeks: [0, 4, 8, 12, 16, 20, 28, 36, 44, 52, 60, 68],
    values: [0, -2.2, -4.0, -6.0, -7.8, -9.4, -11.7, -13.3, -14.6, -15.4, -15.9, -15.5]
  },
  MOUNJARO: {
    name: "터제타파이드", // SURMOUNT-1 (NEJM 2022)
    weeks: [0, 4, 8, 12, 16, 20, 24, 36, 48, 60, 72],
    dose: {
      "15mg": [0, -3.8, -7.0, -9.0, -10.5, -12.0, -14.5, -19.0, -21.0, -22.0, -22.5]
    }
  }
};

// 빌드 에러 해결: DRUG_TYPES 명시적 export
export const DRUG_TYPES = {
  MOUNJARO: { name: "터제타파이드", steps: [2.5, 5, 7.5, 10, 12.5, 15], unit: "mg" },
  WEGOVY: { name: "위고비", steps: [0.25, 0.5, 1.0, 1.7, 2.4], unit: "mg" }
};
