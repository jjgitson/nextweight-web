// /lib/roadmap-engine.ts
import { DRUG_TYPES } from './drug-config';

interface UserData {
  userName: string;
  userAge: number;
  userGender: string;
  currentWeight: number;
  targetWeight: number;
  drugStatus: string;
  drugType: keyof typeof DRUG_TYPES;
  currentDose: number;
  duration: string;
  muscleMass: string;
  exercise: string;
  budget: string;
  mainConcern: string;
  resolution: string;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  const drugInfo = DRUG_TYPES[userData.drugType]; 
  
  if (!drugInfo) {
    throw new Error("Invalid drug type");
  }

  const { name, unit, steps } = drugInfo;

  const roadmap = steps.map((dose, index) => {
    return {
      weekNum: (index + 1) * 4,
      dose: dose,
      phase: dose >= drugInfo.maintenanceDose ? "유지 관리기" : "증량 단계",
      label: `${dose}${unit}`,
      // 마스터 시트 Bridge Engine 로직 반영
      guidance: dose <= 5 ? "적응기: 수분 및 식단 적응" : "관리기: 근육 손실 방어 집중"
    };
  });

  return {
    drugName: name,
    roadmap: roadmap,
    userData: userData
  };
}
