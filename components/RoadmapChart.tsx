// /components/RoadmapChart.tsx
"use client";
import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceDot 
} from 'recharts';

interface RoadmapChartProps {
  data: any[];
  userData: any;
}

export default function RoadmapChart({ data, userData }: RoadmapChartProps) {
  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="week" tick={{fontSize: 12}} axisLine={false} tickLine={false} unit="주" />
          <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
          <Tooltip 
            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            labelFormatter={(label) => `D+${label}주`}
          />
          <Area type="monotone" dataKey="weight" fill="#EEF2FF" stroke="#C7D2FE" name="임상 평균 궤도" />
          <Line type="monotone" dataKey="weight" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5' }} name="예상 체중(kg)" />
          
          {/* 현재 사용자의 위치(주차 및 체중) 마킹 */}
          {userData.drugStatus === '사용 중' && (
            <ReferenceDot 
              x={userData.currentWeek} 
              y={userData.currentWeight} 
              r={8} fill="#EF4444" stroke="white" strokeWidth={3}
              label={{ position: 'top', value: '나의 위치', fill: '#EF4444', fontSize: 12, fontWeight: 'bold' }} 
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
