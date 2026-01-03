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
  week: number; phase: string; name: string; icon: string; 
  color: string; start: number; end: number; msg: string;
}

export function generatePersonalizedAnalysis(userData: UserData) {
  // 1. 사용자 % 변화율 계산: (현재 - 시작) / 시작 * 100
  const userLossPct = ((userData.currentWeight - userData.startWeightBeforeDrug) / userData.startWeightBeforeDrug) * 100;
  
  // 2. 현재 스테이지 판별
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek < s.end) || STAGES[STAGES.length - 1];

  // 3. 임상 평균 대비 비교 메시지 생성
  const isMounjaro = userData.drugType === 'MOUNJARO';
  const selectedDrug = CLINICAL_DATA[userData.drugType];
  const idx = selectedDrug.weeks.findIndex(w => w >= userData.currentWeek);
  
  let clinicalVal = 0;
  if (isMounjaro) {
    const doseKey = `${userData.currentDose}mg` as keyof typeof CLINICAL_DATA.MOUNJARO.dose;
    clinicalVal = (CLINICAL_DATA.MOUNJARO.dose[doseKey] || CLINICAL_DATA.MOUNJARO.dose["15mg"])[idx === -1 ? 10 : idx];
  } else {
    clinicalVal = CLINICAL_DATA.WEGOVY.values[idx === -1 ? 11 : idx];
  }

  const diffPct = (userLossPct - clinicalVal).toFixed(1);

  return {
    userLossPct: Number(userLossPct.toFixed(1)),
    currentStage,
    comparisonMsg: `동일 주차 기준, ${selectedDrug.name} 평균 대비 ${Math.abs(Number(diffPct))}%p ${Number(diffPct) <= 0 ? '추가 감량 중' : '위'}에 있습니다.`,
    roadmap: STAGES.map(s => ({ ...s, week: s.start })) as RoadmapStep[]
  };
}
