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
  week: number; weightPct: number; phase: string; icon: string; 
  color: string; start: number; end: number; msg: string;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  // 1. 사용자 % 변화율 계산: (현재 - 시작) / 시작 * 100
  const userLossPct = ((userData.currentWeight - userData.startWeightBeforeDrug) / userData.startWeightBeforeDrug) * 100;
  
  // 2. 현재 스테이지 판별 (0-4, 4-16, 16-36, 36+)
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek < s.end) || STAGES[STAGES.length - 1];

  // 3. 임상 평균 대비 비교 메시지 생성
  const selectedDrug = CLINICAL_DATA[userData.drugType];
  const idx = selectedDrug.weeks.findIndex(w => w >= userData.currentWeek);
  const clinicalVal = userData.drugType === 'MOUNJARO' 
    ? (selectedDrug.dose?.[`${userData.currentDose}mg`] || selectedDrug.dose?.["15mg"])[idx === -1 ? selectedDrug.weeks.length - 1 : idx]
    : selectedDrug.values[idx === -1 ? selectedDrug.weeks.length - 1 : idx];

  const diffPct = (userLossPct - (clinicalVal || 0)).toFixed(1);
  const comparisonMsg = `동일 주차 기준, ${selectedDrug.name} 평균 곡선 대비 ${Math.abs(Number(diffPct))}%p ${Number(diffPct) <= 0 ? '추가 감량 중' : '위'}에 있습니다.`;

  // 4. 정보 디자인용 전체 로드맵 구성
  const roadmap: RoadmapStep[] = STAGES.map(s => ({
    week: s.start,
    weightPct: 0, // 차트 시각화용 보조 데이터
    phase: s.name, icon: s.icon, color: s.color,
    start: s.start, end: s.end, msg: s.msg
  }));

  return { performance: true, roadmap, userLossPct, currentStage, comparisonMsg };
}
