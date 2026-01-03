// /lib/roadmap-engine.ts
import { CLINICAL_DATA, STAGES, DRUG_TYPES } from './drug-config';

// ⚠️ 온보딩의 모든 필드를 포함하도록 인터페이스 확장 (빌드 에러 해결 포인트)
export interface UserData {
  userName: string;
  userAge: number;
  userGender: string;
  currentWeight: number;
  targetWeight: number;
  startWeightBeforeDrug: number;
  drugType: keyof typeof DRUG_TYPES;
  currentDose: number;
  currentWeek: number;
  drugStatus: string;
  budget: string;
  muscleMass: string;
  exercise: string;
  mainConcern: string;
  resolution: string;
}

export function generatePersonalizedAnalysis(userData: UserData) {
  const startWeight = userData.startWeightBeforeDrug || userData.currentWeight || 1;
  const userLossPct = ((userData.currentWeight - startWeight) / startWeight) * 100;
  
  // 현재 스테이지 판별
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek <= s.end) || STAGES[STAGES.length - 1];

  let clinicalVal = 0;
  const drugConfig = DRUG_TYPES[userData.drugType];
  
  if (userData.drugType === 'MOUNJARO') {
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
      comparison: `동일 주차 기준, ${drugConfig.name} 평균 대비 ${Math.abs(Number(diffPct))}%p ${Number(diffPct) <= 0 ? '아래' : '위'}`
    },
    gps: [
      { label: 'G Drug', value: `${drugConfig.name} ${userData.currentDose}mg`, status: 'normal' },
      { label: 'P Protein', value: userData.muscleMass, status: userData.muscleMass === '이하' ? 'attention' : 'normal' },
      { label: 'S Strength', value: userData.exercise, status: userData.exercise === '안 함' ? 'attention' : 'normal' }
    ]
  };
}
