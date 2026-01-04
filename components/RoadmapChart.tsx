"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Label,
} from "recharts";

type Stage = {
  phase?: string;
  name?: string;
  icon?: string;
  start: number;
  end: number;
  color?: string;
  msg?: string;
};

type ChartPoint = {
  week: number;
  value: number;
};

type AnalysisLike = {
  // engine 쪽에서 쓰는 형태(추정 + 이전 에러 메시지 기반)
  weeks?: number[];
  userLossPctSeries?: number[];

  // 일부 버전에서 이런 이름으로 들어올 수 있음(안전망)
  userLossPct?: number[]; // 혹시 배열로 들어오면

  // stage 정보
  currentStage?: Stage;

  // phase 표시(신규)
  phases?: Array<{
    key?: string;
    label?: string;
    visualName?: string;
    start: number;
    end: number;
    color?: string;
    message?: string;
  }>;

  // 현재 주차 마커(신규)
  userWeek?: number;

  // 최신 엔진(roadmap-engine.ts) 형태
  chart?: {
    weeks?: number[];
    userSeries?: number[];
    clinicalSeries?: number[];
  };

  // 다른 필드가 있어도 무시
  [key: string]: any;
};

function clampNumber(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default React.memo(function RoadmapChart({ analysis }: { analysis: AnalysisLike }) {
  const chartData: ChartPoint[] = useMemo(() => {
    // 1) 최신 엔진: analysis.chart.weeks / analysis.chart.userSeries
    const weeksFromChart = Array.isArray(analysis?.chart?.weeks) ? analysis.chart!.weeks! : [];
    const seriesFromChart = Array.isArray(analysis?.chart?.userSeries) ? analysis.chart!.userSeries! : [];

    // 2) 구버전/호환: analysis.weeks / analysis.userLossPctSeries / analysis.userLossPct
    const weeksFromTop = Array.isArray(analysis?.weeks) ? analysis.weeks : [];
    const seriesFromTop =
      Array.isArray(analysis?.userLossPctSeries)
        ? analysis.userLossPctSeries
        : Array.isArray(analysis?.userLossPct)
          ? analysis.userLossPct
          : [];

    const weeks = weeksFromChart.length ? weeksFromChart : weeksFromTop;
    const series = seriesFromChart.length ? seriesFromChart : seriesFromTop;

    if (!weeks.length || !series.length) return [];

    const len = Math.min(weeks.length, series.length);
    const pts: ChartPoint[] = [];
    for (let i = 0; i < len; i++) {
      pts.push({
        week: clampNumber(weeks[i], 0),
        value: clampNumber(series[i], 0),
      });
    }
    return pts;
  }, [analysis]);

  const stage: Stage | null = useMemo(() => {
    if (!analysis?.currentStage) return null;
    const s = analysis.currentStage;
    // start/end가 없으면 stage 강조를 하지 않음
    if (typeof s.start !== "number" || typeof s.end !== "number") return null;
    return {
      start: s.start,
      end: s.end,
      color: s.color || "#94a3b8",
      name: s.name || "",
      msg: s.msg || "",
      phase: s.phase,
      icon: s.icon,
    };
  }, [analysis]);

  const phases = useMemo(() => {
    if (!Array.isArray(analysis?.phases)) return [];
    return analysis.phases
      .filter((p) => typeof p?.start === "number" && typeof p?.end === "number")
      .map((p) => ({
        start: p.start,
        end: p.end,
        label: p.label || "",
        visualName: p.visualName || "",
        color: p.color || "#94a3b8",
        message: p.message || "",
      }))
      .sort((a, b) => a.start - b.start);
  }, [analysis]);

  const userWeek = useMemo(() => {
    const w = (analysis as any)?.userWeek;
    return typeof w === "number" && Number.isFinite(w) ? w : null;
  }, [analysis]);

  const maxWeek = useMemo(() => {
    const last = chartData[chartData.length - 1];
    return last?.week ?? 0;
  }, [chartData]);

  const findPhase = (week: number) => {
    for (const p of phases) {
      if (week >= p.start && week <= p.end) return p;
    }
    return null;
  };

  if (!chartData.length) {
    return <div className="text-sm text-slate-500">차트 데이터를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis domain={[-25, 0]} tick={{ fontSize: 11 }} />

          <Tooltip
            content={({ active, label, payload }: any) => {
              if (!active || !payload?.length) return null;
              const week = clampNumber(label, 0);
              const v = clampNumber(payload?.[0]?.value, 0);
              const ph = findPhase(week);

              return (
                <div className="rounded-lg border bg-white px-3 py-2 shadow-sm">
                  <div className="text-xs text-slate-600">{week}주차</div>
                  <div className="mt-1 text-sm text-slate-900">예측 변화: {v.toFixed(1)}%</div>
                  {ph && (ph.label || ph.visualName) ? (
                    <div className="mt-2">
                      <div className="text-xs text-slate-600">
                        {ph.label}{ph.visualName ? ` · ${ph.visualName}` : ""}
                      </div>
                      {ph.message ? <div className="mt-1 text-xs text-slate-700">{ph.message}</div> : null}
                    </div>
                  ) : null}
                </div>
              );
            }}
          />

          {/* Phase bands */}
          {phases.map((p, idx) => {
            // 차트 범위를 크게 벗어나는 구간은 생략
            const x1 = Math.max(0, p.start);
            const x2 = Math.min(maxWeek, p.end);
            if (x2 <= x1) return null;
            return (
              <ReferenceArea
                key={`phase-${idx}`}
                x1={x1}
                x2={x2}
                fill={p.color}
                fillOpacity={0.06}
                ifOverflow="extendDomain"
                label={
                  p.label ? (
                    <Label value={p.label} position="insideBottom" offset={12} style={{ fontSize: 11 }} />
                  ) : undefined
                }
              />
            );
          })}

          {/* Current week marker */}
          {userWeek != null ? (
            <ReferenceLine
              x={userWeek}
              stroke="#0f172a"
              strokeDasharray="3 3"
              label={<Label value="현재" position="insideTop" offset={10} style={{ fontSize: 11 }} />}
            />
          ) : null}

          {stage && (
            <ReferenceArea
              x1={stage.start}
              x2={stage.end}
              fill={stage.color || "#94a3b8"}
              fillOpacity={0.12}
            />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke="#0f172a"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {stage && (stage.name || stage.msg) && (
        <div className="mt-3 text-sm text-center text-slate-700">
          {stage.name ? `${stage.name}` : ""}
          {stage.name && stage.msg ? " · " : ""}
          {stage.msg ? stage.msg : ""}
        </div>
      )}
    </div>
  );
});
