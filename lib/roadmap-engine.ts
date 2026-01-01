// /lib/roadmap-engine.ts
import { DRUG_TYPES } from './drug-config';

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
  
  // 1. 임상 대비 성취도 분석 (사용 중일 때) 
  let clinicalStatus = null;
  if (userData.drugStatus === '사용 중') {
    const elapsedWeeks = parseInt(userData.duration) || 4;
    const clinicalPoint = drug.clinicalData.find(p => p.week >= elapsedWeeks) || drug.clinicalData[drug.clinicalData.length - 1];
    
    // 마운자로의 경우 용량별 데이터 선택
    let clinicalPercent = 0;
    if (userData.drugType === 'MOUNJARO') {
      clinicalPercent = userData.currentDose >= 15 ? clinicalPoint.mg15 : userData.currentDose >= 10 ? clinicalPoint.mg10 : clinicalPoint.mg5;
    } else {
      clinicalPercent = clinicalPoint.mg24;
    }

    clinicalStatus = {
      clinicalPercent,
      label: "임상 데이터 기준점 확보"
    };
  }

  // 2. [Message Library] 기반 ROI 조언 [cite: 6, 8]
  let advice = "";
  if (userData.budget === '실속형' && userData.drugType === 'MOUNJARO') {
    advice = "강력한 감량 효과만큼 근육도 빠르게 빠질 수 있습니다. 돈 안 드는 '계단 오르기'가 현재 당신의 비싼 약값을 지키는 유일한 방법입니다. [cite: 6]";
  } else if (userData.budget === '표준형' && userData.muscleMass === '이하') {
    advice = "현재 골격근량이 위험 수준입니다. 월 5만 원의 HMB 투자가 향후 발생할 500만 원의 재투약 비용을 막는 가장 똑똑한 보험입니다. [cite: 6]";
  } else {
    advice = `${userData.userName}님의 성공적인 대사 가교를 위한 GPS 전략입니다.`;
  }

  // 3. 주차별 로드맵 데이터 구성 [cite: 4, 7]
  const roadmap = drug.clinicalData.map((c, i) => {
    const clinicalPercent = userData.drugType === 'MOUNJARO' ? c.mg15 : c.mg24;
    return {
      week: c.week,
      weight: (userData.currentWeight * (1 + clinicalPercent / 100)).toFixed(1),
      phase: c.week >= 24 ? "대사 가교기" : "집중 감량기",
      guidance: c.week >= 24 ? "HMB 3g 필수 및 저항성 운동 강화 [cite: 7]" : "단백질 1.5배 상향 및 수분 2L [cite: 7]"
    };
  });

  return { advice, clinicalStatus, roadmap, drugName: drug.name };
}
