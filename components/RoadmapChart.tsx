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

  // 다른 필드가 있어도 무시
  [key: string]: any;
};

function clampNumber(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default React.memo(function RoadmapChart({ analysis }: { analysis: AnalysisLike }) {
  const chartData: ChartPoint[] = useMemo(() => {
    const weeks = Array.isArray(analysis?.weeks) ? analysis.weeks : [];
    const series =
      Array.isArray(analysis?.userLossPctSeries)
        ? analysis.userLossPctSeries
        : Array.isArray(analysis?.userLossPct)
          ? analysis.userLossPct
          : [];

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
            formatter={(v: any) => `${clampNumber(v, 0).toFixed(1)}%`}
            labelFormatter={(l: any) => `${l}주차`}
          />

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
