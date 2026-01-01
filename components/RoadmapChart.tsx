// /components/RoadmapChart.tsx
"use client";

import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';

interface RoadmapChartProps {
  data: any[];
  userData: any;
  drugConfig: any;
}

export default function RoadmapChart({ data, userData, drugConfig }: RoadmapChartProps) {
  // 임상 데이터 기반 차트 데이터 생성
  const chartData = drugConfig.clinicalData.map((c: any) => ({
    week: c.week,
    // 임상 평균 체중 변화 (kg) 계산
    clinical: (userData.weight * (1 + c.percent / 100)).toFixed(1),
    name: `${c.week}주`
  }));

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="week" 
            tick={{fontSize: 12, fill: '#9ca3af'}} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
          <Tooltip 
            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            labelFormatter={(label) => `D+${label}주`}
          />
          <Area 
            type="monotone" 
            dataKey="clinical" 
            fill="#F0F7FF" 
            stroke="#BFDBFE" 
            name="임상 평균 궤도"
          />
          <Line 
            type="monotone" 
            dataKey="clinical" 
            stroke="#2563EB" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
            name="예상 체중(kg)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
