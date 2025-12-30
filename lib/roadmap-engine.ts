// /lib/roadmap-engine.ts

import { DRUG_TYPES } from './drug-config'; // 1. 명칭 수정

interface UserData {
  drugType: 'SEMAGLUTIDE' | 'TIRZEPATIDE';
  currentDose: number;
  age: number;
  gender: 'male' | 'female';
  weight: number;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  // 2. DRUG_CONFIG를 DRUG_TYPES로 변경하여 데이터 참조
  const drugInfo = DRUG_TYPES[userData.drugType]; 
  const { name, unit, steps } = drugInfo;

  // 로드맵 생성 논리 (터제타파이드 및 세마글루타이드 맞춤형)
  const roadmap = steps.map((dose, index) => {
    const isMaintenance = dose >= drugInfo.maintenanceDose;
    return {
      week: (index + 1) * 4,
      dose: dose,
      phase: isMaintenance ? "유지 단계" : "증량 단계",
      label: `${dose}${unit}`,
      // 대사 가교(Metabolic Bridge)를 위한 가이드 예시
      guidance: isMaintenance 
        ? "근육량 보존을 위한 단백질 섭취 강화" 
        : "약물 적응 및 부작용 모니터링"
    };
  });

  return {
    drugName: name, // '터제타파이드' 또는 '세마글루타이드'
    roadmap: roadmap,
    userData: userData
  };
}