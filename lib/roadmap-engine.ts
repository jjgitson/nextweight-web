import { DRUG_CONFIG } from './drug-config';

export function generatePersonalizedRoadmap(data: any) {
  const config = DRUG_CONFIG[data.drugType as keyof typeof DRUG_CONFIG];
  
  const roadmap = config.steps.map((step, index) => ({
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
