// /lib/roadmap-engine.ts
import { DRUG_TYPES, CLINICAL_DATA, STAGES } from './drug-config';

export function generatePersonalizedAnalysis(userData: any) {
  const isMounjaro = userData.drugType === 'MOUNJARO';
  const selectedDrug = CLINICAL_DATA[userData.drugType];
  const otherDrug = isMounjaro ? CLINICAL_DATA.WEGOVY : CLINICAL_DATA.MOUNJARO;

  // 1. 사용자 변화율 계산 (%)
  const userLossPct = ((userData.currentWeight - userData.startWeightBeforeDrug) / userData.startWeightBeforeDrug) * 100;
  
  // 2. 현재 스테이지 판별
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek < s.end) || STAGES[STAGES.length - 1];

  // 3. 임상 평균 데이터 추출 (동일 주차 기준 보간법)
  const getClinicalPct = (drugData: any, week: number, dose?: number) => {
    const weeks = drugData.weeks;
    const values = dose && drugData.dose ? (drugData.dose[`${dose}mg`] || drugData.dose["15mg"]) : drugData.values;
    const idx = weeks.findIndex((w: number) => w >= week);
    return idx === -1 ? values[values.length - 1] : values[idx];
  };

  const selectedPct = getClinicalPct(selectedDrug, userData.currentWeek, isMounjaro ? userData.currentDose : undefined);
  const diffPct = (userLossPct - selectedPct).toFixed(1);

  return {
    userLossPct: userLossPct.toFixed(1),
    selectedPct: selectedPct.toFixed(1),
    diffPct: Number(diffPct),
    currentStage,
    comparisonMsg: `동일 주차 기준, ${isMounjaro ? '터제타파이드' : '위고비'} 평균 곡선 대비 ${Math.abs(Number(diffPct))}%p ${Number(diffPct) <= 0 ? '추가 감량 중' : '위'}에 있습니다.`
  };
}
