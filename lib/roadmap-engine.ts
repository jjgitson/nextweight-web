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
  week: number; weightPct: number; phase: string; icon: string; 
  color: string; start: number; end: number; msg: string;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  const isMounjaro = userData.drugType === 'MOUNJARO';
  const selectedDrug = CLINICAL_DATA[userData.drugType];
  
  // 1. 사용자 % 변화율 계산
  const userLossPct = ((userData.currentWeight - userData.startWeightBeforeDrug) / userData.startWeightBeforeDrug) * 100;
  
  // 2. 현재 스테이지 판별
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek < s.end) || STAGES[STAGES.length - 1];

  // 3. 임상 평균 대비 비교
  const idx = selectedDrug.weeks.findIndex(w => w >= userData.currentWeek);
  const clinicalVal = isMounjaro 
    ? (selectedDrug.dose?.[`${userData.currentDose}mg`] || selectedDrug.dose?.["15mg"])[idx === -1 ? selectedDrug.weeks.length - 1 : idx]
    : selectedDrug.values[idx === -1 ? selectedDrug.weeks.length - 1 : idx];

  const diffPct = (userLossPct - (clinicalVal || 0)).toFixed(1);

  // 4. 차트용 로드맵 데이터 (0~72주 보간)
  const roadmap: RoadmapStep[] = STAGES.map(s => {
    const sIdx = selectedDrug.weeks.findIndex(w => w >= s.start);
    const sVal = isMounjaro 
      ? (selectedDrug.dose?.[`${userData.currentDose}mg`] || selectedDrug.dose?.["15mg"])[sIdx === -1 ? selectedDrug.weeks.length - 1 : sIdx]
      : selectedDrug.values[sIdx === -1 ? selectedDrug.weeks.length - 1 : sIdx];
    
    return {
      week: s.start,
      weightPct: sVal || 0,
      phase: s.name, icon: s.icon, color: s.color,
      start: s.start, end: s.end, msg: s.msg
    };
  });

  return { 
    roadmap, 
    analysis: { 
      userLossPct: Number(userLossPct.toFixed(1)), 
      currentStage, 
      comparisonMsg: `동일 주차 기준, ${selectedDrug.name} 평균 대비 ${Math.abs(Number(diffPct))}%p ${Number(diffPct) <= 0 ? '추가 감량 중' : '위'}에 있습니다.` 
    } 
  };
}
