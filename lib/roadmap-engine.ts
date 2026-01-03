// /lib/roadmap-engine.ts
import { CLINICAL_DATA, STAGES, DRUG_TYPES } from './drug-config';

export function generatePersonalizedAnalysis(userData: any) {
  // 데이터 가딩: 시작 체중 기반 변화율 (%) 계산
  const startWeight = userData.startWeightBeforeDrug || 1;
  const userLossPct = ((userData.currentWeight - startWeight) / startWeight) * 100;
  
  // 현재 위치 Stage 매핑
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek <= s.end) || STAGES[STAGES.length - 1];

  // 임상 대비 위치 계산
  const drugRef = userData.drugType === 'MOUNJARO' ? CLINICAL_DATA.MOUNJARO : CLINICAL_DATA.WEGOVY;
  const idx = drugRef.weeks.findIndex(w => w >= userData.currentWeek);
  const clinicalVal = userData.drugType === 'MOUNJARO' ? drugRef.dose["15mg"][idx === -1 ? 7 : idx] : drugRef.values[idx === -1 ? 7 : idx];
  const diffPct = (userLossPct - clinicalVal).toFixed(1);

  return {
    userLossPct: Number(userLossPct.toFixed(1)),
    currentStage,
    summary: {
      stage: currentStage.name,
      week: `${userData.currentWeek}주차`,
      comparison: `동일 주차 기준 ${drugRef.name} 평균 대비 ${Number(diffPct) > 0 ? '+' : ''}${diffPct}%p`,
      action: currentStage.msg
    }
  };
}
