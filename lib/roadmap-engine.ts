// /lib/roadmap-engine.ts
import { DRUG_TYPES, MounjaroPoint, WegovyPoint } from './drug-config';

// 마스터 시트 [Onboarding_Fields] 14개 문항 수용 [cite: 9]
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
  
  // 1. 임상 대비 성취도 분석 (타입 에러 수정 구간)
  let clinicalStatus = null;
  if (userData.drugStatus === '사용 중') {
    const elapsedWeeks = parseInt(userData.duration) || 4;
    const clinicalPoint = drug.clinicalData.find(p => p.week >= elapsedWeeks) || drug.clinicalData[drug.clinicalData.length - 1];
    
    let clinicalPercent = 0;
    
    // 타입 가드를 통해 안전하게 속성에 접근
    if (userData.drugType === 'MOUNJARO') {
      const p = clinicalPoint as MounjaroPoint;
      clinicalPercent = userData.currentDose >= 15 ? p.mg15 : userData.currentDose >= 10 ? p.mg10 : p.mg5;
    } else {
      const p = clinicalPoint as WegovyPoint;
      clinicalPercent = p.mg24;
    }

    clinicalStatus = { clinicalPercent, label: "임상 데이터 기준점 확보 " };
  }

  // 2. [Message Library] 기반 트리거 조언 
  let advice = "";
  if (userData.budget === '실속형' && userData.drugType === 'MOUNJARO') {
    advice = "강력한 감량 효과만큼 근육도 빠르게 빠질 수 있습니다. 돈 안 드는 '계단 오르기'가 현재 당신의 비싼 약값을 지키는 유일한 방법입니다. ";
  } else if (userData.budget === '표준형' && userData.muscleMass === '이하') {
    advice = "현재 골격근량이 위험 수준입니다. 월 5만 원의 HMB 투자가 향후 발생할 500만 원의 재투약 비용을 막는 가장 똑똑한 보험입니다. ";
  } else {
    advice = `${userData.userName}님의 성공적인 대사 가교를 위한 GPS 전략입니다. `;
  }

  // 3. [Infographic_Template] 기반 주차별 로드맵 구성 [cite: 4]
  const roadmap = drug.clinicalData.map((c: any) => {
    // 터제타파이드(마운자로)는 mg15, 위고비는 mg24 기준으로 가상 곡선 생성
    const clinicalPercent = userData.drugType === 'MOUNJARO' ? c.mg15 : c.mg24;
    
    let phase = "감량기";
    let guidance = "[가속기] 본격 감량 시작, 단백질 섭취량 1.5배 상향 ";
    
    if (c.week <= 4) { 
      phase = "적응기"; 
      guidance = "[적응기] 기초 수분 2L 및 가벼운 산책 시작 "; 
    } else if (c.week >= 24) { 
      phase = "가교기"; 
      guidance = "[관리기] 근육 손실 주의보, HMB 3g 필수 권장 "; 
    }

    return {
      week: c.week,
      weight: (userData.currentWeight * (1 + clinicalPercent / 100)).toFixed(1),
      phase,
      guidance
    };
  });

  return { advice, clinicalStatus, roadmap, drugName: drug.name };
}
