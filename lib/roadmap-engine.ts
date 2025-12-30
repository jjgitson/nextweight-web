import { DRUG_METRICS } from './drug-config';

export interface UserInput {
  drugType: 'SEMAGLUTIDE' | 'TIRZEPATIDE';
  gender: 'male' | 'female';
  age: number;
  currentWeight: number;
  currentDose: number; // 사용자가 입력한 현재 투여량
}

export const generatePersonalizedRoadmap = (input: UserInput) => {
  const config = DRUG_METRICS[input.drugType];
  const weekInterval = input.age >= 65 ? 6 : 4; // 고령자 6주, 일반 4주 주기

  // 1. 해당 약물의 표준 단계 중 현재 용량 이후의 단계만 필터링
  // 현재 용량부터 유지기(Maintenance)까지의 경로를 생성
  const remainingSteps = config.steps.filter(dose => dose >= input.currentDose);

  // 2. 주차별 상세 데이터 생성
  const roadmap = remainingSteps.map((dose, index) => {
    const relativeWeek = index * weekInterval;
    const isMaintenance = dose <= config.maintenanceDose;

    return {
      week: relativeWeek === 0 ? "이번 주" : `D+${relativeWeek}주`,
      weekNum: relativeWeek,
      dose: dose,
      unit: config.unit,
      phase: isMaintenance ? '유지 관리기' : '조정기',
      description: isMaintenance 
        ? "대사 안정화 및 근육 보존 집중 단계" 
        : "신체 적응 및 용량 최적화 단계",
      isHmbRecommended: isMaintenance // 유지기 진입 시 HMB 추천 플래그
    };
  });

  return {
    drugName: config.name,
    roadmap: roadmap,
    maintenanceDose: config.maintenanceDose,
    nextStep: roadmap.length > 1 ? roadmap[1] : null // 다음 증량/감량 단계
  };
};
