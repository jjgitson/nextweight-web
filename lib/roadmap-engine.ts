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

export function generatePersonalizedAnalysis(userData: UserData) {
  const startWeight = userData.startWeightBeforeDrug || userData.currentWeight || 1;
  const userLossPct = ((userData.currentWeight - startWeight) / startWeight) * 100;
  
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek < s.end) || STAGES[STAGES.length - 1];

  let clinicalVal = 0;
  const isMounjaro = userData.drugType === 'MOUNJARO';
  const drugRef = isMounjaro ? CLINICAL_DATA.MOUNJARO : CLINICAL_DATA.WEGOVY;
  
  const idx = drugRef.weeks.findIndex(w => w >= userData.currentWeek);
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
    // 요구사항: 컴팩트한 비교 문구
    comparisonMsg: `동일 주차 기준, ${drugRef.name} 평균 대비 ${Math.abs(Number(diffPct))}%p ${Number(diffPct) <= 0 ? '아래' : '위'}에 있습니다.`,
    actionSentence: currentStage.msg
  };
}
