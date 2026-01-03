'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';

type RoadmapChartProps = {
  userData: any;
  analysis: any;
};

export default function RoadmapChart({ userData, analysis }: RoadmapChartProps) {
  if (!analysis) return null;

  // analysis.userLossPct가 배열(주차별)일 수도 있고, 단일 값일 수도 있음
  const lossArr: number[] = Array.isArray(analysis.userLossPct)
    ? analysis.userLossPct
    : typeof analysis.userLossPct === 'number'
      ? [analysis.userLossPct]
      : [];

  if (lossArr.length === 0) return null;

  // weeks가 없으면 1..N으로 생성
  const weeksArr: number[] = Array.isArray(analysis.weeks) && analysis.weeks.length === lossArr.length
    ? analysis.weeks
    : Array.from({ length: lossArr.length }, (_, i) => i + 1);

  const chartData = weeksArr.map((week, idx) => ({
    week,
    userLossPct: lossArr[idx],
  }));

  const lastPoint = chartData[chartData.length - 1];

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="week" />
          {/* 핵심: 도메인 오름차순으로 수정 */}
          <YAxis domain={[-25, 0]} hide />
          <Tooltip
            formatter={(value: number) => `${Number(value).toFixed(1)}%`}
            labelFormatter={(label: number) => `Week ${label}`}
          />
          <Line
            type="monotone"
            dataKey="userLossPct"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
          {lastPoint && (
            <ReferenceDot
              x={lastPoint.week}
              y={lastPoint.userLossPct}
              r={4}
              fill="#22c55e"
              stroke="none"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
