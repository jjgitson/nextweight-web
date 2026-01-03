// /lib/roadmap-engine.ts
import { CLINICAL_DATA, STAGES } from './drug-config';

export interface UserData {
  userName: string; currentWeight: number; startWeightBeforeDrug: number;
  drugType: 'MOUNJARO' | 'WEGOVY'; currentDose: number; currentWeek: number;
  drugStatus: string; budget: string; muscleMass: string; exercise: string; mainConcern: string;
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

  // ROI Summary Logic
  const roiSummary = userData.budget === '표준형' 
    ? "현재 예산 전략(표준형) 기준, 재투약 방어 효과가 기대됩니다."
    : userData.budget === '실속형' 
    ? "추가 지출 없이 기초대사량 하한선 사수가 가능할 것으로 보입니다."
    : "최단기 대사 정상화를 통한 완벽한 요요 차단 전략이 가동 중입니다.";

  return {
    userLossPct: Number(userLossPct.toFixed(1)),
    currentStage,
    comparisonMsg: `동일 주차 기준, ${drugRef.name} 평균 대비 ${Math.abs(Number(diffPct))}%p ${Number(diffPct) <= 0 ? '아래' : '위'}에 있습니다.`,
    roiSummary,
    gpsIndicators: {
      drug: { label: 'G (약물)', value: `${drugRef.name} ${userData.currentDose}mg`, state: 'normal' },
      protein: { label: 'P (단백질)', value: userData.muscleMass, state: userData.muscleMass === '이하' ? 'attention' : 'normal' },
      strength: { label: 'S (근력)', value: userData.exercise, state: userData.exercise === '안 함' ? 'attention' : 'normal' }
    }
  };
}
