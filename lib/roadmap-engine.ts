// /lib/drug-config.ts
export const DRUG_TYPES = {
  MOUNJARO: { // 터제타파이드 (Tirzepatide)
    name: "마운자로",
    steps: [2.5, 5, 7.5, 10, 12.5, 15],
    unit: "mg",
    // 시트 [Clinical_Evidence] 기반 데이터 (0, 4, 8, 12, 20, 36, 52, 72주)
    clinicalData: {
      "5mg": [0, -3, -6, -8, -11, -14, -15.5, -16],
      "10mg": [0, -3.5, -6.5, -8.5, -11.5, -18, -20.5, -21.4],
      "15mg": [0, -3.8, -7, -9, -12, -19, -21.5, -22.5],
      "placebo": [0, -1, -1.6, -2, -2.7, -3, -3.2, -2.4]
    },
    references: "SURMOUNT-1 (NEJM 2022); 젭바운드 FDA 정보"
  },
  WEGOVY: { // 세마글루타이드 (Semaglutide)
    name: "위고비",
    steps: [0.25, 0.5, 1.0, 1.7, 2.4],
    unit: "mg",
    clinicalData: {
      "2.4mg": [0, -2.2, -4, -6, -9.4, -13.3, -15.4, -16.0],
      "placebo": [0, -1, -1.6, -2, -2.7, -3, -3.2, -2.4]
    },
    references: "STEP 1 (NEJM 2021); 위고비 FDA 정보"
  }
};

export const CLINICAL_WEEKS = [0, 4, 8, 12, 20, 36, 52, 72];
