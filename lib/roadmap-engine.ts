// /lib/roadmap-engine.ts
import { CLINICAL_DATA, STAGES, DRUG_TYPES } from './drug-config';

export interface UserData {
  userName: string; userAge: number; userGender: string;
  currentWeight: number; targetWeight: number; startWeightBeforeDrug: number;
  drugType: keyof typeof DRUG_TYPES; currentDose: number; currentWeek: number;
  drugStatus: string; budget: string; muscleMass: string; exercise: string;
  mainConcern: string; resolution: string; // 온보딩의 모든 필드 정의
}

export function generatePersonalizedAnalysis(userData: UserData) {
  // 데이터 안전 장치: 분모가 0이 되는 것 방지
  const startWeight = userData.startWeightBeforeDrug || userData.currentWeight || 1;
  const userLossPct = ((userData.currentWeight - startWeight) / startWeight) * 100;
  
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek <= s.end) || STAGES[STAGES.length - 1];

  let clinicalVal = 0;
  const isMounjaro = userData.drugType === 'MOUNJARO';
  const drugConfig = DRUG_TYPES[userData.drugType];
  
  if (isMounjaro) {
    const data = CLINICAL_DATA.MOUNJARO;
    const idx = data.weeks.findIndex(w => w >= userData.currentWeek);
    clinicalVal = data.dose["15mg"][idx === -1 ? 7 : idx];
  } else {
    const data = CLINICAL_DATA.WEGOVY;
    const idx = data.weeks.findIndex(w => w >= userData.currentWeek);
    clinicalVal = data.values[idx === -1 ? 7 : idx];
  }

  const diffPct = (userLossPct - clinicalVal).toFixed(1);

  return {
    userLossPct: Number(userLossPct.toFixed(1)),
    currentStage,
    statusCard: {
      stageName: currentStage.name,
      weekText: `${userData.currentWeek}주차`,
      drugInfo: `${drugConfig.name} ${userData.currentDose}mg`,
      budget: userData.budget,
      mainConcern: userData.mainConcern,
      comparison: `동일 주차 기준 ${isMounjaro ? 'Tirzepatide' : 'Wegovy'} 평균 대비 ${Number(diffPct) > 0 ? '+' : ''}${diffPct}%p`
    },
    gps: [
      { label: 'G Drug', value: `${drugConfig.name} ${userData.currentDose}mg`, status: 'normal' },
      { label: 'P Protein', value: userData.muscleMass, status: userData.muscleMass === '이하' ? 'attention' : 'normal' },
      { label: 'S Strength', value: userData.exercise, status: userData.exercise === '안 함' ? 'attention' : 'normal' }
    ],
    roiSummary: `현재 예산 전략(${userData.budget}) 기준, 재투약 방어 효과가 기대됩니다.`
  };
}
