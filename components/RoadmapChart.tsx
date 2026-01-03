// /components/RoadmapChart.tsx
"use client";
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

export default function RoadmapChart({ data, userData }: { data: any[], userData: any }) {
  // 사용자의 현재 체중 포인트 찾기
  const userCurrentPoint = data.find(d => d.week === userData.currentWeek) || null;

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="week" tick={{fontSize: 12}} axisLine={false} tickLine={false} unit="주" />
          <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
          <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }} />
          <Area type="monotone" dataKey="weight" fill="#EEF2FF" stroke="#C7D2FE" name="임상 평균 궤도" />
          <Line type="monotone" dataKey="weight" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5' }} name="예상 체중(kg)" />
          
          {/* ✅ 현재 사용자 위치 마킹 */}
          {userData.drugStatus === '사용 중' && userCurrentPoint && (
            <ReferenceDot 
              x={userData.currentWeek} 
              y={userData.currentWeight} 
              r={8} 
              fill="#EF4444" 
              stroke="white" 
              strokeWidth={3}
              label={{ position: 'top', value: '나의 현재', fill: '#EF4444', fontSize: 12, fontWeight: 'bold' }} 
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
