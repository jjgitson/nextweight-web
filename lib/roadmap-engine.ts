// /lib/roadmap-engine.ts
import { DRUG_TYPES } from './drug-config';

export interface UserData {
  userName: string; userAge: number; currentWeight: number; targetWeight: number;
  drugStatus: string; drugType: keyof typeof DRUG_TYPES; currentDose: number; 
  duration: string; muscleMass: string; budget: string; mainConcern: string; [cite: 9]
}

export function generatePersonalizedRoadmap(userData: UserData) {
  const drug = DRUG_TYPES[userData.drugType];
  const clinical = drug.clinicalData;

  // 1. 임상 대비 성취도 분석 (사용 중일 경우) [cite: 3, 9]
  let clinicalComparison = null;
  if (userData.drugStatus === '사용 중') {
    const elapsedWeeks = Number(userData.duration);
    // 가장 가까운 임상 주차 데이터 찾기 
    const clinicalPoint = clinical.find(p => p.week >= elapsedWeeks) || clinical[clinical.length - 1];
    const userLossPercent = ((userData.currentWeight - (userData.currentWeight + 5)) / (userData.currentWeight + 5)) * 100; // 예시 계산
    
    clinicalComparison = {
      clinicalPercent: clinicalPoint.percent,
      status: userLossPercent <= clinicalPoint.percent ? "우수" : "추적 필요"
    };
  }

  // 2. [Message Library] 기반 ROI 조언 
  let advice = "";
  if (userData.budget === '표준형' && userData.muscleMass === '이하') {
    advice = "현재 골격근량이 위험 수준입니다. 월 5만 원의 HMB 투자가 향후 발생할 500만 원의 재투약 비용을 막는 가장 똑똑한 보험입니다. ";
  } else {
    advice = `${userData.userName}님을 위한 GPS 대사 가교 전략입니다. [cite: 10]`;
  }

  return {
    advice,
    clinicalComparison,
    clinicalCurve: clinical.map(p => ({
      week: p.week,
      weight: (userData.currentWeight * (1 + p.percent / 100)).toFixed(1)
    })),
    drugName: drug.name
  };
}
