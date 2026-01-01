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

  // 시트 [Message Library] 로직 구현
  let personalizedMessage = "";
  const totalLossGoal = userData.currentWeight - userData.targetWeight;

  if (userData.budget === '실속형' && userData.drugType === 'MOUNJARO') {
    personalizedMessage = "강력한 감량 효과만큼 근육도 빠르게 빠질 수 있습니다. 돈 안 드는 '계단 오르기'가 현재 당신의 비싼 약값을 지키는 유일한 방법입니다.";
  } else if (userData.budget === '표준형' && userData.muscleMass === '이하') {
    personalizedMessage = "현재 골격근량이 위험 수준입니다. 월 5만 원의 HMB 투자가 향후 발생할 500만 원의 재투약 비용을 막는 가장 똑똑한 보험입니다.";
  } else if (userData.drugStatus === '사용 전' && totalLossGoal > 10) {
    personalizedMessage = "장기 투약이 예상됩니다. 초기부터 예산을 '표준형'으로 설정하여 근육을 지켜야, 최종적으로 약물 사용 기간을 줄여 총비용을 아낄 수 있습니다.";
  } else {
    personalizedMessage = `${userData.userName}님의 성공적인 대사 가교를 위해 GPS 로드맵을 설계했습니다.`;
  }

  const roadmap = drugInfo.clinicalData.map((c, index) => {
    return {
      weekNum: c.week,
      dose: drugInfo.steps[Math.min(index, drugInfo.steps.length - 1)],
      phase: index >= 3 ? "유지 관리기" : "증량 단계",
      label: `${c.week}주`,
      guidance: c.week <= 8 ? "적응기: GPS 기초 다지기" : "가교기: 내인성 대사 활성 유도"
    };
  });

  return {
    drugName: drugInfo.name,
    roadmap: roadmap,
    userData: userData,
    personalizedMessage: personalizedMessage
  };
}
