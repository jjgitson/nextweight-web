// /lib/roadmap-engine.ts
import { DRUG_TYPES, MounjaroPoint, WegovyPoint, CLINICAL_DATA, STAGES } from './drug-config';

export interface UserData {
  userName: string; userAge: number; userGender: string;
  currentWeight: number; targetWeight: number;
  drugStatus: string; drugType: keyof typeof DRUG_TYPES;
  currentDose: number; currentWeek: number; startWeightBeforeDrug: number;
  muscleMass: string; exercise: string; budget: string;
  mainConcern: string; resolution: string;
}

export function generatePersonalizedRoadmap(userData: UserData) {
  const isMounjaro = userData.drugType === 'MOUNJARO';
  const drug = DRUG_TYPES[userData.drugType];
  const clinical = drug.clinicalData;

  // 1. 요구사항: 사용자 % 변화율 계산
  const userLossPct = ((userData.currentWeight - userData.startWeightBeforeDrug) / userData.startWeightBeforeDrug) * 100;
  
  // 2. 요구사항: 현재 스테이지 판별 (0-4, 4-16, 16-36, 36+)
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek < s.end) || STAGES[STAGES.length - 1];

  // 3. 임상 평균 대비 비교 메시지 생성
  const clinicalPoint = [...clinical].reverse().find(p => p.week <= userData.currentWeek) || clinical[0];
  let clinicalPercent = isMounjaro 
    ? (clinicalPoint as MounjaroPoint).mg15 
    : (clinicalPoint as WegovyPoint).mg24;

  const diffPct = (userLossPct - clinicalPercent).toFixed(1);
  const comparisonMsg = `동일 주차 기준, ${isMounjaro ? '터제타파이드' : '위고비'} 평균 곡선 대비 ${Math.abs(Number(diffPct))}%p ${Number(diffPct) <= 0 ? '추가 감량 중' : '위'}에 있습니다.`;

  // 4. 정보 디자인용 로드맵 데이터 구성
  const roadmap = clinical.map((c: any) => {
    const cp = isMounjaro ? c.mg15 : c.mg24;
    const stage = STAGES.find(s => c.week >= s.start && c.week < s.end) || STAGES[STAGES.length - 1];
    
    return {
      week: c.week,
      weightPct: cp,
      phase: stage.name,
      icon: stage.icon,
      color: stage.color,
      start: stage.start,
      end: stage.end,
      msg: stage.msg,
      name: stage.visualName
    };
  });

  return { 
    performance: true, 
    roadmap, 
    drugName: drug.name,
    analysis: { userLossPct: userLossPct.toFixed(1), currentStage, comparisonMsg }
  };
}
