// /components/RoadmapChart.tsx
"use client";
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceDot, ReferenceArea, Label
} from 'recharts';
import { STAGES } from '../lib/drug-config';

export default function RoadmapChart({ data, userData, analysis }: { data: any[], userData: any, analysis: any }) {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="week" type="number" domain={[0, 72]} tick={{fontSize: 10}} label={{ value: 'Weeks', position: 'insideBottom', offset: -10, fontSize: 10 }} />
          <YAxis tick={{fontSize: 10}} unit="%" domain={[-25, 5]} label={{ value: 'Weight Change (%)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <Tooltip 
            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            formatter={(value: any) => [`${value}%`, '감량률']}
          />
          
          {/* 🌊 요구사항: 4-Stage 스테이지 레이어 오버레이 */}
          {STAGES.map(s => (
            <ReferenceArea key={s.id} x1={s.start} x2={s.end} fill={s.color} fillOpacity={0.05}>
              <Label value={`${s.icon} ${s.name}`} position="insideTop" fill={s.color} fontSize={9} fontWeight="bold" />
            </ReferenceArea>
          ))}

          {/* 임상 기준선 (점선) */}
          <Line type="monotone" dataKey="weightPct" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="임상 평균" />
          
          {/* 나의 현재 위치 마킹 */}
          {userData.drugStatus === '사용 중' && (
            <ReferenceDot 
              x={userData.currentWeek} 
              y={Number(analysis.userLossPct)} 
              r={8} fill="#2563EB" stroke="white" strokeWidth={3}
              label={{ position: 'top', value: '나의 위치', fill: '#2563EB', fontSize: 12, fontWeight: 'bold' }} 
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
