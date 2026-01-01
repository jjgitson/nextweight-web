// /lib/drug-config.ts

export const CLINICAL_WEEKS = [0, 4, 8, 12, 20, 36, 52, 72];

// 마스터 시트 [Clinical_Evidence] 데이터 반영 
export interface MounjaroPoint {
  week: number;
  placebo: number;
  mg5: number;
  mg10: number;
  mg15: number;
}

export interface WegovyPoint {
  week: number;
  placebo: number;
  mg24: number;
}

export const DRUG_TYPES = {
  MOUNJARO: {
    name: "마운자로", // 터제타파이드
    steps: [2.5, 5, 7.5, 10, 12.5, 15],
    unit: "mg",
    clinicalData: [
      { week: 0, placebo: 0, mg5: 0, mg10: 0, mg15: 0 },
      { week: 4, placebo: -1, mg5: -3, mg10: -3.5, mg15: -3.8 },
      { week: 8, placebo: -1.6, mg5: -6, mg10: -6.5, mg15: -7 },
      { week: 12, placebo: -2, mg5: -8, mg10: -8.5, mg15: -9 },
      { week: 20, placebo: -2.7, mg5: -11, mg10: -11.5, mg15: -12 },
      { week: 36, placebo: -3, mg5: -14, mg10: -18, mg15: -19 },
      { week: 52, placebo: -3.2, mg5: -15.5, mg10: -20.5, mg15: -21.5 },
      { week: 72, placebo: -2.4, mg5: -16, mg10: -21.4, mg15: -22.5 }
    ] as MounjaroPoint[],
    references: "SURMOUNT-1 (NEJM 2022); 젭바운드 FDA 정보 "
  },
  WEGOVY: {
    name: "위고비",
    steps: [0.25, 0.5, 1.0, 1.7, 2.4],
    unit: "mg",
    clinicalData: [
      { week: 0, placebo: 0, mg24: 0 },
      { week: 4, placebo: -1, mg24: -2.2 },
      { week: 8, placebo: -1.6, mg24: -4 },
      { week: 12, placebo: -2, mg24: -6 },
      { week: 20, placebo: -2.7, mg24: -9.4 },
      { week: 36, placebo: -3, mg24: -13.3 },
      { week: 52, placebo: -3.2, mg24: -15.4 },
      { week: 72, placebo: -2.4, mg24: -16.0 }
    ] as WegovyPoint[],
    references: "STEP 1 (NEJM 2021); 위고비 FDA 정보 "
  }
};
