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
  mainConcern: string;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  const drug = DRUG_TYPES[userData.drugType];
  
  // 1. [Message Library] 기반 맞춤 조언 추출
  let advice = "";
  if (userData.budget === '실속형' && userData.drugType === 'MOUNJARO') {
    advice = "강력한 감량 효과만큼 근육도 빠르게 빠질 수 있습니다. 돈 안 드는 '계단 오르기'가 현재 당신의 비싼 약값을 지키는 유일한 방법입니다.";
  } else if (userData.budget === '표준형' && userData.muscleMass === '이하') {
    advice = "현재 골격근량이 위험 수준입니다. 월 5~10만 원의 HMB 투자가 향후 발생할 200만 원의 재투약 비용을 막는 가장 똑똑한 보험입니다.";
  } else {
    advice = `${userData.userName}님, 지불하신 비용이 매몰되지 않도록 설계된 대사 가교 전략입니다.`;
  }

  // 2. [Bridge Engine] 기반 주차별 로드맵 생성
  const roadmap = drug.clinicalData.map((c, i) => {
    let phase = "집중 감량기";
    let action = "단백질 섭취량 1.5배 상향";
    
    if (c.week <= 4) { phase = "대사 적응기"; action = "기초 수분 2L 및 가벼운 산책"; }
    else if (c.week >= 24) { phase = "대사 가교기"; action = "HMB 3g 필수 및 저항성 운동 강화"; }

    return {
      week: c.week,
      weight: (userData.currentWeight * (1 + c.percent / 100)).toFixed(1),
      dose: drug.steps[Math.min(i, drug.steps.length - 1)],
      phase,
      action
    };
  });

  return { advice, roadmap, drugName: drug.name };
}
