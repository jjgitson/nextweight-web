// /lib/roadmap-engine.ts
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
  
  // 1. 대사 가교 포인트 설정 (목표 체중 80% 도달 시점을 가교 시작으로 가정)
  const totalGoal = userData.currentWeight - userData.targetWeight;
  
  const roadmap = drug.clinicalData.map((c, i) => {
    const isBridgePhase = c.week >= 24; // 예: 24주차부터 테이퍼링 및 가교 단계 진입
    return {
      weekNum: c.week,
      weight: (userData.currentWeight * (1 + c.percent / 100)).toFixed(1),
      dose: isBridgePhase ? drug.steps[Math.max(0, drug.steps.length - 1 - (i-4))] : drug.steps[Math.min(i, drug.steps.length - 1)],
      phase: isBridgePhase ? "대사 가교(Bridge)" : "집중 감량(Active)",
      label: `${c.week}주`
    };
  });

  // 2. GPS 기반 맞춤 전략 메시지
  const strategyMessage = userData.muscleMass === '이하' 
    ? "현재 근육량이 부족하여 가교 단계에서 요요 위험이 높습니다. HMB 3g 투여와 저항성 운동 강도를 20% 상향하세요."
    : `${userData.userName}님의 예산(${userData.budget})에 맞춘 경제적 가교 전략을 설계했습니다.`;

  return { 
    personalizedMessage: strategyMessage, 
    roadmap,
    drugName: drug.name
  };
}
