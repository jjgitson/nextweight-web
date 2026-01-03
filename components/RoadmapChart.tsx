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

  // SSR과 Recharts 충돌 방지: 클라이언트 마운트 후 렌더링
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full h-[260px] md:h-[360px] bg-slate-50 animate-pulse rounded-3xl" />;
  }

  // 임상 곡선 데이터 상시 생성
  const chartData = Array.from({ length: 73 }, (_, week) => {
    const getVal = (drugKey: 'WEGOVY' | 'MOUNJARO', w: number) => {
      const drug = CLINICAL_DATA[drugKey];
      const idx = drug.weeks.findIndex(dw => dw >= w);
      // 안전한 값 추출 (NaN 방지)
      const values = drugKey === 'MOUNJARO' 
        ? (drug as any).dose["15mg"] 
        : (drug as any).values;
      const val = values[idx === -1 ? values.length - 1 : idx];
      return isNaN(val) ? 0 : val;
    };
    return { 
      week, 
      mounjaro: getVal('MOUNJARO', week), 
      wegovy: getVal('WEGOVY', week) 
    };
  });

  return (
    // 명시적인 높이 지정 (중요)
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

          {/* 임상 곡선 */}
          <Line type="monotone" dataKey="mounjaro" stroke="#94a3b8" strokeDasharray="4 4" dot={false} strokeWidth={1} isAnimationActive={false} />
          <Line type="monotone" dataKey="wegovy" stroke="#cbd5e1" strokeDasharray="4 4" dot={false} strokeWidth={1} isAnimationActive={false} />
          
          {/* 사용자 마커 */}
          {userData.drugStatus === '사용 중' && analysis && (
            <ReferenceDot 
              x={userData.currentWeek} 
              y={analysis.userLossPct || 0} 
              r={7} 
              fill="#2563EB" 
              stroke="white" 
              strokeWidth={3}
              label={{ position: 'top', value: '나의 현재', fill: '#1e40af', fontSize: 11, fontWeight: "900" }} 
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
