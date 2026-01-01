// /lib/roadmap-engine.ts
import { DRUG_TYPES, CLINICAL_WEEKS } from './drug-config';

export interface UserData {
  userName: string; userAge: number; userGender: string;
  currentWeight: number; targetWeight: number;
  drugStatus: string; drugType: keyof typeof DRUG_TYPES;
  currentDose: number; duration: string;
  muscleMass: string; exercise: string; budget: string;
  mainConcern: string; resolution: string;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  const drug = DRUG_TYPES[userData.drugType];
  if (!drug) throw new Error("Invalid drug type");

  const totalLossGoal = userData.currentWeight - userData.targetWeight;

  // 1. [Message Library] 기반 트리거 조언 추출 
  let advice = "";
  if (userData.budget === '실속형' && userData.drugType === 'MOUNJARO') {
    advice = "강력한 감량 효과만큼 근육도 빠르게 빠질 수 있습니다. 돈 안 드는 '계단 오르기'가 현재 당신의 비싼 약값을 지키는 유일한 방법입니다. ";
  } else if (userData.budget === '표준형' && userData.muscleMass === '이하') {
    advice = "현재 골격근량이 위험 수준입니다. 월 5만 원의 HMB 투자가 향후 발생할 500만 원의 재투약 비용을 막는 가장 똑똑한 보험입니다. ";
  } else if (userData.drugStatus === '사용 전' && totalLossGoal > 10) {
    advice = "장기 투약이 예상됩니다. 초기부터 예산을 '표준형'으로 설정하여 근육을 지켜야, 최종적으로 약물 사용 기간을 줄여 총비용을 아낄 수 있습니다. ";
  } else {
    advice = `${userData.userName}님을 위한 GPS 대사 가교 로드맵입니다.`;
  }

  // 2. [Infographic_Template] 및 [Bridge Engine] 기반 로드맵 생성 [cite: 4, 7]
  const clinicalPoints = (drug.clinicalData as any)["15mg"] || (drug.clinicalData as any)["2.4mg"];
  
  const roadmap = CLINICAL_WEEKS.map((week, i) => {
    let phase = "감량기";
    let color = "#10B981";
    let guidance = "[가속기] 본격 감량 시작, 단백질 섭취량 1.5배 상향 ";

    if (week <= 4) { 
      phase = "적응기"; color = "#3B82F6"; 
      guidance = "[적응기] 기초 수분 2L 및 가벼운 산책 시작 ";
    } else if (week >= 24) { 
      phase = "가교기"; color = "#F59E0B"; 
      guidance = "[관리기] 근육 손실 주의보, HMB 3g 필수 권장 ";
    }

    return {
      week, phase, color, guidance,
      weight: (userData.currentWeight * (1 + clinicalPoints[i] / 100)).toFixed(1),
      label: `${week}주`
    };
  });

  return { advice, roadmap, drugName: drug.name, references: drug.references };
}
