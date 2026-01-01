// lib/roadmap-engine.ts
import { DRUG_TYPES } from './drug-config';

export interface UserData {
  userName: string;
  userAge: number;
  userGender: string;
  currentWeight: number; 
  targetWeight: number;
  drugType: keyof typeof DRUG_TYPES;
  budget: string;
  muscleMass: string;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  const drug = DRUG_TYPES[userData.drugType];
  if (!drug) throw new Error("Invalid drug type");

  // 대사 가교 포인트 설정
  const totalLossGoal = userData.currentWeight - userData.targetWeight;
  
  const roadmap = drug.clinicalData.map((c, i) => {
    const isBridgePhase = c.week >= 24; 
    return {
      weekNum: c.week,
      weight: (userData.currentWeight * (1 + c.percent / 100)).toFixed(1),
      dose: drug.steps[Math.min(i, drug.steps.length - 1)],
      phase: isBridgePhase ? "대사 가교(Bridge)" : "집중 감량(Active)",
      label: `${c.week}주`
    };
  });

  let personalizedMessage = "";
  if (userData.muscleMass === '이하') {
    personalizedMessage = "근육량이 부족하여 대사 가교 시기에 요요 위험이 큽니다. 단백질 섭취와 근력 운동 강도를 높이세요.";
  } else {
    personalizedMessage = `${userData.userName}님을 위한 맞춤형 GPS 전략입니다.`;
  }

  return { personalizedMessage, roadmap, drugName: drug.name, references: drug.references };
}
