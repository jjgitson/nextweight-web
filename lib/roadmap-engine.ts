// /lib/roadmap-engine.ts
import { DRUG_TYPES, MounjaroPoint, WegovyPoint } from './drug-config';

export interface UserData {
  userName: string; userAge: number; userGender: string;
  currentWeight: number; targetWeight: number;
  drugStatus: string; drugType: keyof typeof DRUG_TYPES;
  currentDose: number; currentWeek: number; startWeightBeforeDrug: number;
  muscleMass: string; exercise: string; budget: string;
  mainConcern: string; resolution: string;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  const drug = DRUG_TYPES[userData.drugType];
  const clinical = drug.clinicalData;

  // 1. 임상 평균 대비 나의 성취도 분석
  let performance = null;
  if (userData.drugStatus === '사용 중') {
    const elapsedWeeks = userData.currentWeek;
    const clinicalPoint = [...clinical].reverse().find(p => p.week <= elapsedWeeks) || clinical[0];
    
    let clinicalPercent = 0;
    if (userData.drugType === 'MOUNJARO') {
      const p = clinicalPoint as MounjaroPoint;
      clinicalPercent = userData.currentDose >= 15 ? p.mg15 : userData.currentDose >= 10 ? p.mg10 : p.mg5;
    } else {
      clinicalPercent = (clinicalPoint as WegovyPoint).mg24;
    }

    const userLossPercent = ((userData.currentWeight - userData.startWeightBeforeDrug) / userData.startWeightBeforeDrug) * 100;
    performance = {
      userLoss: userLossPercent.toFixed(1),
      clinicalAvg: clinicalPercent.toFixed(1),
      status: userLossPercent <= clinicalPercent ? "임상 대비 우수" : "추적 관리 필요",
      diff: (userLossPercent - clinicalPercent).toFixed(1)
    };
  }

  // 2. 단계별 GPS 가이드 및 차트 데이터 생성
  const roadmap = clinical.map((c: any) => {
    const clinicalPercent = userData.drugType === 'MOUNJARO' ? c.mg15 : c.mg24;
    let phase = "감량기";
    let guidance = "[가속기] 터제타파이드의 효과를 근육 자산으로 전환할 때입니다.";
    let color = "#10B981";

    if (c.week <= 4) { 
      phase = "적응기"; color = "#3B82F6";
      guidance = "[적응기] 수분 2L 섭취로 부작용을 관리하세요."; 
    } else if (c.week >= 24) { 
      phase = "가교기"; color = "#F59E0B";
      guidance = "[가교기] 약물 농도가 낮아집니다. 저항성 운동이 핵심입니다!"; 
    }

    return {
      week: c.week,
      weight: (userData.currentWeight * (1 + clinicalPercent / 100)).toFixed(1),
      phase, color, guidance
    };
  });

  return { performance, roadmap, drugName: drug.name };
}
