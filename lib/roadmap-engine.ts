// /lib/roadmap-engine.ts
import { CLINICAL_DATA, STAGES, DRUG_TYPES } from './drug-config';

export interface UserData {
  userName: string; userAge: number; userGender: string;
  currentWeight: number; targetWeight: number;
  drugStatus: string; drugType: keyof typeof DRUG_TYPES;
  currentDose: number; currentWeek: number; startWeightBeforeDrug: number;
  muscleMass: string; exercise: string; budget: string;
  mainConcern: string; resolution: string;
}

export interface RoadmapStep {
  week: number;
  phase: string;
  name: string;
  icon: string;
  color: string;
  start: number;
  end: number;
  msg: string;
  weightPct: number;
}

export function generatePersonalizedAnalysis(userData: UserData) {
  // 1. 데이터 가딩: 분모가 0이 되는 경우 방지
  const startWeight = userData.startWeightBeforeDrug || userData.currentWeight || 1;
  const userLossPct = ((userData.currentWeight - startWeight) / startWeight) * 100;
  
  // 2. 현재 스테이지 판별
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek < s.end) || STAGES[STAGES.length - 1];

  // 3. 임상 데이터 추출
  let clinicalVal = 0;
  const drugName = userData.drugType === 'MOUNJARO' ? '터제타파이드' : '위고비';
  
  if (userData.drugType === 'MOUNJARO') {
    const data = CLINICAL_DATA.MOUNJARO;
    const idx = data.weeks.findIndex(w => w >= userData.currentWeek);
    const doseKey = `${userData.currentDose}mg` as keyof typeof data.dose;
    clinicalVal = (data.dose[doseKey] || data.dose["15mg"])[idx === -1 ? data.weeks.length - 1 : idx];
  } else {
    const data = CLINICAL_DATA.WEGOVY;
    const idx = data.weeks.findIndex(w => w >= userData.currentWeek);
    clinicalVal = data.values[idx === -1 ? data.weeks.length - 1 : idx];
  }

  // NaN 방어
  const finalDiffPct = isNaN(userLossPct - clinicalVal) ? "0.0" : (userLossPct - clinicalVal).toFixed(1);

  return {
    userLossPct: isNaN(userLossPct) ? 0 : Number(userLossPct.toFixed(1)),
    currentStage,
    comparisonMsg: `동일 주차 기준, ${drugName} 평균 대비 ${Math.abs(Number(finalDiffPct))}%p ${Number(finalDiffPct) <= 0 ? '추가 감량 중' : '위'}에 있습니다.`,
    roadmap: STAGES.map(s => ({ 
      ...s, 
      week: s.start, 
      weightPct: 0,
      phase: s.id // 에러 해결: id를 phase에 할당
    })) as RoadmapStep[]
  };
}
