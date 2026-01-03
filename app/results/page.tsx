// /app/results/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronDown, ChevronUp } from "lucide-react";
import { generatePersonalizedAnalysis, type UserData } from "../../lib/roadmap-engine";

// 차트는 클라이언트에서만 로드
const RoadmapChart = dynamic(() => import("../../components/RoadmapChart"), {
  ssr: false,
  loading: () => <div style={styles.skeleton} />,
});

function safeNumber(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

type ExtraMeta = {
  startDate?: string;
};

function getUserDataFromSearchParams(sp: ReturnType<typeof useSearchParams>): { userData: UserData; meta: ExtraMeta } {
  const meta: ExtraMeta = {
    startDate: sp.get("startDate") || undefined,
  };

  const userData: UserData = {
    userName: sp.get("userName") || "사용자",
    userAge: safeNumber(sp.get("userAge"), 35),
    userGender: (sp.get("userGender") as any) || "여성",

    currentWeight: safeNumber(sp.get("currentWeight"), 80),
    targetWeight: safeNumber(sp.get("targetWeight"), 70),

    drugStatus: (sp.get("drugStatus") as any) || "사용 전",
    drugType: (sp.get("drugType") as any) || "MOUNJARO",

    startWeightBeforeDrug: safeNumber(sp.get("startWeightBeforeDrug"), safeNumber(sp.get("currentWeight"), 80)),

    currentDose: safeNumber(sp.get("currentDose"), 0),
    currentWeek: Math.max(1, safeNumber(sp.get("currentWeek"), 1)),

    muscleMass: (sp.get("muscleMass") as any) || "표준",
    exercise: (sp.get("exercise") as any) || "안 함",
    budget: (sp.get("budget") as any) || "표준형",
    mainConcern: (sp.get("mainConcern") as any) || "요요",
    resolution: sp.get("resolution") || "",
  };

  return { userData, meta };
}

function normalizeUserData(raw: any): { userData: UserData; meta: ExtraMeta } | null {
  if (!raw || typeof raw !== "object") return null;

  const meta: ExtraMeta = {
    startDate: raw.startDate ? String(raw.startDate) : undefined,
  };

  const userData: UserData = {
    userName: String(raw.userName ?? "사용자"),
    userAge: safeNumber(raw.userAge, 35),
    userGender: (raw.userGender as any) ?? "여성",

    currentWeight: safeNumber(raw.currentWeight, 80),
    targetWeight: safeNumber(raw.targetWeight, 70),

    drugStatus: (raw.drugStatus as any) ?? "사용 전",
    drugType: (raw.drugType as any) ?? "MOUNJARO",

    startWeightBeforeDrug: safeNumber(raw.startWeightBeforeDrug, safeNumber(raw.currentWeight, 80)),

    currentDose: safeNumber(raw.currentDose, 0),
    currentWeek: Math.max(1, safeNumber(raw.currentWeek, 1)),

    muscleMass: (raw.muscleMass as any) ?? "표준",
    exercise: (raw.exercise as any) ?? "안 함",
    budget: (raw.budget as any) ?? "표준형",
    mainConcern: (raw.mainConcern as any) ?? "요요",
    resolution: String(raw.resolution ?? ""),
  };

  return { userData, meta };
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={styles.loading}>ANALYZING...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [meta, setMeta] = useState<ExtraMeta>({});
  const [open, setOpen] = useState<Record<string, boolean>>({
    summary: true,
    details: false,
    evidence: false,
    disclaimer: false,
  });

  // 1) localStorage 우선
  // 2) 없으면 searchParams 사용
  useEffect(() => {
    try {
      const raw = localStorage.getItem("userData");
      if (raw) {
        const parsed = JSON.parse(raw);
        const normalized = normalizeUserData(parsed);
        if (normalized) {
          setUserData(normalized.userData);
          setMeta(normalized.meta);
          return;
        }
      }
    } catch {}

    // fallback: query string
    const fromQuery = getUserDataFromSearchParams(searchParams);
    setUserData(fromQuery.userData);
    setMeta(fromQuery.meta);
  }, [searchParams]);

  const analysis = useMemo(() => {
    if (!userData) return null;
    return generatePersonalizedAnalysis(userData);
  }, [userData]);

  if (!userData || !analysis) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.h2}>결과를 불러오는 중입니다</div>
            <div style={styles.muted}>잠시 후에도 계속 이 화면이면, 온보딩에서 다시 생성해 주세요.</div>
            <button style={styles.primaryBtn} onClick={() => router.push("/")}>
              온보딩으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const toggle = (key: string) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* 헤더 카드 */}
        <div style={styles.hero}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ minWidth: 260 }}>
              <div style={styles.badge}>{analysis.statusCard.stageName}</div>
              <div style={styles.h1}>{analysis.statusCard.weekText}</div>
              <div style={styles.sub}>{analysis.statusCard.comparison}</div>
            </div>

            <div style={{ textAlign: "right", minWidth: 200 }}>
              <div style={styles.kv}>{analysis.statusCard.drugInfo}</div>
              <div style={styles.kv}>{analysis.statusCard.budget} 전략</div>
            </div>
          </div>

          {/* GPS */}
          <div style={styles.gpsRow}>
            {analysis.gps.map((g) => (
              <div key={g.label} style={styles.gpsCard}>
                <div style={styles.gpsLabel}>{g.label}</div>
                <div style={styles.gpsValue}>{g.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 메시지 */}
        <div style={styles.quote}>“{analysis.currentStage.msg}”</div>

        {/* 차트 */}
        <div style={styles.chartCard}>
          <div style={styles.sectionTitle}>체중 변화 예측</div>
          <RoadmapChart userData={userData} analysis={analysis} />
        </div>

        {/* 접이식 섹션 */}
        <div style={styles.accordion}>
          <AccHeader title="요약" open={open.summary} onClick={() => toggle("summary")} />
          {open.summary && (
            <div style={styles.accBody}>
              <ul style={styles.ul}>
                <li>현재 투약 주차: {userData.currentWeek}주차</li>
                <li>현재 체중: {userData.currentWeight} kg</li>
                <li>목표 체중: {userData.targetWeight} kg</li>
                <li>투약 전 시작 체중: {userData.startWeightBeforeDrug} kg</li>
                {meta.startDate ? <li>투약 시작일: {meta.startDate}</li> : null}
              </ul>
            </div>
          )}

          <AccHeader title="단계별 상세 설명" open={open.details} onClick={() => toggle("details")} />
          {open.details && (
            <div style={styles.accBody}>
              <div style={styles.muted}>
                현재 단계( {analysis.currentStage.name} ) 기준으로 상세 설명을 연결할 수 있도록 구조만 정리해 두었습니다.
              </div>
            </div>
          )}

          <AccHeader title="임상 비교 데이터 근거" open={open.evidence} onClick={() => toggle("evidence")} />
          {open.evidence && (
            <div style={styles.accBody}>
              <div style={styles.muted}>
                근거 문구/표를 확정하면 이 섹션에 채우는 방식으로 구성했습니다.
              </div>
            </div>
          )}

          <AccHeader title="비의료 자기관리 면책 문구" open={open.disclaimer} onClick={() => toggle("disclaimer")} />
          {open.disclaimer && (
            <div style={styles.accBody}>
              <div style={styles.muted}>
                본 서비스는 의료 진단이 아닌 자기관리 가이드 도구입니다. 증상 악화 또는 이상 반응이 있으면 의료기관에 상담하세요.
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            style={styles.secondaryBtn}
            onClick={() => {
              localStorage.removeItem("userData");
              router.push("/");
            }}
          >
            다시 입력하기
          </button>
        </div>
      </div>
    </div>
  );
}

function AccHeader({ title, open, onClick }: { title: string; open: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={styles.accHeader}>
      <span>{title}</span>
      {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#ffffff", color: "#0f172a", paddingBottom: 80 },
  container: { maxWidth: 900, margin: "0 auto", padding: "24px 16px" },

  loading: { padding: 40, textAlign: "center", color: "#64748b" },

  hero: {
    borderRadius: 18,
    padding: 18,
    border: "1px solid rgba(15,23,42,0.10)",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    background: "#fff",
  },
  badge: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(37,99,235,0.10)",
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginBottom: 10,
  },
  h1: { fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em" },
  sub: { marginTop: 8, fontSize: 14, color: "#334155", fontWeight: 600 },

  kv: { fontSize: 12, color: "#334155", fontWeight: 700 },

  gpsRow: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
  },
  gpsCard: {
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: 14,
    padding: 12,
    background: "rgba(15,23,42,0.02)",
  },
  gpsLabel: { fontSize: 12, color: "#64748b", fontWeight: 700 },
  gpsValue: { marginTop: 6, fontSize: 14, color: "#0f172a", fontWeight: 800 },

  quote: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    background: "rgba(15,23,42,0.03)",
    border: "1px solid rgba(15,23,42,0.06)",
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.5,
  },

  chartCard: {
    marginTop: 14,
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid rgba(15,23,42,0.10)",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    background: "#fff",
    padding: 14,
  },
  sectionTitle: { fontSize: 14, fontWeight: 900, marginBottom: 10, color: "#0f172a" },
  skeleton: { width: "100%", height: 340, background: "rgba(15,23,42,0.03)", borderRadius: 18 },

  accordion: {
    marginTop: 16,
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.10)",
    overflow: "hidden",
    background: "#fff",
  },
  accHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 14px",
    background: "#fff",
    border: "none",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 900,
    color: "#0f172a",
  },
  accBody: { padding: 14, borderBottom: "1px solid rgba(15,23,42,0.06)" },

  ul: { margin: 0, paddingLeft: 18, lineHeight: 1.7, color: "#0f172a", fontSize: 14, fontWeight: 600 },
  muted: { color: "#64748b", fontSize: 13, lineHeight: 1.6, fontWeight: 600 },

  card: {
    border: "1px solid rgba(15,23,42,0.10)",
    borderRadius: 18,
    padding: 18,
    background: "#fff",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
  },
  h2: { fontSize: 18, fontWeight: 900, marginBottom: 8 },
  primaryBtn: {
    marginTop: 12,
    height: 44,
    padding: "0 16px",
    borderRadius: 12,
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 800,
  },
  secondaryBtn: {
    height: 44,
    padding: "0 16px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.18)",
    background: "#fff",
    color: "#0f172a",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 800,
  },
};
