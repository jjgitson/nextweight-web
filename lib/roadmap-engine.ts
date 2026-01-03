// /lib/roadmap-engine.ts
import { DRUG_TYPES, MounjaroPoint, WegovyPoint, STAGES } from './drug-config';

export interface UserData {
  userName: string; currentWeight: number; startWeightBeforeDrug: number;
  drugType: keyof typeof DRUG_TYPES; currentDose: number; currentWeek: number;
  drugStatus: string; budget: string; muscleMass: string; exercise: string;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  const drug = DRUG_TYPES[userData.drugType];
  const clinical = drug.clinicalData;

  // 1. 임상 대비 성취도 및 Status Card 데이터
  const elapsedWeeks = userData.currentWeek;
  const clinicalPoint = [...clinical].reverse().find(p => p.week <= elapsedWeeks) || clinical[0];
  
  let clinicalPercent = 0;
  if (userData.drugType === 'MOUNJARO') {
    clinicalPercent = (clinicalPoint as MounjaroPoint).mg15;
  } else {
    clinicalPercent = (clinicalPoint as WegovyPoint).mg24;
  }

  const userLossPercent = ((userData.currentWeight - userData.startWeightBeforeDrug) / userData.startWeightBeforeDrug) * 100;
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek < s.end) || STAGES[STAGES.length - 1];
  const diffPct = (userLossPercent - clinicalPercent).toFixed(1);

  return {
    statusCard: {
      stageName: currentStage.name,
      weekText: `${userData.currentWeek}주차`,
      drugInfo: `${drug.name} ${userData.currentDose}mg`,
      budget: userData.budget,
      comparison: `동일 주차 기준, ${drug.name} 평균 대비 ${Number(diffPct) > 0 ? '+' : ''}${diffPct}%p`
    },
    gps: [
      { label: 'G Drug', value: `${drug.name} ${userData.currentDose}mg`, status: 'normal' },
      { label: 'P Protein', value: userData.muscleMass, status: userData.muscleMass === '이하' ? 'attention' : 'normal' },
      { label: 'S Strength', value: userData.exercise, status: userData.exercise === '안 함' ? 'attention' : 'normal' }
    ],
    currentStage,
    userLossPercent,
    clinicalPercent
  };
}
