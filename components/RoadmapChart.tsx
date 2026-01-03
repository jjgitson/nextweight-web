// /components/RoadmapChart.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceDot, ReferenceArea 
} from 'recharts';
import { STAGES, CLINICAL_DATA } from '../lib/drug-config';

export default function RoadmapChart({ userData, analysis }: { userData: any, analysis: any }) {
  const [mounted, setMounted] = useState(false);

  // 브라우저 마운트 전에는 아무것도 렌더링하지 않아 SSR 충돌 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !analysis) {
    return <div className="w-full h-[320px] bg-slate-50 animate-pulse rounded-3xl" />;
  }

  // 0~72주 고정 차트 데이터 구성
  const chartData = Array.from({ length: 73 }, (_, week) => {
    const getVal = (drugKey: 'WEGOVY' | 'MOUNJARO', w: number) => {
      const drug = CLINICAL_DATA[drugKey];
      const idx = drug.weeks.findIndex(dw => dw >= w);
      const values = drugKey === 'MOUNJARO' ? (drug as any).dose["15mg"] : (drug as any).values;
      const res = values[idx === -1 ? values.length - 1 : idx];
      return isNaN(res) ? 0 : res;
    };
    return {
      week,
      mounjaro: getVal('MOUNJARO', week),
      wegovy: getVal('WEGOVY', week)
    };
  });

  return (
    // ⚠️ 부모 컨테이너에 명시적인 최소 높이 부여 (차트 증발 방지)
    <div className="w-full h-[260px] md:h-[360px] bg-white relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 30, right: 70, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          {/* 가로세로축은 숨기되, 데이터 영역은 확보 */}
          <XAxis dataKey="week" type="number" domain={[0, 72]} hide />
          <YAxis domain={[0, -25]} hide />
          
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            formatter={(val: any) => [`${Number(val).toFixed(1)}%`, '']} 
          />
          
          {/* 4단계 배경 쉐이딩 */}
          {STAGES.map(s => (
            <ReferenceArea key={s.phase} x1={s.start} x2={s.end} fill={s.color} fillOpacity={0.03} />
          ))}

          {/* 임상 기준선 (가시성 위해 채도 상향) */}
          <Line type="monotone" dataKey="mounjaro" stroke="#94a3b8" strokeDasharray="4 4" dot={false} strokeWidth={1.5} isAnimationActive={false} />
          <Line type="monotone" dataKey="wegovy" stroke="#cbd5e1" strokeDasharray="4 4" dot={false} strokeWidth={1.5} isAnimationActive={false} />
          
          {/* 사용자 현재 위치 마커 */}
          {userData.drugStatus === '사용 중' && (
            <ReferenceDot 
              x={userData.currentWeek} 
              y={analysis.userLossPct || 0} 
              r={8} 
              fill="#2563EB" 
              stroke="white" 
              strokeWidth={3}
              label={{ position: 'top', value: '나의 현재', fill: '#1e40af', fontSize: 12, fontWeight: "900" }} 
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
