// /components/RoadmapChart.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceDot, ReferenceArea 
} from 'recharts';
import { STAGES, CLINICAL_DATA } from '../lib/drug-config';

export default function RoadmapChart({ userData, analysis }: { userData: any, analysis: any }) {
  const [isMounted, setIsMounted] = useState(false);

  // SSR 환경과의 충돌을 방지하기 위해 마운트 완료 후 차트 렌더링
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full h-[260px] md:h-[360px] bg-slate-50 animate-pulse rounded-3xl" />;
  }

  // Phase 1 Baseline: 임상 곡선 데이터 상시 생성
  const chartData = Array.from({ length: 73 }, (_, week) => ({
    week,
    wegovy: CLINICAL_DATA.WEGOVY.values[CLINICAL_DATA.WEGOVY.weeks.findIndex(w => w >= week)] || -16,
    mounjaro: CLINICAL_DATA.MOUNJARO.dose["15mg"][CLINICAL_DATA.MOUNJARO.weeks.findIndex(w => w >= week)] || -22.5
  }));

  return (
    // Phase 1: Chart container min-height (Desktop 360, Mobile 260)
    <div className="w-full h-[260px] md:h-[360px] bg-white relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="week" type="number" domain={[0, 72]} hide />
          <YAxis domain={[0, -25]} hide />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            formatter={(val: any) => [`${Number(val).toFixed(1)}%`, '감량률']} 
          />
          {STAGES.map(s => (
            <ReferenceArea key={s.phase} x1={s.start} x2={s.end} fill={s.color} fillOpacity={0.03} />
          ))}
          
          <Line type="monotone" dataKey="mounjaro" stroke="#94a3b8" strokeDasharray="4 4" dot={false} strokeWidth={1} isAnimationActive={false} />
          <Line type="monotone" dataKey="wegovy" stroke="#cbd5e1" strokeDasharray="4 4" dot={false} strokeWidth={1} isAnimationActive={false} />
          
          {userData.drugStatus === '사용 중' && analysis && (
            <ReferenceDot x={userData.currentWeek} y={analysis.userLossPct} r={7} fill="#2563EB" stroke="white" strokeWidth={3}
              label={{ position: 'top', value: '나의 현재', fill: '#1e40af', fontSize: 11, fontWeight: "900" }} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
