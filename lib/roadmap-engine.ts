// /lib/roadmap-engine.ts
import { DRUG_TYPES } from './drug-config';

export interface UserData {
  userName: string;
  userAge: number;
  userGender: string;
  currentWeight: number;
  targetWeight: number;
  drugStatus: string;
  drugType: keyof typeof DRUG_TYPES;
  currentDose: number;
  budget: string;
  muscleMass: string;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  const drug = DRUG_TYPES[userData.drugType];
  
  // 지침서 기반 맞춤 메시지 (5% 규칙 및 근감소성 비만 예방)
  let personalizedMessage = "";
  const targetLoss = userData.currentWeight * 0.05; // 5% 감량 수치

  if (userData.userAge >= 65) {
    personalizedMessage = "65세 이상 연령층은 체중 감소보다 근육 보존을 통한 삶의 질 유지가 최우선입니다. 고강도 운동보다는 저항성 운동에 집중하세요.";
  } else if (userData.muscleMass === '이하') {
    personalizedMessage = `현재 근육량이 부족하여 근감소성 비만 위험이 있습니다. ${targetLoss.toFixed(1)}kg 감량 시점마다 근육량을 꼭 체크하세요.`;
  } else {
    personalizedMessage = `${userData.userName}님, 대한비만학회 지침에 따른 안전한 대사 가교 로드맵입니다.`;
  }

  const roadmap = drug.clinicalData.map((c, i) => ({
    week: c.week,
    weight: (userData.weight * (1 + c.percent / 100)).toFixed(1),
    dose: drug.steps[Math.min(i, drug.steps.length - 1)]
  }));

  return { personalizedMessage, roadmap };
}
