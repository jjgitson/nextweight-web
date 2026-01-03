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

  // 3. 임상 평균 데이터 추출 (타입 안전성 확보)
  let clinicalVal = 0;
  const drugName = userData.drugType === 'MOUNJARO' ? '터제타파이드' : '위고비';
  
  if (userData.drugType === 'MOUNJARO') {
    const data = CLINICAL_DATA.MOUNJARO;
    const idx = data.weeks.findIndex(w => w >= userData.currentWeek);
    const doseKey = `${userData.currentDose}mg` as keyof typeof data.dose;
    clinicalVal = (data.dose[doseKey] || data.dose["15mg"])[idx === -1 ? data.weeks.length - 1 : idx];
  } else {
    const data = CLINICAL_DATA.WEGOVY;
    const idx = data.weeks.findIndex(w => w >= userData.currentWeek);
    clinicalVal = data.values[idx === -1 ? data.weeks.length - 1 : idx];
  }

  const diffPct = (userLossPct - clinicalVal).toFixed(1);

  // 4. 정보 디자인용 로드맵 데이터 구성 (id를 phase 필드로 매핑하여 에러 해결)
  const roadmap: RoadmapStep[] = STAGES.map(s => ({
    week: s.start,
    weightPct: 0, 
    phase: s.id, // 에러 해결 포인트
    name: s.name,
    icon: s.icon,
    color: s.color,
    start: s.start,
    end: s.end,
    msg: s.msg
  }));

  return {
    userLossPct: Number(userLossPct.toFixed(1)),
    currentStage,
    comparisonMsg: `동일 주차 기준, ${drugName} 평균 대비 ${Math.abs(Number(diffPct))}%p ${Number(diffPct) <= 0 ? '추가 감량 중' : '위'}에 있습니다.`,
    roadmap
  };
}
