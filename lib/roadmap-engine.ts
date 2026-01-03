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

  // 1. 임상 평균 대비 나의 성취도 분석 (Clinical Evidence 데이터 기반)
  let performance = null;
  if (userData.drugStatus === '사용 중') {
    const elapsedWeeks = userData.currentWeek;
    // 가장 가까운 임상 주차 데이터 추출
    const clinicalPoint = [...clinical].reverse().find(p => p.week <= elapsedWeeks) || clinical[0];
    
    let clinicalPercent = 0;
    if (userData.drugType === 'MOUNJARO') {
      const p = clinicalPoint as MounjaroPoint;
      // 현재 용량 단계에 따른 임상 수치 매핑
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

  // 2. 단계별 가이드 생성 (Bridge Engine & SOS 연동)
  const roadmap = clinical.map((c: any) => {
    let phase = "감량기";
    let guidance = "[가속기] 터제타파이드의 효과를 근육 자산으로 전환할 때입니다.";
    if (c.week <= 4) { phase = "적응기"; guidance = "[적응기] 기초 수분 2L 섭취로 몸의 변화에 적응하세요."; }
    else if (c.week >= 24) { phase = "가교기"; guidance = "[가교기] 약물 농도가 낮아집니다. 저항성 운동이 요요를 결정합니다."; }

    return { week: c.week, phase, guidance };
  });

  return { performance, roadmap, drugName: drug.name };
}
