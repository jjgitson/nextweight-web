// /lib/roadmap-engine.ts
import { DRUG_TYPES, CLINICAL_WEEKS } from './drug-config';

export interface UserData {
  userName: string; userAge: number; userGender: string; // 1, 2, 3
  currentWeight: number; targetWeight: number; // 4, 5
  startWeightBeforeDrug?: number; // 6번 '사용 중' 분기 시 필요
  drugStatus: string; drugType: keyof typeof DRUG_TYPES; // 6, 7
  currentDose: number; duration: string; // 8, 9
  muscleMass: string; exercise: string; budget: string; // 10, 11, 12
  mainConcern: string; resolution: string; // 13, 14
}

// ✅ 반드시 export 키워드 확인 (빌드 에러 해결의 핵심)
export function generatePersonalizedRoadmap(userData: UserData) {
  const drug = DRUG_TYPES[userData.drugType];
  if (!drug) throw new Error("Invalid drug type");

  // 1. 임상 대비 성취도 분석 (사용 중일 때만 동작)
  let clinicalStatus = null;
  if (userData.drugStatus === '사용 중' && userData.startWeightBeforeDrug) {
    const elapsedWeeks = parseInt(userData.duration) || 4;
    const userLossPercent = ((userData.currentWeight - userData.startWeightBeforeDrug) / userData.startWeightBeforeDrug) * 100;
    
    // 가장 가까운 임상 주차 데이터 추출
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

  // 2. [Message Library] 기반 ROI 조언 [cite: 36, 38]
  let advice = "";
  if (userData.budget === '표준형' && userData.muscleMass === '이하') {
    advice = "현재 골격근량이 위험 수준입니다. 월 5~10만 원의 HMB 투자가 향후 발생할 200만 원의 재투약 비용을 막는 가장 똑똑한 보험입니다. [cite: 36]";
  } else if (userData.budget === '실속형') {
    advice = "추가 지출 0원으로 활동량을 늘려 약값 매몰을 방지하는 전략이 필요합니다. [cite: 38]";
  } else {
    advice = `${userData.userName}님의 성공적인 대사 가교를 위한 GPS 전략입니다.`;
  }

  // 3. [Bridge Engine] 기반 주차별 시뮬레이션 [cite: 37]
  const roadmap = CLINICAL_WEEKS.map((week, i) => {
    const weight = (userData.currentWeight * (1 + ((drug.clinicalData as any)["15mg"] || (drug.clinicalData as any)["2.4mg"])[i] / 100)).toFixed(1);
    return { week, weight, phase: week >= 24 ? "대사 가교기" : "집중 감량기" };
  });

  return { advice, clinicalStatus, roadmap, drugName: drug.name };
}
