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

  // 1. 임상 평균 대비 나의 성취도 분석 (Clinical Evidence 탭 연동)
  let performance = null;
  if (userData.drugStatus === '사용 중') {
    const elapsedWeeks = userData.currentWeek;
    // 임상 데이터에서 해당 주차와 가장 가까운 포인트 찾기
    const clinicalPoint = [...clinical].reverse().find(p => p.week <= elapsedWeeks) || clinical[0];
    
    let clinicalPercent = 0;
    if (userData.drugType === 'MOUNJARO') {
      const p = clinicalPoint as MounjaroPoint;
      // 현재 용량에 따른 임상 수치 매핑
      clinicalPercent = userData.currentDose >= 15 ? p.mg15 : userData.currentDose >= 10 ? p.mg10 : p.mg5;
    } else {
      clinicalPercent = (clinicalPoint as WegovyPoint).mg24;
    }

    const userLossPercent = ((userData.currentWeight - userData.startWeightBeforeDrug) / userData.startWeightBeforeDrug) * 100;
    const clinicalAvgWeight = userData.startWeightBeforeDrug * (1 + clinicalPercent / 100);

    performance = {
      userLossPercent: userLossPercent.toFixed(1),
      clinicalLossPercent: clinicalPercent.toFixed(1),
      weightDiff: (userData.currentWeight - clinicalAvgWeight).toFixed(1), // 임상 평균 대비 +/- kg
      status: userLossPercent <= clinicalPercent ? "임상 대비 우수" : "임상 평균 추적 중"
    };
  }

  // 2. 단계별 GPS 가이드 (Infographic_Template & Bridge Engine 연동)
  const roadmap = clinical.map((c: any) => {
    const clinicalPercent = userData.drugType === 'MOUNJARO' ? c.mg15 : c.mg24;
    let phase = "감량기";
    let color = "#10B981"; // Green
    let guidance = "본격적인 체지방 연소 구간입니다. 단백질 섭취량을 늘리세요.";

    if (c.week <= 4) { 
      phase = "적응기"; color = "#3B82F6"; // Blue
      guidance = "몸이 약물에 적응하는 시기입니다. 수분 2L와 가벼운 산책이 필수입니다.";
    } else if (c.week >= 24) { 
      phase = "가교기"; color = "#F59E0B"; // Orange
      guidance = "대사 전환이 필요한 시기입니다. 저항성 운동 강도를 높여 요요를 방지하세요.";
    }

    return {
      week: c.week,
      weight: (userData.currentWeight * (1 + clinicalPercent / 100)).toFixed(1),
      phase, color, guidance,
      isUserCurrent: userData.currentWeek === c.week // 현재 주차 표시용
    };
  });

  return { performance, roadmap, drugName: drug.name };
}
