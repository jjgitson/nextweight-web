// /lib/drug-config.ts
export const DRUG_TYPES = {
  WEGOVY: {
    name: "위고비",
    originalBrands: ["위고비", "오젬픽"],
    steps: [0.25, 0.5, 1.0, 1.7, 2.4],
    maintenanceDose: 1.0,
    unit: "mg",
    halfLife: "7 days",
    // 시트 Clinical_Evidence 기반 데이터
    clinicalData: [
      { week: 0, percent: 0 },
      { week: 4, percent: -2.2 },
      { week: 8, percent: -4.0 },
      { week: 12, percent: -6.0 },
      { week: 20, percent: -9.4 },
      { week: 36, percent: -13.3 },
      { week: 52, percent: -15.4 },
      { week: 68, percent: -16.0 }
    ],
    references: "STEP 1 (NEJM 2021); FDA Prescribing Information"
  },
  MOUNJARO: {
    name: "마운자로",
    originalBrands: ["마운자로", "젭바운드"],
    steps: [2.5, 5, 7.5, 10, 12.5, 15],
    maintenanceDose: 5.0,
    unit: "mg",
    halfLife: "5 days",
    // 시트 Clinical_Evidence 기반 데이터 (15mg 기준)
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
    references: "SURMOUNT-1 (NEJM 2022); FDA Prescribing Information"
  }
};
