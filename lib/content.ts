// /lib/content.ts

export const SIDE_EFFECT_GUIDE = {
  NAUSEA: {
    title: "오심/구토 케어",
    check: "한 끼 양이 평소보다 많았나요?",
    action: "소량씩 5~6회로 나누어 드시고, 식사 도중 음료 섭취를 줄이세요.",
    ref: "J Clin Med. 2022"
  },
  CONSTIPATION: {
    title: "변비 케어",
    check: "하루에 물을 2L 이상 마셨나요?",
    action: "식이섬유 섭취를 늘리고, 매일 20분 이상 가벼운 산책을 권장합니다.",
    ref: "Int J Obes. 2025"
  },
  DIARRHEA: {
    title: "설사/복부 불편",
    check: "기름지거나 자극적인 음식을 드셨나요?",
    action: "공복 후 폭식을 피하고, 저자극 식단(죽, 삶은 채소 등)으로 전환하세요.",
    ref: "Nature. 2025"
  }
};

export const HMB_GUIDE_CONTENT = {
  title: "근육 사수를 위한 HMB 가이드",
  description: "터제타파이드/세마글루타이드 사용 시 발생하는 근육 손실을 방어하는 핵심 영양 전략입니다.",
  benefits: [
    "근단백질 분해 억제 및 합성 촉진",
    "급격한 체중 감량 시 제지방(근육) 보존",
    "대사 가교 형성으로 요요 현상 방지"
  ],
  usage: "하루 3g 섭취 (식사 관계 없이 분할 섭취 권장)"
};
