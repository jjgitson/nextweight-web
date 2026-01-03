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
    const clinicalPercent = userData.drugType === 'MOUNJARO' ? (clinicalPoint as MounjaroPoint).mg15 : (clinicalPoint as WegovyPoint).mg24;
    const userLossPercent = ((userData.currentWeight - userData.startWeightBeforeDrug) / userData.startWeightBeforeDrug) * 100;
    
    performance = {
      userLoss: userLossPercent.toFixed(1),
      clinicalAvg: clinicalPercent.toFixed(1),
      status: userLossPercent <= clinicalPercent ? "임상 대비 우수" : "추적 관리 필요",
      weightDiff: (userData.currentWeight - (userData.startWeightBeforeDrug * (1 + clinicalPercent / 100))).toFixed(1)
    };
  }

  // 2. 타임라인 단계(Infographic Stages) 데이터 구성
  const roadmap = clinical.map((c: any) => {
    const clinicalPercent = userData.drugType === 'MOUNJARO' ? c.mg15 : c.mg24;
    let stage = { phase: "감량기", name: "체지방 연소 피크", color: "#10B981", msg: "터제타파이드의 효과를 근육 자산으로 전환할 때입니다.", icon: "🔥" };
    
    if (c.week <= 4) stage = { phase: "적응기", name: "몸의 변화 인지", color: "#3B82F6", msg: "수분 2L 섭취로 부작용을 관리하세요.", icon: "💧" };
    else if (c.week >= 48) stage = { phase: "유지기", name: "요요 방어선 완성", color: "#8B5CF6", msg: "건강한 대사 체계가 안착되었습니다.", icon: "🛡️" };
    else if (c.week >= 24) stage = { phase: "가교기", name: "대사 전환 엔진 가동", color: "#F59E0B", msg: `${userData.budget} 전략에 따른 저항성 운동이 핵심입니다!`, icon: "🌉" };

    return { 
      week: c.week, 
      weight: (userData.startWeightBeforeDrug * (1 + clinicalPercent / 100)).toFixed(1), 
      ...stage 
    };
  });

  return { performance, roadmap, drugName: drug.name };
}
