// /components/RoadmapChart.tsx
'use client';

import React from 'react';
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
  analysis: {
    weeks?: number[];
    userLossPctSeries?: number[];
  };
};

export default function RoadmapChart({ analysis }: RoadmapChartProps) {
  const weeks = Array.isArray(analysis?.weeks) ? analysis.weeks : [];
  const series = Array.isArray(analysis?.userLossPctSeries) ? analysis.userLossPctSeries : [];

  if (weeks.length === 0 || series.length === 0 || weeks.length !== series.length) {
    return (
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div style={styles.title}>Weight change</div>
          <div style={styles.subTitle}>% change vs start</div>
        </div>
        <div style={styles.empty}>차트를 표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  const chartData = weeks.map((w, i) => ({ week: w, userLossPct: series[i] }));
  const last = chartData[chartData.length - 1];

  const minVal = Math.min(...series);
  const maxVal = Math.max(...series);
  const domainMin = Math.min(-25, Math.floor(minVal - 1));
  const domainMax = Math.max(0, Math.ceil(maxVal + 1));

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <div style={styles.title}>Weight change</div>
        <div style={styles.subTitle}>% change vs start</div>
      </div>

      <div style={styles.chartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
            <XAxis
              dataKey="week"
              tickMargin={8}
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              domain={[domainMin, domainMax]}
              tickMargin={8}
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value) => (value == null ? '' : `${Number(value).toFixed(1)}%`)}
              labelFormatter={(label) => `Week ${label}`}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.10)',
              }}
            />
            <Line
              type="monotone"
              dataKey="userLossPct"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            {last && (
              <ReferenceDot
                x={last.week}
                y={last.userLossPct}
                r={4}
                fill="#22c55e"
                stroke="none"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.footer}>
        <div style={styles.footerItem}>마지막 값: {Number(last.userLossPct).toFixed(1)}%</div>
        <div style={styles.footerItem}>주차: {last.week}</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: '100%',
    background: '#ffffff',
    border: '1px solid rgba(15, 23, 42, 0.08)',
    borderRadius: 24,
    padding: 16,
    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06)',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  subTitle: {
    fontSize: 12,
    color: '#64748b',
  },
  chartWrap: {
    width: '100%',
    height: 280,
    minHeight: 280,
  },
  footer: {
    marginTop: 12,
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  footerItem: {
    fontSize: 12,
    color: '#64748b',
  },
  empty: {
    height: 280,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    fontSize: 13,
    border: '1px dashed rgba(15, 23, 42, 0.10)',
    borderRadius: 16,
  },
};
