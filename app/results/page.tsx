// /app/results/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronDown } from "lucide-react";
import { generatePersonalizedAnalysis, UserData } from "../../lib/roadmap-engine";

const RoadmapChart = dynamic(() => import("../../components/RoadmapChart"), {
  ssr: false,
  loading: () => <div className="w-full h-[260px] md:h-[360px] bg-slate-50 animate-pulse rounded-3xl" />,
});

function safeNumber(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function formatDose(drugType: "MOUNJARO" | "WEGOVY", dose: number) {
  if (!dose || dose <= 0) return "0 mg";
  const s = Number.isInteger(dose) ? dose.toFixed(0) : String(dose);
  if (drugType === "MOUNJARO") return `터제타파이드 ${s}mg`;
  return `위고비 ${s}mg`;
}

function drugLabel(drugType: "MOUNJARO" | "WEGOVY") {
  return drugType === "MOUNJARO" ? "마운자로" : "위고비";
}

function sectionBgByPhase(phaseName: string) {
  // phaseName은 내부 엔진 상태명에 따라 다를 수 있어, 안전하게 디폴트만 사용
  // 필요하면 STAGES 이름과 맞춰서 매핑하면 됨
  if (phaseName.includes("적응")) return "bg-blue-50";
  if (phaseName.includes("감량")) return "bg-emerald-50";
  if (phaseName.includes("가교")) return "bg-amber-50";
  if (phaseName.includes("유지")) return "bg-purple-50";
  return "bg-slate-50";
}

function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-3xl bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full px-5 py-4 flex justify-between items-center text-slate-700 font-black text-sm"
      >
        <span>{title}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed">{children}</div>}
    </div>
  );
}

function ResultsContent() {
  const sp = useSearchParams();

  const startDate = sp.get("startDate") || "";
  const weekMode = (sp.get("weekMode") as any) || "auto";

  const userData: UserData = {
    userName: sp.get("userName") || "사용자",
    userAge: safeNumber(sp.get("userAge"), 35),
    userGender: (sp.get("userGender") as any) || "여성",

    currentWeight: safeNumber(sp.get("currentWeight"), 80),
    targetWeight: safeNumber(sp.get("targetWeight"), 70),

    startWeightBeforeDrug: safeNumber(sp.get("startWeightBeforeDrug"), safeNumber(sp.get("currentWeight"), 80)),
    drugType: (sp.get("drugType") as any) || "MOUNJARO",
    currentDose: safeNumber(sp.get("currentDose"), 0),
    currentWeek: safeNumber(sp.get("currentWeek"), 0),

    drugStatus: sp.get("drugStatus") || "사용 전",
    budget: sp.get("budget") || "표준형",
    muscleMass: sp.get("muscleMass") || "모름",
    exercise: sp.get("exercise") || "안 함",
    mainConcern: sp.get("mainConcern") || "요요",
    resolution: sp.get("resolution") || "",
  };

  const analysis = useMemo(() => generatePersonalizedAnalysis(userData), [userData]);

  // 콘텐츠 테이블(요청하신 텍스트 반영)
  const coreConcept = {
    title: "GPS 로드맵: 길을 잃지 않는 다이어트",
    desc: "G(약물), P(단백질), S(근력운동) 세 축을 동시에 관리해, 감량 이후 요요를 막는 대사 가교를 설계합니다.",
    items: [
      { k: "G (GLP-1)", v: "호르몬 모방을 통한 식욕 조절과 포만감 유지", note: "마운자로/위고비의 역할" },
      { k: "P (Protein)", v: "하루 100g 단백질, 25-30g씩 4회 분할 섭취", note: "근손실 방어의 핵심" },
      { k: "S (Strength)", v: "대사 기관으로서의 근육 지키기 (마이오카인 분비)", note: "요요 방지의 실질적 동력" },
    ],
  };

  const budgetTable = [
    {
      tier: "실속형",
      mech: "자가 대사 활성화",
      action: "일상 활동량 20% 증가, 고단백 저비용 식단(계란, 두부)",
      value: "추가 지출 0원으로 기초대사량 하한선 사수, 약값 매몰 방지",
    },
    {
      tier: "표준형",
      mech: "근육 이화 작용 차단",
      action: "HMB 3g + 유청 단백질 병행",
      value: "월 5~10만 원 투자가 근육 1kg 사수 → 재투약 비용 절감 논리",
    },
    {
      tier: "집중형",
      mech: "신진대사 재구조화",
      action: "저항성 운동 가이드 + 프리미엄 영양(HMB + Creatine)",
      value: "대사 정상화 가속 → 약물 의존도 조기 탈피 및 요요 방지",
    },
  ];

  const statusTable = [
    {
      s: "투약 전",
      def: "프리-브릿지 단계",
      rec: "투약 시작 전 2주간 근육 저축(단백질 중심)으로 감량 효율 준비",
      note: "투약 기간 단축 목적",
    },
    {
      s: "증량/유지기",
      def: "대사 적응 및 감량기",
      rec: "식욕 억제기일 때 단백질 섭취량을 의도적으로 늘려 근손실 방어",
      note: "체중의 질(quality) 개선",
    },
    {
      s: "테이퍼링기",
      def: "농도 하락 및 가교 형성",
      rec: "약물 용량 감소분만큼 운동 강도를 높여 내인성 대사 활성 유도",
      note: "전환점",
    },
    {
      s: "중단 후",
      def: "자생적 대사 안착기",
      rec: "리바운드 허기를 대비해 고섬유질 + 근력운동 유지",
      note: "요요 고비 극복",
    },
  ];

  const doseGuide = {
    MOUNJARO: [
      { d: "2.5", w: "4주", a: "[적응기] 수분 2L 및 가벼운 산책 시작" },
      { d: "5", w: "4주", a: "[가속기] 단백질 섭취량 상향" },
      { d: "7.5", w: "4~8주", a: "[관리기] 근손실 주의, HMB 3g 권고" },
      { d: "10", w: "유지", a: "[고효율] 저항성 운동 주 3회 병행" },
      { d: "12.5", w: "유지", a: "[집중] 체성분 점검 주기 단축" },
      { d: "15", w: "유지", a: "[최종] 목표 도달 후 테이퍼링 계획 수립" },
    ],
    WEGOVY: [
      { d: "0.25", w: "4주", a: "[입문] 식단 기록 및 저칼로리 적응" },
      { d: "0.5", w: "4주", a: "[순항] 규칙적 유산소 병행" },
      { d: "1", w: "유지", a: "[안정] 중강도 근력운동 추가" },
      { d: "1.7", w: "유지", a: "[강화] 영양 밀도 높은 식단 구성" },
      { d: "2.4", w: "유지", a: "[정점] 유지 관리 및 중단 시나리오 검토" },
    ],
  };

  const weekGuide = [
    { r: "1~2주", n: "초기 적응", t: "체중 변화가 적을 수 있고 가벼운 오심이 있을 수 있음", a: "낮은 용량 적응, 수분 섭취 집중" },
    { r: "3~6주", n: "식욕 변화", t: "야식 갈망 감소, 1~2kg 감량 시작", a: "식사 패턴 개선, 단백질 섭취 의식" },
    { r: "6~12주", n: "의미 있는 변화", t: "주당 0.5~1kg 감량 구간", a: "GPS 전략 본격화, 근력운동 필수" },
    { r: "3~6개월", n: "정체기 & 조정", t: "초기 체중 10% 감량 구간, 체지방 감소 뚜렷", a: "운동 강도 재조정, 단백질/보충 전략 점검" },
  ];

  const habitRules = [
    { k: "식단", s: "단백질 퍼스트", d: "매 끼니 단백질(계란, 생선 등)을 먼저 섭취해 포만감과 근손실 방어를 동시에 노립니다." },
    { k: "식단", s: "수분 2L의 법칙", d: "변비·탈수 예방을 위해 하루 최소 2L의 물 섭취를 목표로 합니다." },
    { k: "운동", s: "중력 저항", d: "주 2~3회는 근력운동을 병행해야 투약 종료 후 요요 가능성이 낮아집니다." },
  ];

  const checkpoints = [
    { t: "1~2주 차", n: "적응기 고비", d: "울렁거림·무기력감이 올 수 있습니다. 소량씩 자주 먹는 전략이 도움이 됩니다." },
    { t: "8~12주 차", n: "첫 번째 정체기", d: "감량이 더뎌질 수 있습니다. 이 구간이 지속의 핵심 포인트가 됩니다." },
    { t: "투약 종료 전후", n: "리바운드 주의보", d: "허기가 강해질 수 있습니다. 이때 단백질/근력운동이 승부처가 됩니다." },
  ];

  const evidence = [
    "마운자로(터제타파이드): SURMOUNT-1 (NEJM 2022), Zepbound FDA Prescribing Information (72주 평균 -22.5% 감량, 15mg 기준).",
    "위고비(세마글루타이드): STEP 1 (NEJM 2021), Wegovy FDA Prescribing Information (약 68주 평균 -14.9%~-16% 감량, 2.4mg 기준).",
    "본 시뮬레이션은 대규모 임상 데이터 평균치 기반이며 개인별 차이가 있을 수 있습니다.",
  ];

  const phaseBg = sectionBgByPhase(analysis.statusCard.stageName);

  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      <div className="max-w-md mx-auto px-6 pt-8 space-y-6 md:max-w-3xl">
        {/* 1) 최상단: 상태/주차 */}
        <div className={`p-8 rounded-[40px] border border-slate-100 shadow-sm ${phaseBg}`}>
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <div className="text-xs font-black text-slate-500 tracking-tight">{analysis.statusCard.stageName}</div>
              <div className="text-5xl font-black text-slate-900 mt-2">{analysis.statusCard.weekText}</div>
              <div className="text-sm text-slate-700 font-bold mt-3">{analysis.statusCard.comparison}</div>
            </div>

            <div className="text-right text-xs font-bold text-slate-700 space-y-1">
              <div>{drugLabel(userData.drugType)} / {formatDose(userData.drugType, userData.currentDose)}</div>
              <div>{userData.budget} 전략</div>
              <div className="text-slate-500">
                {startDate ? `시작일: ${startDate}` : "시작일: 미입력"}
              </div>
              <div className="text-slate-500">
                {userData.drugStatus === "사용 중"
                  ? `주차: ${userData.currentWeek}주차 (${weekMode === "auto" ? "자동" : "수동"})`
                  : "투약 상태: 사용 전"}
              </div>
            </div>
          </div>

          {/* 사용자 요약 */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/70 border border-white/60 rounded-2xl p-4">
              <div className="text-[11px] font-black text-slate-500">성함</div>
              <div className="text-sm font-black text-slate-900 mt-1 truncate">{userData.userName}</div>
            </div>
            <div className="bg-white/70 border border-white/60 rounded-2xl p-4">
              <div className="text-[11px] font-black text-slate-500">나이 / 성별</div>
              <div className="text-sm font-black text-slate-900 mt-1">{userData.userAge} / {userData.userGender}</div>
            </div>
            <div className="bg-white/70 border border-white/60 rounded-2xl p-4">
              <div className="text-[11px] font-black text-slate-500">현재 / 목표</div>
              <div className="text-sm font-black text-slate-900 mt-1">{userData.currentWeight} → {userData.targetWeight} kg</div>
            </div>
            <div className="bg-white/70 border border-white/60 rounded-2xl p-4">
              <div className="text-[11px] font-black text-slate-500">시작 체중</div>
              <div className="text-sm font-black text-slate-900 mt-1">{userData.startWeightBeforeDrug} kg</div>
            </div>
          </div>
        </div>

        {/* 2) GPS 요약(지금 있는 KPI를 유지하되 위계 정리) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {analysis.gps.map((kpi, idx) => (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100">
              <div className="text-xs font-black text-slate-500">{kpi.label}</div>
              <div className="text-base font-black text-slate-900 mt-2">{kpi.value}</div>
              <div
                className={`h-1 w-10 mt-4 rounded-full ${
                  kpi.status === "attention" ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
            </div>
          ))}
        </div>

        {/* 3) 한 줄 메시지 */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 text-slate-800 font-black text-lg leading-snug">
          “{analysis.currentStage.msg}”
        </div>

        {/* 4) 차트 */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
          <div className="px-5 pt-5 pb-2 text-sm font-black text-slate-900">체중 변화 예측</div>
          <RoadmapChart userData={userData} analysis={analysis} />
        </div>

        {/* 5) 콘텐츠(요청하신 표/텍스트 기반) */}
        <div className="space-y-4">
          <Collapsible title="GPS 로드맵이란?" defaultOpen>
            <div className="text-slate-700 font-bold">{coreConcept.desc}</div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {coreConcept.items.map((it) => (
                <div key={it.k} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="text-xs font-black text-slate-500">{it.k}</div>
                  <div className="text-sm font-black text-slate-900 mt-2">{it.v}</div>
                  <div className="text-xs text-slate-600 mt-2">{it.note}</div>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="예산별 전략과 ROI">
            <div className="grid grid-cols-1 gap-3">
              {budgetTable.map((r) => (
                <div key={r.tier} className="bg-white border border-slate-100 rounded-2xl p-5">
                  <div className="text-sm font-black text-slate-900">{r.tier}</div>
                  <div className="mt-2 text-xs text-slate-500">대사 방어 핵심 기전</div>
                  <div className="text-sm font-bold text-slate-700">{r.mech}</div>
                  <div className="mt-3 text-xs text-slate-500">핵심 인터벤션</div>
                  <div className="text-sm font-bold text-slate-700">{r.action}</div>
                  <div className="mt-3 text-xs text-slate-500">가치/경제적 논리</div>
                  <div className="text-sm font-bold text-slate-700">{r.value}</div>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="투약 상태별 가이드">
            <div className="grid grid-cols-1 gap-3">
              {statusTable.map((r) => (
                <div key={r.s} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <div className="text-sm font-black text-slate-900">{r.s}</div>
                  <div className="text-xs text-slate-600 mt-1">{r.def}</div>
                  <div className="mt-3 text-sm font-bold text-slate-700">{r.rec}</div>
                  <div className="mt-2 text-xs text-slate-500">{r.note}</div>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="약물 용량 단계 가이드">
            <div className="text-xs text-slate-500 mb-3">
              현재 선택 약물 기준으로 표를 보여줍니다.
            </div>
            <div className="space-y-2">
              {(userData.drugType === "MOUNJARO" ? doseGuide.MOUNJARO : doseGuide.WEGOVY).map((r) => (
                <div key={r.d} className="bg-white border border-slate-100 rounded-2xl p-5">
                  <div className="flex justify-between items-center gap-4">
                    <div className="text-sm font-black text-slate-900">{drugLabel(userData.drugType)} {r.d}mg</div>
                    <div className="text-xs font-bold text-slate-500">권장 유지: {r.w}</div>
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-700">{r.a}</div>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="주차별 가이드">
            <div className="space-y-2">
              {weekGuide.map((r) => (
                <div key={r.r} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <div className="flex justify-between items-center gap-4">
                    <div className="text-sm font-black text-slate-900">{r.r} / {r.n}</div>
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-700">{r.t}</div>
                  <div className="mt-2 text-sm text-slate-600">{r.a}</div>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="기본 수칙">
            <div className="space-y-2">
              {habitRules.map((r) => (
                <div key={r.s} className="bg-white border border-slate-100 rounded-2xl p-5">
                  <div className="text-xs font-black text-slate-500">{r.k}</div>
                  <div className="text-sm font-black text-slate-900 mt-1">{r.s}</div>
                  <div className="text-sm text-slate-700 mt-2">{r.d}</div>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="주의 구간 체크">
            <div className="space-y-2">
              {checkpoints.map((r) => (
                <div key={r.n} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <div className="text-sm font-black text-slate-900">{r.t} / {r.n}</div>
                  <div className="text-sm text-slate-700 mt-2">{r.d}</div>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title="근거 및 주의 문구">
            <div className="space-y-2">
              {evidence.map((t, i) => (
                <div key={i} className="text-sm text-slate-700">{t}</div>
              ))}
            </div>
            <div className="mt-4 text-sm text-slate-600">
              본 서비스는 의료 진단이 아닌 자기관리 가이드 도구입니다.
            </div>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black text-slate-300">ANALYZING...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
