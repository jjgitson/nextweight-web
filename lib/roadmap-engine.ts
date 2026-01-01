// /lib/roadmap-engine.ts
import { DRUG_TYPES } from './drug-config';

export interface UserData {
  userName: string; userAge: number; currentWeight: number; targetWeight: number;
  drugStatus: string; drugType: string; currentDose: number; duration: string;
  muscleMass: string; exercise: string; budget: string; mainConcern: string; resolution: string;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  const drug = DRUG_TYPES[userData.drugType as keyof typeof DRUG_TYPES];
  const clinical = drug.clinicalData;

  // 1. 임상 평균 대비 성취도 분석 로직 (시트 [Clinical_Evidence] 활용)
  let clinicalStatus = { percent: 0, label: "분석 불가" };
  if (userData.drugStatus === '사용 중') {
    const weeks = Number(userData.duration) || 4;
    const clinicalPoint = clinical.find(p => p.week >= weeks) || clinical[clinical.length - 1];
    clinicalStatus = { percent: clinicalPoint.percent, label: "임상 평균 추적 중" };
  }

  // 2. [Message Library] 기반 ROI 조언
  let roiMessage = "";
  if (userData.budget === '표준형' && userData.muscleMass === '이하') {
    roiMessage = "현재 골격근량이 위험 수준입니다. 월 5만 원의 HMB 투자가 향후 발생할 500만 원의 재투약 비용을 막는 가장 똑똑한 보험입니다.";
  } else if (userData.budget === '실속형') {
    roiMessage = "추가 지출 0원으로 기초대사량 하한선을 사수하여 약값 매몰을 방지하세요.";
  }

  // 3. [Bridge Engine] 기반 주차별 가이드
  const roadmap = clinical.map((c, i) => {
    let phase = "감량기";
    let icon = "🔥";
    if (c.week <= 4) { phase = "적응기"; icon = "💧"; }
    else if (c.week >= 24) { phase = "가교기"; icon = "🌉"; }

    return {
      week: c.week,
      weight: (userData.currentWeight * (1 + c.percent / 100)).toFixed(1),
      phase, icon,
      guidance: c.week >= 24 ? "HMB 3g 필수 및 저항성 운동 강화" : "단백질 1.5배 상향 및 수분 2L"
    };
  });

  return { roiMessage, clinicalStatus, roadmap, drugName: drug.name };
}
