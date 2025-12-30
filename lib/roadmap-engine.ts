import { DRUG_METRICS } from './drug-config';

export interface UserInput {
  drugType: 'SEMAGLUTIDE' | 'TIRZEPATIDE';
  gender: 'male' | 'female';
  age: number;
  currentWeight: number;
  currentDose: number;
}

export const generatePersonalizedRoadmap = (input: UserInput) => {
  const config = DRUG_METRICS[input.drugType];
  const maintenanceDose = config.maintenanceDose;
  const weekInterval = input.age >= 65 ? 6 : 4; // 고령자 6주, 일반 4주 주기 (데이터 기반 안전 가이드)

  let relevantSteps: number[] = [];

  if (input.currentDose > maintenanceDose) {
    // 1. 감량(Tapering) 시나리오: 현재 용량이 유지 용량보다 높은 경우
    // 현재 용량부터 유지 용량까지 역순으로 배열 생성
    const steps = [...config.steps].reverse();
    relevantSteps = steps.filter(dose => dose <= input.currentDose && dose >= maintenanceDose);
  } else if (input.currentDose < maintenanceDose) {
    // 2. 증량 시나리오: 현재 용량이 아직 유지 용량에 도달하지 못한 경우
    relevantSteps = config.steps.filter(dose => dose >= input.currentDose && dose <= maintenanceDose);
  } else {
    // 3. 유지 시나리오: 이미 유지 용량인 경우
    relevantSteps = [maintenanceDose];
  }

  // 주차별 상세 데이터 생성
  const roadmap = relevantSteps.map((dose, index) => {
    const relativeWeek = index * weekInterval;
    const isMaintenance = dose === maintenanceDose;

    return {
      week: relativeWeek === 0 ? "이번 주" : `D+${relativeWeek}주`,
      weekNum: relativeWeek,
      dose: dose,
      unit: config.unit,
      phase: isMaintenance ? '유지 관리기' : '조정기',
      description: isMaintenance 
        ? "대사 안정화 및 근육 보존 집중 단계 (HMB 병용 권장)" 
        : "신체 적응 및 안전한 용량 하향 단계",
      isHmbRecommended: isMaintenance
    };
  });

  // 유지기가 리스트에 포함되지 않은 경우(특수 상황)를 대비해 마지막에 유지기 설명 추가
  if (roadmap.length > 0 && roadmap[roadmap.length - 1].dose !== maintenanceDose) {
    const lastWeek = roadmap[roadmap.length - 1].weekNum + weekInterval;
    roadmap.push({
      week: `D+${lastWeek}주`,
      weekNum: lastWeek,
      dose: maintenanceDose,
      unit: config.unit,
      phase: '유지 관리기',
      description: "장기 대사 안정화 단계",
      isHmbRecommended: true
    });
  }

  return {
    drugName: config.name,
    roadmap: roadmap,
    maintenanceDose: maintenanceDose,
    nextStep: roadmap.length > 1 ? roadmap[1] : null
  };
};
