"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

type ChartPoint = {
  week: number;
  value: number;
};

type Stage = {
  phase: string;
  name: string;
  start: number;
  end: number;
  color: string;
  msg: string;
};

type AnalysisResult = {
  chartData: ChartPoint[];
  currentStage: Stage;
};

export default function RoadmapChart({ analysis }: { analysis: AnalysisResult }) {
  if (!analysis || !analysis.chartData || analysis.chartData.length === 0) {
    return <div className="text-sm text-slate-500">차트 데이터를 불러올 수 없습니다.</div>;
  }

  const { chartData, currentStage } = analysis;

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis domain={[-25, 0]} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => `${v}%`} labelFormatter={(l) => `${l}주차`} />

          {/* 현재 단계 강조 */}
          <ReferenceArea
            x1={currentStage.start}
            x2={currentStage.end}
            fill={currentStage.color}
            fillOpacity={0.1}
          />

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

      <div
        className="mt-3 text-sm text-center font-medium"
        style={{ color: currentStage.color }}
      >
        {currentStage.name} · {currentStage.msg}
      </div>
    </div>
  );
}
