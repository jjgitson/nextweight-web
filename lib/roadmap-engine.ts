// /lib/roadmap-engine.ts
import { DRUG_CONFIG } from './drug-config';

export function generatePersonalizedRoadmap(data: any) {
  // 데이터가 없을 경우 터제타파이드를 기본값으로 사용
  const config = DRUG_CONFIG[data.drugType as keyof typeof DRUG_CONFIG] || DRUG_CONFIG.TIRZEPATIDE;
  
  const roadmap = config.steps.map((step, index) => ({
    weekNum: index * 4, // 차트 X축 렌더링을 위한 필수 값
    week: index === 0 ? "이번 주" : `D+${index * 4}주`,
    dose: step,
    unit: config.unit,
    phase: step === config.maintenanceDose ? "유지 관리기" : "용량 조절기"
  }));

  return {
    drugName: config.name,
    roadmap: roadmap
  };
}
