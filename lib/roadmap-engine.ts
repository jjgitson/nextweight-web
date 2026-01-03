// /lib/roadmap-engine.ts
import { CLINICAL_DATA, STAGES, DRUG_TYPES } from './drug-config';

export interface UserData {
  userName: string; currentWeight: number; startWeightBeforeDrug: number;
  drugType: keyof typeof DRUG_TYPES; currentDose: number; currentWeek: number;
  drugStatus: string; budget: string; muscleMass: string; exercise: string; mainConcern: string;
}

export function generatePersonalizedAnalysis(userData: UserData) {
  // 1. % 변화율 계산
  const startWeight = userData.startWeightBeforeDrug || userData.currentWeight || 1;
  const userLossPct = ((userData.currentWeight - startWeight) / startWeight) * 100;
  
  // 2. 현재 스테이지 판별
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek <= s.end) || STAGES[STAGES.length - 1];

  // 3. 임상 대비 위치 계산 (타입 가드로 빌드 오류 해결)
  let clinicalVal = 0;
  const isMounjaro = userData.drugType === 'MOUNJARO';
  const drugConfig = DRUG_TYPES[userData.drugType];
  
  if (isMounjaro) {
    const data = CLINICAL_DATA.MOUNJARO;
    const idx = data.weeks.findIndex(w => w >= userData.currentWeek);
    const doseKey = `${userData.currentDose}mg` as keyof typeof data.dose;
    // Mounjaro는 dose 배열에서 값 추출
    clinicalVal = (data.dose[doseKey] || data.dose["15mg"])[idx === -1 ? 7 : idx];
  } else {
    const data = CLINICAL_DATA.WEGOVY;
    const idx = data.weeks.findIndex(w => w >= userData.currentWeek);
    // Wegovy는 values 배열에서 값 추출
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
