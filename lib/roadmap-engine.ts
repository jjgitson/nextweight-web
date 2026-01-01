// /lib/roadmap-engine.ts
import { DRUG_TYPES, CLINICAL_WEEKS } from './drug-config';

export interface UserData {
  userName: string; userAge: number; userGender: string;
  currentWeight: number; targetWeight: number;
  startWeightBeforeDrug?: number; // 임상 비교용 (투약 전 체중)
  drugStatus: string; drugType: keyof typeof DRUG_TYPES;
  currentDose: number; duration: string;
  muscleMass: string; exercise: string; budget: string;
  mainConcern: string; resolution: string;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  const drug = DRUG_TYPES[userData.drugType];
  if (!drug) throw new Error("Invalid drug type");

  // 1. 임상 대비 성취도 분석 (사용 중일 때 동작)
  let clinicalStatus = null;
  if (userData.drugStatus === '사용 중' && userData.startWeightBeforeDrug) {
    const elapsedWeeks = parseInt(userData.duration.replace(/[^0-9]/g, "")) || 4;
    const userLossPercent = ((userData.currentWeight - userData.startWeightBeforeDrug) / userData.startWeightBeforeDrug) * 100;
    
    const doseKey = userData.drugType === 'MOUNJARO' ? `${userData.currentDose}mg` : "2.4mg";
    const clinicalPoints = (drug.clinicalData as any)[doseKey] || (drug.clinicalData as any)["15mg"] || (drug.clinicalData as any)["2.4mg"];
    
    const weekIdx = CLINICAL_WEEKS.findIndex(w => w >= elapsedWeeks);
    const clinicalPercent = clinicalPoints[weekIdx !== -1 ? weekIdx : clinicalPoints.length - 1];

    clinicalStatus = {
      userPercent: userLossPercent.toFixed(1),
      clinicalPercent: clinicalPercent,
      label: userLossPercent <= clinicalPercent ? "임상 평균 대비 우수" : "임상 평균 추적 중"
    };
  }

  // 2. ROI 조언
  let advice = "";
  if (userData.budget === '표준형' && userData.muscleMass === '이하') {
    advice = "현재 골격근량이 위험 수준입니다. 월 5만 원의 HMB 투자가 향후 발생할 500만 원의 재투약 비용을 막는 가장 똑똑한 보험입니다.";
  } else {
    advice = `${userData.userName}님의 성공적인 대사 가교를 위한 GPS 로드맵입니다.`;
  }

  // 3. 주차별 시뮬레이션
  const roadmap = CLINICAL_WEEKS.map((week, i) => {
    const clinicalPoints = (drug.clinicalData as any)["15mg"] || (drug.clinicalData as any)["2.4mg"];
    return {
      week,
      weight: (userData.currentWeight * (1 + clinicalPoints[i] / 100)).toFixed(1),
      phase: week >= 24 ? "대사 가교기" : "집중 감량기"
    };
  });

  return { advice, clinicalStatus, roadmap, drugName: drug.name };
}
