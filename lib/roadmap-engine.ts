// /lib/roadmap-engine.ts
import { DRUG_TYPES } from './drug-config';

export interface UserData {
  userName: string;
  userAge: number;
  userGender: string;
  currentWeight: number; // 기존 weight에서 수정됨
  targetWeight: number;
  drugStatus: string;
  drugType: keyof typeof DRUG_TYPES;
  currentDose: number;
  budget: string;
  muscleMass: string;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  const drug = DRUG_TYPES[userData.drugType];
  
  if (!drug) {
    throw new Error("Invalid drug type");
  }

  // 지침서 기반 맞춤 메시지 (5% 규칙 및 근감소성 비만 예방)
  let personalizedMessage = "";
  const targetLossForFivePercent = userData.currentWeight * 0.05;

  if (userData.userAge >= 65) {
    personalizedMessage = "65세 이상 연령층은 단순 체중 감소보다 근육 보존을 통한 삶의 질 유지가 최우선입니다. 고강도 유산소보다는 저항성 운동(근력) 비중을 60% 이상으로 유지하세요.";
  } else if (userData.muscleMass === '이하') {
    personalizedMessage = `현재 골격근량이 부족하여 '근감소성 비만' 위험이 있습니다. ${targetLossForFivePercent.toFixed(1)}kg 감량 시점마다 인바디 측정을 통해 근육량 변화를 반드시 확인하세요.`;
  } else {
    personalizedMessage = `${userData.userName}님, 대한비만학회 2024 지침에 따른 안전한 대사 가교 로드맵입니다.`;
  }

  // 임상 데이터를 기반으로 로드맵 생성
  const roadmap = drug.clinicalData.map((c, i) => ({
    weekNum: c.week,
    // 에러 수정: userData.weight -> userData.currentWeight
    weight: (userData.currentWeight * (1 + c.percent / 100)).toFixed(1),
    dose: drug.steps[Math.min(i, drug.steps.length - 1)],
    label: `${c.week}주`
  }));

  return { 
    personalizedMessage, 
    roadmap,
    drugName: drug.name,
    references: drug.references
  };
}
