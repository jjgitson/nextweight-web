// /lib/drug-config.ts
export const DRUG_TYPES = {
  MOUNJARO: { // 터제타파이드
    name: "마운자로",
    steps: [2.5, 5, 7.5, 10, 12.5, 15], [cite: 9]
    unit: "mg",
    // 시트 [Clinical_Evidence] 데이터 반영 (15mg 기준) 
    clinicalData: [
      { week: 0, percent: 0 },
      { week: 4, percent: -3.8 },
      { week: 8, percent: -7.0 },
      { week: 12, percent: -9.0 },
      { week: 20, percent: -12.0 },
      { week: 36, percent: -19.0 },
      { week: 52, percent: -21.5 },
      { week: 72, percent: -22.5 }
    ],
    references: "SURMOUNT-1 (NEJM 2022); 젭바운드 FDA 정보 "
  },
  WEGOVY: { // 세마글루타이드
    name: "위고비",
    steps: [0.25, 0.5, 1.0, 1.7, 2.4], [cite: 9]
    unit: "mg",
    // 시트 [Clinical_Evidence] 데이터 반영 (2.4mg 기준) 
    clinicalData: [
      { week: 0, percent: 0 },
      { week: 4, percent: -2.2 },
      { week: 8, percent: -4.0 },
      { week: 12, percent: -6.0 },
      { week: 20, percent: -9.4 },
      { week: 36, percent: -13.3 },
      { week: 52, percent: -15.4 },
      { week: 72, percent: -16.0 }
    ],
    references: "STEP 1 (NEJM 2021); 위고비 FDA 정보 "
  }
};
