// /lib/roadmap-engine.ts
import { CLINICAL_DATA, STAGES, DRUG_TYPES } from './drug-config';

export interface UserData {
  userName: string; userAge: number; userGender: string;
  currentWeight: number; targetWeight: number;
  drugStatus: string; drugType: 'MOUNJARO' | 'WEGOVY';
  currentDose: number; currentWeek: number; startWeightBeforeDrug: number;
  muscleMass: string; exercise: string; budget: string;
  mainConcern: string; resolution: string;
}

export interface RoadmapStep {
  week: number;
  phase: string;
  name: string;
  icon: string;
  color: string;
  start: number;
  end: number;
  msg: string;
  weightPct: number;
}

export function generatePersonalizedAnalysis(userData: UserData) {
  // 1. 사용자 % 변화율 계산: (현재 - 시작) / 시작 * 100
  const userLossPct = ((userData.currentWeight - userData.startWeightBeforeDrug) / userData.startWeightBeforeDrug) * 100;
  
  // 2. 현재 스테이지 판별
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek < s.end) || STAGES[STAGES.length - 1];

  // 3. 임상 평균 대비 비교
  const selectedDrug = CLINICAL_DATA[userData.drugType];
  const idx = selectedDrug.weeks.findIndex(w => w >= userData.currentWeek);
  
  let clinicalVal = 0;
  if (userData.drugType === 'MOUNJARO') {
    const data = CLINICAL_DATA.MOUNJARO;
    const doseKey = `${userData.currentDose}mg` as keyof typeof data.dose;
    clinicalVal = (data.dose[doseKey] || data.dose["15mg"])[idx === -1 ? data.weeks.length - 1 : idx];
  } else {
    clinicalVal = CLINICAL_DATA.WEGOVY.values[idx === -1 ? CLINICAL_DATA.WEGOVY.weeks.length - 1 : idx];
  }

  const diffPct = (userLossPct - clinicalVal).toFixed(1);
  const comparisonMsg = `동일 주차 기준, ${selectedDrug.name} 평균 대비 ${Math.abs(Number(diffPct))}%p ${Number(diffPct) <= 0 ? '추가 감량 중' : '위'}에 있습니다.`;

  // 4. 정보 디자인용 로드맵 데이터 구성 (에러 해결: id를 phase로 매핑)
  const roadmap: RoadmapStep[] = STAGES.map(s => {
    const sIdx = selectedDrug.weeks.findIndex(w => w >= s.start);
    let sVal = 0;
    if (userData.drugType === 'MOUNJARO') {
      const doseKey = `${userData.currentDose}mg` as keyof typeof CLINICAL_DATA.MOUNJARO.dose;
      sVal = (CLINICAL_DATA.MOUNJARO.dose[doseKey] || CLINICAL_DATA.MOUNJARO.dose["15mg"])[sIdx === -1 ? 10 : sIdx];
    } else {
      sVal = CLINICAL_DATA.WEGOVY.values[sIdx === -1 ? 11 : sIdx];
    }

    return {
      week: s.start,
      weightPct: sVal,
      phase: s.id,
      name: s.name,
      icon: s.icon,
      color: s.color,
      start: s.start,
      end: s.end,
      msg: s.msg
    };
  });

  return {
    userLossPct: Number(userLossPct.toFixed(1)),
    currentStage,
    comparisonMsg,
    roadmap
  };
}
