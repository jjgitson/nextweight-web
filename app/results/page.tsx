// /app/results/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronDown } from "lucide-react";
import { generatePersonalizedAnalysis, UserData } from "../../lib/roadmap-engine";

// 차트는 CSR 전용
const RoadmapChart = dynamic(() => import("../../components/RoadmapChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[260px] md:h-[360px] bg-slate-50 animate-pulse rounded-3xl" />
  ),
});

function safeNumber(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function safeText(v: string | null, fallback: string) {
  const t = (v ?? "").trim();
  return t.length ? t : fallback;
}

type DrugType = "MOUNJARO" | "WEGOVY";

function formatDrugName(drugType: DrugType) {
  return drugType === "MOUNJARO" ? "마운자로" : "위고비";
}

function formatDose(drugType: DrugType, dose: number) {
  if (!dose || dose <= 0) return "0 mg";
  // 용량 표기 통일
  if (drugType === "WEGOVY") return `${dose} mg`;
  return `${dose} mg`;
}

function calcGoalLossKg(current: number, target: number) {
  const v = current - target;
  return Math.round(v * 10) / 10;
}

function calcGoalLossPct(current: number, target: number) {
  if (!current) return 0;
  const pct = ((current - target) / current) * 100;
  return Math.round(pct * 10) / 10;
}

function getSelectedBudgetBlock(budget: string) {
  const b = budget || "표준형";
  if (b.includes("실속")) return "실속형";
  if (b.includes("집중")) return "집중형";
  return "표준형";
}

function pickTriggerAdvice(u: any) {
  const budget = getSelectedBudgetBlock(u.budget);
  const drugType = u.drugType as DrugType;
  const muscleMass = u.muscleMass || "모름";
  const drugStatus = u.drugStatus || "사용 전";
  const goalLossKg = calcGoalLossKg(u.currentWeight, u.targetWeight);

  const isTirz = drugType === "MOUNJARO";
  const isBudgetThrifty = budget === "실속형";
  const isBudgetStandard = budget === "표준형";
  const isMuscleLow = muscleMass === "이하";
  const isPre = drugStatus === "사용 전";

  const out: { title: string; body: string; intent: string }[] = [];

  if (isBudgetThrifty && isTirz) {
    out.push({
      title: "비용 효율을 지키는 핵심 행동",
      body:
        "강력한 감량 효과만큼 근육도 빠르게 빠질 수 있습니다. 돈 안 드는 '계단 오르기'가 현재 당신의 비싼 약값을 지키는 유일한 방법입니다.",
      intent: "비용 효율 강조",
    });
  }

  if (isBudgetStandard && isMuscleLow) {
    out.push({
      title: "근육 손실 방어는 보험입니다",
      body:
        "현재 골격근량이 위험 수준입니다. 월 5만 원의 HMB 투자가 향후 발생할 500만 원의 재투약 비용을 막는 가장 똑똑한 보험입니다.",
      intent: "경제적 이득 강조",
    });
  }

  if (isPre && goalLossKg > 10) {
    out.push({
      title: "장기 투약 가능성 대비",
      body:
        "장기 투약이 예상됩니다. 초기부터 예산을 '표준형'으로 설정하여 근육을 지켜야, 최종적으로 약물 사용 기간을 줄여 총비용을 아낄 수 있습니다.",
      intent: "전략적 선택 유도",
    });
  }

  // 아무 트리거도 없으면, 기본 메시지
  if (!out.length) {
    out.push({
      title: "GPS 로드맵 한 줄 요약",
      body:
        "GLP-1은 단기 프로그램이 아닌 장기 관리 도구입니다. 목표 체중 도달 후에도 GPS 로드맵은 대사 건강을 지키는 자산이 됩니다.",
      intent: "핵심 컨셉",
    });
  }

  return out;
}

function ResultsContent() {
  const sp = useSearchParams();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // 검색 파라미터 -> UserData
  // startDate는 다음 단계에서 UserData 타입에 추가할 예정이므로 여기서는 함께 전달합니다.
  const userData: UserData & { startDate?: string; weekMode?: string } = {
    userName: safeText(sp.get("userName"), "사용자"),
    userAge: safeNumber(sp.get("userAge"), 35),
    userGender: safeText(sp.get("userGender"), "여성"),

    currentWeight: safeNumber(sp.get("currentWeight"), 80),
    targetWeight: safeNumber(sp.get("targetWeight"), 70),

    startWeightBeforeDrug: safeNumber(sp.get("startWeightBeforeDrug"), 80),
    drugType: (safeText(sp.get("drugType"), "MOUNJARO") as DrugType) as any,
    currentDose: safeNumber(sp.get("currentDose"), 0),
    currentWeek: safeNumber(sp.get("currentWeek"), 0),
    drugStatus: safeText(sp.get("drugStatus"), "사용 전"),

    budget: safeText(sp.get("budget"), "표준형"),
    muscleMass: safeText(sp.get("muscleMass"), "모름"),
    exercise: safeText(sp.get("exercise"), "안 함"),
    mainConcern: safeText(sp.get("mainConcern"), "요요"),
    resolution: safeText(sp.get("resolution"), ""),

    // 신규(다음 단계에서 UserData로 편입)
    startDate: sp.get("startDate") || undefined,
    weekMode: sp.get("weekMode") || undefined,
  };

  const analysis = useMemo(() => generatePersonalizedAnalysis(userData as any), [userData]);

  const drugType = (userData.drugType as DrugType) || "MOUNJARO";
  const budgetTier = getSelectedBudgetBlock(userData.budget);
  const goalLossKg = calcGoalLossKg(userData.currentWeight, userData.targetWeight);
  const goalLossPct = calcGoalLossPct(userData.currentWeight, userData.targetWeight);

  const budgetDescription =
    "GLP-1은 비용이 큰 다이어트입니다. 예산에 맞게 효율적인 전략이 필요합니다. 사용자마다 관리 범위가 달라 3가지 예산 등급으로 표현했습니다.";

  const coreBlocks = [
    {
      title: "GPS 로드맵: 길을 잃지 않는 다이어트",
      body: "G(약물), P(단백질), S(근력운동)",
    },
    {
      title: "G (GLP-1)",
      body: "호르몬 모방을 통한 식욕 조절과 포만감 유지",
      sub: "마운자로/위고비의 역할",
    },
    {
      title: "P (Protein)",
      body: "하루 100g 단백질, 25-30g씩 4회 분할 섭취",
      sub: "근손실 방어의 핵심",
    },
    {
      title: "S (Strength)",
      body: "대사 기관으로서의 근육 지키기 (마이오카인 분비)",
      sub: "요요 방지의 실질적 동력",
    },
  ];

  const budgetTiers = [
    {
      tier: "실속형",
      mech: "자가 대사 활성화",
      action: "일상 활동량 20% 강제 증가, 고단백 저비용 식단(계란, 두부)",
      value: "추가 지출 0원으로 기초대사량 하한선 사수, 약값 매몰 방지",
    },
    {
      tier: "표준형",
      mech: "근육 이화 작용 차단",
      action: "HMB 3g + 유청 단백질 병행 (근손실 방어 최적화)",
      value: "월 5~10만 원 투자가 근육 1kg 사수 → 재투약 비용 200만 원 절감",
    },
    {
      tier: "집중형",
      mech: "신진대사 재구조화",
      action: "전문 저항성 운동 가이드 + 프리미엄 영양(HMB+Creatine)",
      value: "최단기 대사 정상화로 약물 의존도 조기 탈피 및 완벽한 요요 차단",
    },
  ];

  const drugStages =
    drugType === "MOUNJARO"
      ? [
          { dose: "2.5", dur: "4주", guide: "[적응기] 기초 수분 2L 및 가벼운 산책 시작" },
          { dose: "5", dur: "4주", guide: "[가속기] 본격 감량 시작, 단백질 섭취량 1.5배 상향" },
          { dose: "7.5", dur: "4~8주", guide: "[관리기] 근육 손실 주의보, HMB 3g 필수 권장" },
          { dose: "10", dur: "유지", guide: "[고효율] 고강도 저항성 운동 주 3회 병행" },
          { dose: "12.5", dur: "유지", guide: "[집중] 체성분 분석 주기 단축, 전문가 상담 권장" },
          { dose: "15", dur: "유지", guide: "[최종] 목표 도달 후 테이퍼링 계획 수립" },
        ]
      : [
          { dose: "0.25", dur: "4주", guide: "[입문] 식단 일기 작성 및 저칼로리 식단 적응" },
          { dose: "0.5", dur: "4주", guide: "[순항] 규칙적인 유산소 운동 병행" },
          { dose: "1", dur: "유지", guide: "[안정] 중강도 근력 운동 추가, 근손실 방지" },
          { dose: "1.7", dur: "유지", guide: "[강화] 영양 밀도 높은 식단 구성" },
          { dose: "2.4", dur: "유지", guide: "[정점] 유지 관리 및 중단 시나리오 검토" },
        ];

  const weekSegments = [
    { range: "1~2주", name: "초기 적응", exp: "체중 변화 적음, 가벼운 오심 가능", act: "낮은 용량 적응, 수분 섭취 집중" },
    { range: "3~6주", name: "식욕 변화", exp: "야식 갈망 감소, 1~2kg 감량 시작", act: "식사 패턴 개선, 단백질 섭취 의식" },
    { range: "6~12주", name: "의미 있는 변화", exp: "주당 0.5~1kg 감량, 치료 용량 도달", act: "GPS 전략 본격화, 근력운동 필수" },
    { range: "3~6개월", name: "정체기 & 조정", exp: "초기 체중 10% 감량, 체지방 감소 뚜렷", act: "HMB 3g 추가, 운동 강도 재조정" },
  ];

  const keyRules = [
    {
      k: "단백질 퍼스트",
      v: "매 끼니 단백질(계란, 닭가슴살, 생선 등)을 먼저 섭취하여 포만감을 유도하고 근육 소실을 방어합니다.",
    },
    {
      k: "수분 2L의 법칙",
      v: "약물 작용으로 인한 변비와 탈수를 막기 위해 하루 최소 2L의 미지근한 물을 마십니다.",
    },
    {
      k: "중력 저항",
      v: "주 2~3회는 반드시 자신의 체중이나 덤벨을 이용한 근력 운동을 병행해야 투약 종료 후 요요가 없습니다.",
    },
  ];

  const pitfalls = [
    {
      when: "1~2주 차",
      name: "적응기 고비",
      tip: "울렁거림이나 무기력증이 올 수 있습니다. 소량씩 자주 먹는 전략이 필요합니다.",
    },
    {
      when: "8~12주 차",
      name: "첫 번째 정체기",
      tip: "몸이 바뀐 체중에 적응하며 감량이 더뎌집니다. 이때 포기하지 않는 것이 관리의 핵심 지점입니다.",
    },
    {
      when: "투약 종료 전후",
      name: "리바운드 주의보",
      tip: "약물 농도가 떨어지며 억제됐던 허기가 몰려옵니다. 이때 HMB 등 대사 가교 전략이 승부처입니다.",
    },
  ];

  const triggers = pickTriggerAdvice(userData);

  const sections = [
    {
      id: "concept",
      title: "GPS 로드맵이란?",
      content:
        "G(약물)로 식욕과 포만감을 안정시키고, P(단백질)로 근손실을 막고, S(근력운동)으로 대사량을 지키는 구조입니다. 목표 체중 이후에도 요요를 막는 설계가 핵심입니다.",
    },
    {
      id: "evidence",
      title: "임상 비교 데이터 근거",
      content:
        "본 시뮬레이션은 대규모 임상 데이터의 평균치를 기반으로 하며, 실제 감량 속도는 개인의 대사 상태와 성별, 나이에 따라 다를 수 있습니다. (NEJM 2021, 2022 / FDA Prescribing Information 기반)",
    },
    {
      id: "disclaimer",
      title: "비의료 자기관리 면책 문구",
      content:
        "본 서비스는 의료 진단이 아닌 자기관리 가이드 도구입니다. 증상 악화, 심각한 부작용, 기존 질환이 있는 경우 의료진과 상담하세요.",
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-6 pt-8 space-y-6">
        {/* 상단 핵심 카드 */}
        <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-black">
                {analysis.currentStage?.name || "로드맵"}
              </div>
              <div className="mt-3 text-5xl md:text-6xl font-black tracking-tight">
                {Math.max(0, Math.floor(userData.currentWeek))}주차
              </div>
              <div className="mt-2 text-sm text-white/70">
                동일 주차 기준, {formatDrugName(drugType)} 평균 대비{" "}
                {analysis.statusCard?.comparison || "비교 정보 없음"}
              </div>
            </div>

            <div className="text-left md:text-right space-y-1">
              <div className="text-sm text-white/70">현재 투약</div>
              <div className="text-lg font-black">
                {formatDrugName(drugType)} {formatDose(drugType, userData.currentDose)}
              </div>
              <div className="text-sm text-white/70">{budgetTier} 전략</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-3xl p-5 border border-white/10">
            <div className="text-white/80 text-sm font-black mb-2">이번 주 핵심 메시지</div>
            <div className="text-white text-lg md:text-xl font-black leading-snug">
              “{analysis.currentStage?.msg || "GPS 전략으로 대사 가교를 설계하세요."}”
            </div>
          </div>
        </div>

        {/* 사용자 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-3xl border border-slate-100 bg-slate-50 p-6">
            <div className="text-sm text-slate-500 font-black">사용자 정보</div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <div className="text-[11px] text-slate-400 font-black">성함</div>
                <div className="text-sm font-black text-slate-900 truncate">{userData.userName}</div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <div className="text-[11px] text-slate-400 font-black">나이/성별</div>
                <div className="text-sm font-black text-slate-900">
                  {userData.userAge} / {userData.userGender}
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <div className="text-[11px] text-slate-400 font-black">운동</div>
                <div className="text-sm font-black text-slate-900">{userData.exercise}</div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <div className="text-[11px] text-slate-400 font-black">골격근량</div>
                <div className="text-sm font-black text-slate-900">{userData.muscleMass}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <div className="text-[11px] text-slate-400 font-black">현재 → 목표</div>
                <div className="text-sm font-black text-slate-900">
                  {userData.currentWeight}kg → {userData.targetWeight}kg
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <div className="text-[11px] text-slate-400 font-black">목표 감량</div>
                <div className="text-sm font-black text-slate-900">
                  {goalLossKg}kg ({goalLossPct}%)
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-100 p-4">
                <div className="text-[11px] text-slate-400 font-black">투약 시작일</div>
                <div className="text-sm font-black text-slate-900">
                  {userData.startDate ? userData.startDate : "미입력"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-amber-50/60 p-6">
            <div className="text-sm text-slate-500 font-black">예산 안내</div>
            <div className="mt-2 text-sm text-slate-700 leading-relaxed">{budgetDescription}</div>
            <div className="mt-4 rounded-2xl bg-white border border-amber-100 p-4">
              <div className="text-[11px] text-slate-400 font-black">선택된 예산</div>
              <div className="text-sm font-black text-slate-900">{budgetTier}</div>
              <div className="text-xs text-slate-500 mt-2">예산에 따라 P/S 전략의 강도가 달라집니다.</div>
            </div>
          </div>
        </div>

        {/* GPS KPI Row (기존 유지) */}
        <div className="grid grid-cols-3 gap-3">
          {analysis.gps?.map((kpi: any, idx: number) => (
            <div
              key={idx}
              className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center"
            >
              <div className="text-[10px] font-black text-slate-400 mb-1">{kpi.label}</div>
              <div className="text-[12px] font-black text-slate-900 truncate">{kpi.value}</div>
              <div
                className={`h-1 w-5 mx-auto mt-3 rounded-full ${
                  kpi.status === "good"
                    ? "bg-emerald-500"
                    : kpi.status === "attention"
                    ? "bg-orange-500 animate-pulse"
                    : "bg-slate-300"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Core Concept */}
        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
          <div className="text-lg font-black text-slate-900">Core Concept</div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreBlocks.map((b, i) => (
              <div key={i} className="rounded-3xl bg-white border border-slate-100 p-5">
                <div className="text-sm font-black text-slate-900">{b.title}</div>
                <div className="mt-2 text-sm text-slate-700 leading-relaxed">{b.body}</div>
                {b.sub ? <div className="mt-2 text-xs text-slate-500">{b.sub}</div> : null}
              </div>
            ))}
          </div>
        </div>

        {/* Trigger advice */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6">
          <div className="text-lg font-black text-slate-900">이번 사용자에게 중요한 포인트</div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {triggers.map((t, i) => (
              <div key={i} className="rounded-3xl bg-slate-50 border border-slate-100 p-5">
                <div className="text-sm font-black text-slate-900">{t.title}</div>
                <div className="mt-2 text-sm text-slate-700 leading-relaxed">{t.body}</div>
                <div className="mt-3 text-xs text-slate-500">의도: {t.intent}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget tier strategy */}
        <div className="rounded-3xl border border-slate-100 bg-amber-50/60 p-6">
          <div className="text-lg font-black text-slate-900">예산 등급별 전략</div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {budgetTiers.map((t) => {
              const selected = t.tier === budgetTier;
              return (
                <div
                  key={t.tier}
                  className={`rounded-3xl p-5 border transition-all ${
                    selected
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-white text-slate-900 border-slate-100"
                  }`}
                >
                  <div className="text-sm font-black">{t.tier}</div>
                  <div className={`mt-2 text-xs ${selected ? "text-white/70" : "text-slate-500"}`}>
                    대사 방어 핵심 기전
                  </div>
                  <div className={`mt-1 text-sm font-black ${selected ? "text-white" : "text-slate-900"}`}>
                    {t.mech}
                  </div>

                  <div className={`mt-4 text-xs ${selected ? "text-white/70" : "text-slate-500"}`}>Action</div>
                  <div className={`mt-1 text-sm leading-relaxed ${selected ? "text-white" : "text-slate-700"}`}>
                    {t.action}
                  </div>

                  <div className={`mt-4 text-xs ${selected ? "text-white/70" : "text-slate-500"}`}>Value</div>
                  <div className={`mt-1 text-sm leading-relaxed ${selected ? "text-white" : "text-slate-700"}`}>
                    {t.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-50 shadow-sm">
          <RoadmapChart userData={userData as any} analysis={analysis as any} />
        </div>

        {/* Dose guide */}
        <div className="rounded-3xl border border-slate-100 bg-sky-50/60 p-6">
          <div className="text-lg font-black text-slate-900">용량 단계 가이드</div>
          <div className="mt-2 text-sm text-slate-700">
            {formatDrugName(drugType)} 용량 단계별 권장 유지 기간과 핵심 행동을 정리했습니다.
          </div>
          <div className="mt-5 overflow-hidden rounded-3xl border border-slate-100 bg-white">
            <div className="grid grid-cols-3 text-[11px] font-black text-slate-500 bg-slate-50 border-b border-slate-100">
              <div className="p-4">용량 (mg)</div>
              <div className="p-4">권장 유지 기간</div>
              <div className="p-4">단계별 대사 가이드</div>
            </div>
            {drugStages.map((r, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 text-sm ${
                  i !== drugStages.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="p-4 font-black text-slate-900">{r.dose}</div>
                <div className="p-4 text-slate-700">{r.dur}</div>
                <div className="p-4 text-slate-700 leading-relaxed">{r.guide}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Week segment guide */}
        <div className="rounded-3xl border border-slate-100 bg-emerald-50/60 p-6">
          <div className="text-lg font-black text-slate-900">주차 구간별 가이드</div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {weekSegments.map((w) => (
              <div key={w.range} className="rounded-3xl bg-white border border-slate-100 p-5">
                <div className="text-xs text-slate-500 font-black">{w.range}</div>
                <div className="mt-1 text-sm font-black text-slate-900">{w.name}</div>
                <div className="mt-3 text-xs text-slate-500 font-black">기대 변화</div>
                <div className="mt-1 text-sm text-slate-700">{w.exp}</div>
                <div className="mt-3 text-xs text-slate-500 font-black">Action</div>
                <div className="mt-1 text-sm text-slate-700">{w.act}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules + pitfalls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
            <div className="text-lg font-black text-slate-900">핵심 수칙</div>
            <div className="mt-4 space-y-3">
              {keyRules.map((r) => (
                <div key={r.k} className="rounded-3xl bg-white border border-slate-100 p-5">
                  <div className="text-sm font-black text-slate-900">{r.k}</div>
                  <div className="mt-2 text-sm text-slate-700 leading-relaxed">{r.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-rose-50/60 p-6">
            <div className="text-lg font-black text-slate-900">고비 구간</div>
            <div className="mt-4 space-y-3">
              {pitfalls.map((p) => (
                <div key={p.name} className="rounded-3xl bg-white border border-slate-100 p-5">
                  <div className="text-xs text-slate-500 font-black">{p.when}</div>
                  <div className="mt-1 text-sm font-black text-slate-900">{p.name}</div>
                  <div className="mt-2 text-sm text-slate-700 leading-relaxed">{p.tip}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible details (기존 유지, 내용만 정리) */}
        <div className="space-y-2 border-t border-slate-50 pt-6">
          {sections.map((sec) => (
            <div key={sec.id} className="border-b border-slate-50 pb-2">
              <button
                type="button"
                className="w-full flex justify-between items-center py-4 text-slate-900 font-black"
                onClick={() =>
                  setOpenSections((prev) => ({
                    ...prev,
                    [sec.id]: !prev[sec.id],
                  }))
                }
              >
                <span>{sec.title}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    openSections[sec.id] ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSections[sec.id] && (
                <div className="pb-6 text-slate-700 text-sm leading-relaxed animate-in fade-in">
                  {sec.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 작은 각오 표시 */}
        {userData.resolution ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-6">
            <div className="text-sm text-slate-500 font-black">다이어트 각오</div>
            <div className="mt-2 text-slate-900 font-black leading-relaxed">{userData.resolution}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-600 font-black">
          결과를 불러오는 중입니다...
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
