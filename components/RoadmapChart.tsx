// /components/RoadmapChart.tsx
"use client";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceArea } from 'recharts';
import { STAGES, CLINICAL_DATA } from '../lib/drug-config';

export default function RoadmapChart({ userData, analysis }: { userData: any, analysis: any }) {
  const chartData = Array.from({ length: 73 }, (_, week) => {
    const getVal = (drug: any, w: number, dose?: string) => {
      const idx = drug.weeks.findIndex((dw: number) => dw >= w);
      const vals = dose ? drug.dose[dose] || drug.dose["15mg"] : drug.values;
      return vals[idx === -1 ? vals.length - 1 : idx] || 0;
    };
    return { week, mounjaro: getVal(CLINICAL_DATA.MOUNJARO, week, "15mg"), wegovy: getVal(CLINICAL_DATA.WEGOVY, week) };
  });

  return (
    <div className="w-full h-[240px] md:h-[320px] bg-white relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="week" type="number" domain={[0, 72]} hide />
          <YAxis domain={[0, -25]} hide />
          <Tooltip formatter={(val: any) => [`${Number(val).toFixed(1)}%`, '']} />
          {STAGES.map(s => <ReferenceArea key={s.phase} x1={s.start} x2={s.end} fill={s.color} fillOpacity={0.03} />)}
          <Line type="monotone" dataKey="mounjaro" stroke="#cbd5e1" strokeDasharray="4 4" dot={false} strokeWidth={1} isAnimationActive={false} />
          <Line type="monotone" dataKey="wegovy" stroke="#e2e8f0" strokeDasharray="4 4" dot={false} strokeWidth={1} isAnimationActive={false} />
          {userData.drugStatus === '사용 중' && (
            <ReferenceDot x={userData.currentWeek} y={analysis.userLossPct} r={7} fill="#2563EB" stroke="white" strokeWidth={3}
              label={{ position: 'top', value: '나의 현재', fill: '#1e40af', fontSize: 11, fontWeight: "900" }} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
