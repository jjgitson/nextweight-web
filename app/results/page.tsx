import { generatePersonalizedAnalysis } from "@/lib/roadmap-engine";
import type { UserData } from "@/lib/roadmap-engine";
import RoadmapChart from "@/components/RoadmapChart";

function safeNumber(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const spObj = await searchParams;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(spObj)) {
    if (Array.isArray(v)) {
      if (v[0] != null) sp.set(k, v[0]);
    } else if (v != null) sp.set(k, v);
  }

  const userData: UserData = {
    userName: sp.get("userName") || undefined,
    userAge: safeNumber(sp.get("userAge"), 35),
    userGender: (sp.get("userGender") as any) || "여성",

    currentWeight: safeNumber(sp.get("currentWeight"), 80),
    targetWeight: safeNumber(sp.get("targetWeight"), 65),

    drugStatus: (sp.get("drugStatus") as any) || "PRE",
    drugType: (sp.get("drugType") as any) || "MOUNJARO",
    startWeightBeforeDrug: safeNumber(sp.get("startWeightBeforeDrug"), safeNumber(sp.get("currentWeight"), 80)),

    currentDose: sp.get("currentDose") || undefined,
    currentWeek: safeNumber(sp.get("currentWeek"), 1),

    startDate: sp.get("startDate") || undefined,

    muscleMass: (sp.get("muscleMass") as any) || "표준",
    exercise: (sp.get("exercise") as any) || "안 함",
    budget: (sp.get("budget") as any) || "표준형",

    mainConcern: (sp.get("mainConcern") as any) || "요요",
    resolution: sp.get("resolution") || undefined,
  };

  const analysis = generatePersonalizedAnalysis(userData);

  const coreConcept = [
    { k: "Core Concept", v: "GPS 로드맵: 길을 잃지 않는 다이어트", sub: "G(약물), P(단백질), S(근력운동)" },
    { k: "G (GLP-1)", v: "호르몬 모방을 통한 식욕 조절과 포만감 유지", sub: "마운자로/위고비의 역할" },
    { k: "P (Protein)", v: "하루 100g 단백질, 25-30g씩 4회 분할 섭취", sub: "근손실 방어의 핵심" },
    { k: "S (Strength)", v: "대사 기관으로서의 근육 지키기 (마이오카인 분비)", sub: "요요 방지의 실질적 동력" },
  ];

  const budgetTable = [
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

  const stageTable = [
    {
      status: "투약 전",
      def: "프리-브릿지 단계",
      rec: "(공통) 투약 시작 전 2주간 근육 저축(HMB+단백질)으로 감량 효율 극대화 준비",
      note: "투약 기간 단축 목적",
    },
    {
      status: "증량/유지기",
      def: "대사 적응 및 감량기",
      rec: "(표준+) 식욕 억제기일 때 의도적으로 단백질 섭취량을 늘려 근육 손실 방어",
      note: "체중 질(Quality) 개선",
    },
    {
      status: "테이퍼링기",
      def: "농도 하락 및 가교 형성",
      rec: "(공통) 약물 용량 감소분만큼 운동 강도를 높여 내인성 대사 활성 유도",
      note: "가장 중요한 전환점",
    },
    {
      status: "중단 후",
      def: "자생적 대사 안착기",
      rec: "(집중) 리바운드 허기를 이기기 위한 고섬유질 식단 및 고강도 근력 운동 유지",
      note: "요요 고비 극복",
    },
  ];

  const doseTable = [
    { drug: "마운자로", dose: "2.5", dur: "4주", action: "[적응기] 기초 수분 2L 및 가벼운 산책 시작" },
    { drug: "마운자로", dose: "5", dur: "4주", action: "[가속기] 본격 감량 시작, 단백질 섭취량 1.5배 상향" },
    { drug: "마운자로", dose: "7.5", dur: "4~8주", action: "[관리기] 근육 손실 주의보, HMB 3g 필수 권장" },
    { drug: "마운자로", dose: "10", dur: "유지", action: "[고효율] 고강도 저항성 운동 주 3회 병행" },
    { drug: "마운자로", dose: "12.5", dur: "유지", action: "[집중] 체성분 분석 주기 단축, 전문가 상담 권장" },
    { drug: "마운자로", dose: "15", dur: "유지", action: "[최종] 목표 도달 후 테이퍼링 계획 수립" },
    { drug: "위고비", dose: "0.25", dur: "4주", action: "[입문] 식단 일기 작성 및 저칼로리 식단 적응" },
    { drug: "위고비", dose: "0.5", dur: "4주", action: "[순항] 규칙적인 유산소 운동 병행" },
    { drug: "위고비", dose: "1", dur: "유지", action: "[안정] 중강도 근력 운동 추가, 근손실 방지" },
    { drug: "위고비", dose: "1.7", dur: "유지", action: "[강화] 영양 밀도 높은 식단 구성" },
    { drug: "위고비", dose: "2.4", dur: "유지", action: "[정점] 유지 관리 및 중단 시나리오 검토" },
  ];

  const weekBands = [
    { w: "1~2주", name: "초기 적응", exp: "체중 변화 적음, 가벼운 오심 가능", action: "낮은 용량 적응, 수분 섭취 집중" },
    { w: "3~6주", name: "식욕 변화", exp: "야식 갈망 감소, 1~2kg 감량 시작", action: "식사 패턴 개선, 단백질 섭취 의식" },
    { w: "6~12주", name: "의미 있는 변화", exp: "주당 0.5~1kg 감량, 치료 용량 도달", action: "GPS 전략 본격화, 근력운동 필수" },
    { w: "3~6개월", name: "정체기 & 조정", exp: "초기 체중 10% 감량, 체지방 감소 뚜렷", action: "HMB 3g 추가, 운동 강도 재조정" },
  ];

  const triggers = [
    {
      when: "예산: 실속형 & 약물: 터제타파이드",
      advice:
        "강력한 감량 효과만큼 근육도 빠르게 빠질 수 있습니다. 돈 안 드는 '계단 오르기'가 현재 당신의 비싼 약값을 지키는 유일한 방법입니다.",
      intent: "비용 효율 강조",
    },
    {
      when: "예산: 표준형 & 골격근: 이하",
      advice:
        "현재 골격근량이 위험 수준입니다. 월 5만 원의 HMB 투자가 향후 발생할 500만 원의 재투약 비용을 막는 가장 똑똑한 보험입니다.",
      intent: "경제적 이득 강조",
    },
    {
      when: "투약 전 & 목표 감량 > 10kg",
      advice:
        "장기 투약이 예상됩니다. 초기부터 예산을 '표준형'으로 설정하여 근육을 지켜야, 최종적으로 약물 사용 기간을 줄여 총비용을 아낄 수 있습니다.",
      intent: "전략적 선택 유도",
    },
  ];

  const rules = [
    { cat: "식단", rule: "단백질 퍼스트", desc: "매 끼니 단백질(계란, 닭가슴살, 생선 등)을 먼저 섭취하여 포만감을 유도하고 근육 소실을 방어합니다." },
    { cat: "식단", rule: "수분 2L의 법칙", desc: "약물 작용으로 인한 변비와 탈수를 막기 위해 하루 최소 2L의 미지근한 물을 마십니다." },
    { cat: "운동", rule: "중력 저항", desc: "주 2~3회는 반드시 자신의 체중이나 덤벨을 이용한 근력 운동을 병행해야 투약 종료 후 요요가 없습니다." },
  ];

  const pitfalls = [
    { when: "1~2주 차", name: "적응기 고비", desc: "울렁거림이나 무기력증이 올 수 있습니다. 소량씩 자주 먹는 전략이 필요합니다." },
    { when: "8~12주 차", name: "첫 번째 정체기", desc: "몸이 바뀐 체중에 적응하며 감량이 더뎌집니다. 이때 포기하지 않는 것이 '유료 관리'의 핵심 지점입니다." },
    { when: "투약 종료 전후", name: "리바운드 주의보", desc: "약물 농도가 떨어지며 억제됐던 허기가 몰려옵니다. 이때 HMB 등 대사 가교 전략이 승부처입니다." },
  ];

  const userMeta = [
    { k: "이름", v: userData.userName || "미입력" },
    { k: "나이", v: `${userData.userAge ?? "-"}세` },
    { k: "성별", v: userData.userGender || "-" },
    { k: "투약 상태", v: userData.drugStatus === "PRE" ? "투약 전" : "사용 중" },
    { k: "약물", v: userData.drugType === "MOUNJARO" ? "마운자로(터제타파이드)" : "위고비" },
    { k: "현재 용량", v: userData.currentDose || "-" },
    { k: "시작일", v: userData.startDate || "-" },
    { k: "현재 주차", v: `${userData.currentWeek}주차` },
    { k: "현재 체중", v: `${userData.currentWeight} kg` },
    { k: "목표 체중", v: `${userData.targetWeight} kg` },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <section className="rounded-2xl bg-white shadow-sm border p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  {analysis.stage.title}
                </div>
                <div className="mt-3 text-5xl font-bold tracking-tight text-slate-900">
                  {userData.currentWeek}주차
                </div>
                <div className="mt-2 text-slate-700">{analysis.percentileText}</div>
              </div>

              <div className="text-right text-slate-700">
                <div>{analysis.g}</div>
                <div className="text-sm text-slate-500">{userData.budget}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">G Drug</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{analysis.g}</div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">P Protein</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{analysis.p}</div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">S Strength</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{analysis.s}</div>
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-4 text-slate-900">
              “{analysis.headlineQuote}”
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white shadow-sm border p-6">
          <div className="text-xl font-semibold text-slate-900 mb-4">체중 변화 예측</div>
          <RoadmapChart analysis={analysis} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white shadow-sm border p-6 lg:col-span-1">
            <div className="text-xl font-semibold text-slate-900 mb-4">내 정보</div>
            <div className="space-y-2">
              {userMeta.map((x) => (
                <div key={x.k} className="flex items-center justify-between gap-3">
                  <div className="text-sm text-slate-500">{x.k}</div>
                  <div className="text-sm text-slate-900">{x.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border p-6 lg:col-span-2">
            <div className="text-xl font-semibold text-slate-900 mb-4">핵심 컨셉</div>
            <div className="space-y-3">
              {coreConcept.map((x) => (
                <div key={x.k} className="rounded-xl border bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">{x.k}</div>
                  <div className="mt-1 text-slate-900">{x.v}</div>
                  {x.sub ? <div className="mt-1 text-sm text-slate-600">{x.sub}</div> : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white shadow-sm border p-6">
          <div className="text-xl font-semibold text-slate-900 mb-4">예산 등급별 전략</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr className="border-b">
                  <th className="py-2 text-left">예산 등급</th>
                  <th className="py-2 text-left">대사 방어 핵심 기전</th>
                  <th className="py-2 text-left">핵심 인터벤션(Action)</th>
                  <th className="py-2 text-left">ROI 및 경제적 논리(Value)</th>
                </tr>
              </thead>
              <tbody>
                {budgetTable.map((r) => (
                  <tr key={r.tier} className="border-b last:border-b-0">
                    <td className="py-3 pr-4 whitespace-nowrap">{r.tier}</td>
                    <td className="py-3 pr-4">{r.mech}</td>
                    <td className="py-3 pr-4">{r.action}</td>
                    <td className="py-3">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl bg-white shadow-sm border p-6">
          <div className="text-xl font-semibold text-slate-900 mb-4">투약 상태별 가이드</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr className="border-b">
                  <th className="py-2 text-left">투약 상태</th>
                  <th className="py-2 text-left">상황 정의</th>
                  <th className="py-2 text-left">예산별 핵심 권고 사항</th>
                  <th className="py-2 text-left">비고</th>
                </tr>
              </thead>
              <tbody>
                {stageTable.map((r) => (
                  <tr key={r.status} className="border-b last:border-b-0">
                    <td className="py-3 pr-4 whitespace-nowrap">{r.status}</td>
                    <td className="py-3 pr-4">{r.def}</td>
                    <td className="py-3 pr-4">{r.rec}</td>
                    <td className="py-3">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl bg-white shadow-sm border p-6">
          <div className="text-xl font-semibold text-slate-900 mb-4">약물 용량별 가이드</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr className="border-b">
                  <th className="py-2 text-left">약물</th>
                  <th className="py-2 text-left">용량(mg)</th>
                  <th className="py-2 text-left">권장 유지 기간</th>
                  <th className="py-2 text-left">단계별 대사 가이드(Action Item)</th>
                </tr>
              </thead>
              <tbody>
                {doseTable.map((r, idx) => (
                  <tr key={`${r.drug}-${r.dose}-${idx}`} className="border-b last:border-b-0">
                    <td className="py-3 pr-4 whitespace-nowrap">{r.drug}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{r.dose}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{r.dur}</td>
                    <td className="py-3">{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl bg-white shadow-sm border p-6">
          <div className="text-xl font-semibold text-slate-900 mb-4">주차 구간별 기대 변화</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weekBands.map((x) => (
              <div key={x.w} className="rounded-xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">{x.w} · {x.name}</div>
                <div className="mt-1 text-slate-900">{x.exp}</div>
                <div className="mt-2 text-sm text-slate-700">Action: {x.action}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white shadow-sm border p-6">
          <div className="text-xl font-semibold text-slate-900 mb-4">트리거 메시지 예시</div>
          <div className="space-y-3">
            {triggers.map((t) => (
              <div key={t.when} className="rounded-xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">{t.when}</div>
                <div className="mt-1 text-slate-900">{t.advice}</div>
                <div className="mt-2 text-sm text-slate-600">의도: {t.intent}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white shadow-sm border p-6">
          <div className="text-xl font-semibold text-slate-900 mb-4">핵심 수칙</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {rules.map((r) => (
              <div key={r.rule} className="rounded-xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">{r.cat}</div>
                <div className="mt-1 text-slate-900">{r.rule}</div>
                <div className="mt-2 text-sm text-slate-700">{r.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white shadow-sm border p-6">
          <div className="text-xl font-semibold text-slate-900 mb-4">자주 오는 고비</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pitfalls.map((p) => (
              <div key={p.name} className="rounded-xl border bg-slate-50 p-4">
                <div className="text-sm text-slate-500">{p.when}</div>
                <div className="mt-1 text-slate-900">{p.name}</div>
                <div className="mt-2 text-sm text-slate-700">{p.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white shadow-sm border p-6 text-slate-700">
          GLP-1은 단기 프로그램이 아닌 장기 관리 도구입니다. 목표 체중 도달 후에도 GPS 로드맵은 대사 건강을 지키는 자산이 됩니다.
          <div className="mt-3 text-xs text-slate-500">
            본 시뮬레이션은 대규모 임상 데이터의 평균치를 기반으로 하며, 실제 감량 속도는 개인의 상태와 순응도에 따라 다를 수 있습니다.
          </div>
        </section>
      </div>
    </main>
  );
}
