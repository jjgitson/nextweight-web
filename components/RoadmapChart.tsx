// /components/RoadmapChart.tsx
"use client";
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceDot, ReferenceArea, Label
} from 'recharts';
import { STAGES, CLINICAL_DATA } from '../lib/drug-config';

export default function RoadmapChart({ userData, analysis }: { userData: any, analysis: any }) {
  // 1. 임상 곡선 상시 렌더링 데이터 (0~72주 고정)
  const chartData = Array.from({ length: 73 }, (_, week) => {
    const getVal = (drug: any, w: number, dose?: string) => {
      const idx = drug.weeks.findIndex((dw: number) => dw >= w);
      const vals = dose ? drug.dose[dose] || drug.dose["15mg"] : drug.values;
      const res = vals[idx === -1 ? vals.length - 1 : idx];
      return isNaN(res) ? 0 : res;
    };

    return {
      week,
      mounjaro: getVal(CLINICAL_DATA.MOUNJARO, week, "15mg"),
      wegovy: getVal(CLINICAL_DATA.WEGOVY, week),
    };
  });

  // 2. 데이터 가드: 사용자 감량률 NaN 체크
  const safeUserPct = isNaN(analysis.userLossPct) ? 0 : analysis.userLossPct;

  return (
    /* 요구사항: Desktop min-height 320px, Mobile min-height 240px */
    <div className="w-full min-h-[240px] md:min-h-[320px] bg-white rounded-3xl relative">
      {!analysis && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 animate-pulse rounded-3xl">
          <p className="text-slate-400 font-bold text-sm">차트 데이터를 불러오는 중...</p>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="week" type="number" domain={[0, 72]} tick={{fontSize: 10}} />
          
          {/* 요구사항: Y-axis domain 고정 0% to -25% */}
          <YAxis tick={{fontSize: 10}} unit="%" domain={[0, -25]} allowDataOverflow={false} />
          
          <Tooltip 
            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            formatter={(value: any) => [`${Number(value).toFixed(1)}%`, '감량률']}
          />
          
          {/* 요구사항: 4-Stage 스테이지 레이어 오버레이 */}
          {STAGES.map(s => (
            <ReferenceArea key={s.id} x1={s.start} x2={s.end} fill={s.color} fillOpacity={0.04}>
              <Label value={`${s.icon} ${s.name}`} position="insideTop" fill={s.color} fontSize={9} fontWeight="bold" />
            </ReferenceArea>
          ))}

          {/* 임상 기준 곡선 (항상 렌더링) */}
          <Line type="monotone" dataKey="mounjaro" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="터제타파이드 평균" isAnimationActive={false} />
          <Line type="monotone" dataKey="wegovy" stroke="#cbd5e1" strokeDasharray="5 5" dot={false} name="위고비 평균" isAnimationActive={false} />
          
          {/* 요구사항: 사용자 데이터를 단일 포인트 마커로 렌더링 */}
          {userData.drugStatus === '사용 중' && (
            <ReferenceDot 
              x={userData.currentWeek} 
              y={safeUserPct} 
              r={8} fill="#2563EB" stroke="white" strokeWidth={3}
              label={{ position: 'top', value: '나의 현재', fill: '#2563EB', fontSize: 11, fontWeight: "900" }} 
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
