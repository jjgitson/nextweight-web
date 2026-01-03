// /lib/roadmap-engine.ts
import { CLINICAL_DATA, STAGES } from './drug-config';

export interface UserData {
  userName: string; userAge: number; userGender: string;
  currentWeight: number; targetWeight: number;
  drugStatus: string; drugType: 'MOUNJARO' | 'WEGOVY';
  currentDose: number; currentWeek: number; startWeightBeforeDrug: number;
  muscleMass: string; exercise: string; budget: string;
  mainConcern: string; resolution: string;
}

export interface RoadmapStep {
  week: number; phase: string; name: string; icon: string; 
  color: string; start: number; end: number; msg: string; weightPct: number;
}

export function generatePersonalizedAnalysis(userData: UserData) {
  // 데이터 가딩: 시작 체중이 0일 경우 현재 체중으로 대체하여 NaN 방지
  const startWeight = userData.startWeightBeforeDrug || userData.currentWeight || 1;
  const userLossPct = ((userData.currentWeight - startWeight) / startWeight) * 100;
  
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek < s.end) || STAGES[STAGES.length - 1];

  let clinicalVal = 0;
  const isMounjaro = userData.drugType === 'MOUNJARO';
  
  if (isMounjaro) {
    const data = CLINICAL_DATA.MOUNJARO;
    const idx = data.weeks.findIndex(w => w >= userData.currentWeek);
    const doseKey = `${userData.currentDose}mg` as keyof typeof data.dose;
    clinicalVal = (data.dose[doseKey] || data.dose["15mg"])[idx === -1 ? data.weeks.length - 1 : idx];
  } else {
    const data = CLINICAL_DATA.WEGOVY;
    const idx = data.weeks.findIndex(w => w >= userData.currentWeek);
    clinicalVal = data.values[idx === -1 ? data.weeks.length - 1 : idx];
  }

  const diffPct = (userLossPct - clinicalVal).toFixed(1);

  return {
    userLossPct: isNaN(userLossPct) ? 0 : Number(userLossPct.toFixed(1)),
    currentStage,
    comparisonMsg: `동일 주차 기준, ${isMounjaro ? '터제타파이드' : '위고비'} 평균 대비 ${Math.abs(Number(diffPct))}%p ${Number(diffPct) <= 0 ? '추가 감량 중' : '위'}에 있습니다.`,
    roadmap: STAGES.map(s => ({ 
      ...s, 
      week: s.start, 
      weightPct: 0 // 차트 내부 로직에서 보간됨
    })) as RoadmapStep[]
  };
}
