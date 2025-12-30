// /lib/roadmap-engine.ts
import { DRUG_TYPES } from './drug-config';

interface UserData {
  drugType: 'SEMAGLUTIDE' | 'TIRZEPATIDE';
  currentDose: number;
  age: number;
  gender: 'male' | 'female';
  weight: number;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  // 기존 DRUG_CONFIG 대신 DRUG_TYPES를 사용합니다.
  const drugInfo = DRUG_TYPES[userData.drugType]; 
  
  if (!drugInfo) {
    throw new Error("Invalid drug type");
  }

  const { name, unit, steps } = drugInfo;

  const roadmap = steps.map((dose, index) => {
    const isMaintenance = dose >= drugInfo.maintenanceDose;
    return {
      week: (index + 1) * 4,
      dose: dose,
      phase: isMaintenance ? "유지 단계" : "증량 단계",
      label: `${dose}${unit}`,
      guidance: isMaintenance 
        ? "근육량 보존을 위한 단백질 섭취 및 HMB 가이드 준수" 
        : "약물 적응 및 부작용 모니터링"
    };
  });

  return {
    drugName: name,
    roadmap: roadmap,
    userData: userData
  };
}