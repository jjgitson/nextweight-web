// /lib/roadmap-engine.ts
import { CLINICAL_DATA, STAGES, DRUG_TYPES } from './drug-config';

export interface UserData {
  userName: string; currentWeight: number; startWeightBeforeDrug: number;
  drugType: keyof typeof DRUG_TYPES; currentDose: number; currentWeek: number;
  drugStatus: string; budget: string; muscleMass: string; exercise: string; mainConcern: string;
}

// 빌드 에러 해결: 함수명 일치
export function generatePersonalizedAnalysis(userData: UserData) {
  // 1. 변화율(%) 계산: (현재 - 시작) / 시작 * 100
  const startWeight = userData.startWeightBeforeDrug || userData.currentWeight || 1;
  const userLossPct = ((userData.currentWeight - startWeight) / startWeight) * 100;
  
  // 2. 현재 스테이지 판별
  const currentStage = STAGES.find(s => userData.currentWeek >= s.start && userData.currentWeek < s.end) || STAGES[STAGES.length - 1];

  // 3. 임상 대비 격차 산출 (Wegovy vs Mounjaro 분기 처리로 타입 에러 방지)
  let clinicalVal = 0;
  const drugConfig = DRUG_TYPES[userData.drugType];
  if (userData.drugType === 'MOUNJARO') {
    const data = CLINICAL_DATA.MOUNJARO;
    const idx = data.weeks.findIndex(w => w >= userData.currentWeek);
    clinicalVal = data.dose["15mg"][idx === -1 ? 10 : idx];
  } else {
    const data = CLINICAL_DATA.WEGOVY;
    const idx = data.weeks.findIndex(w => w >= userData.currentWeek);
    clinicalVal = data.values[idx === -1 ? 11 : idx];
  }
  const diffPct = (userLossPct - clinicalVal).toFixed(1);

  // 4. ROI 요약 (budget 필드 기반 동적 생성)
  const roiSummary = userData.budget === '표준형' 
    ? "현재 예산 전략(표준형) 기준, 재투약 방어 효과가 기대됩니다."
    : "현재 예산 전략에 기반한 기초대사량 사수로 약값 매몰 방지에 집중하고 있습니다.";

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
    ],
    roiSummary,
    actionSentence: currentStage.msg
  };
}
