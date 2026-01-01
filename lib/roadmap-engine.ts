// /lib/roadmap-engine.ts
import { DRUG_TYPES, CLINICAL_WEEKS } from './drug-config';

export interface UserData {
  userName: string; userAge: number; userGender: string;
  currentWeight: number; targetWeight: number;
  startWeightBeforeDrug?: number;
  drugStatus: string; drugType: keyof typeof DRUG_TYPES;
  currentDose: number; duration: string;
  muscleMass: string; exercise: string; budget: string;
  mainConcern: string; resolution: string;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  const drug = DRUG_TYPES[userData.drugType];
  if (!drug) throw new Error("Invalid drug type");

  // 1. 임상 대비 성취도 분석 (Safe Logic)
  let clinicalStatus = null;
  if (userData.drugStatus === '사용 중' && userData.startWeightBeforeDrug) {
    // duration이 숫자가 아닐 경우를 대비한 안전한 파싱
    const elapsedWeeks = parseInt(userData.duration.toString().replace(/[^0-9]/g, "")) || 0;
    const userLossPercent = ((userData.currentWeight - userData.startWeightBeforeDrug) / userData.startWeightBeforeDrug) * 100;
    
    const doseKey = `${userData.currentDose}${drug.unit}` as any;
    const clinicalPoints = (drug.clinicalData as any)[doseKey] || (drug.clinicalData as any)["15mg"] || (drug.clinicalData as any)["2.4mg"];
    
    const weekIdx = CLINICAL_WEEKS.findIndex(w => w >= elapsedWeeks);
    const clinicalPercent = clinicalPoints[weekIdx !== -1 ? weekIdx : clinicalPoints.length - 1];

    clinicalStatus = {
      userPercent: userLossPercent.toFixed(1),
      clinicalPercent: clinicalPercent,
      label: userLossPercent <= clinicalPercent ? "임상 평균 대비 우수" : "임상 평균 추적 중"
    };
  }

  // 2. [Message Library] 기반 ROI 조언 [cite: 6]
  let advice = "";
  if (userData.budget === '실속형' && userData.drugType === 'MOUNJARO') {
    advice = "강력한 감량 효과만큼 근육도 빠르게 빠질 수 있습니다. 돈 안 드는 '계단 오르기'가 현재 당신의 비싼 약값을 지키는 유일한 방법입니다. [cite: 6]";
  } else if (userData.budget === '표준형' && userData.muscleMass === '이하') {
    advice = "현재 골격근량이 위험 수준입니다. 월 5만 원의 HMB 투자가 향후 발생할 500만 원의 재투약 비용을 막는 가장 똑똑한 보험입니다. [cite: 6]";
  } else {
    advice = `${userData.userName}님의 성공적인 대사 가교를 위한 GPS 로드맵입니다.`;
  }

  // 3. [Bridge Engine] 기반 주차별 로드맵 시뮬레이션 [cite: 7]
  const clinicalPoints = (drug.clinicalData as any)["15mg"] || (drug.clinicalData as any)["2.4mg"];
  const roadmap = CLINICAL_WEEKS.map((week, i) => {
    let phase = "감량기";
    let guidance = "[가속기] 본격 감량 시작, 단백질 섭취량 1.5배 상향 [cite: 7]";
    if (week <= 4) { phase = "적응기"; guidance = "[적응기] 기초 수분 2L 및 가벼운 산책 시작 [cite: 7]"; }
    else if (week >= 24) { phase = "가교기"; guidance = "[관리기] 근육 손실 주의보, HMB 3g 필수 권장 [cite: 7]"; }

    return {
      week, phase, guidance,
      weight: (userData.currentWeight * (1 + clinicalPoints[i] / 100)).toFixed(1),
      label: `${week}주`
    };
  });

  return { advice, clinicalStatus, roadmap, drugName: drug.name };
}
