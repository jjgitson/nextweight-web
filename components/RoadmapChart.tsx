// /components/RoadmapChart.tsx
"use client";
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceDot, ReferenceArea
} from 'recharts';
import { STAGES, CLINICAL_DATA } from '../lib/drug-config';

// ✅ 커스텀 라벨 컴포넌트: 타입 오류 해결 및 직접 라벨링 구현
const CustomizedLineLabel = (props: any) => {
  const { x, y, stroke, value, index, data, labelText } = props;
  // 마지막 데이터 포인트에만 라벨 표시 (X축 72주 근처)
  if (index !== data.length - 1) return null;
  return (
    <text x={x} y={y} dx={5} dy={5} fill={stroke} fontSize={10} fontWeight="bold" textAnchor="start">
      {labelText}
    </text>
  );
};

export default function RoadmapChart({ userData, analysis }: { userData: any, analysis: any }) {
  const chartData = Array.from({ length: 73 }, (_, week) => {
    const getVal = (drug: any, w: number, dose?: string) => {
      const idx = drug.weeks.findIndex((dw: number) => dw >= w);
      const vals = dose ? drug.dose[dose] || drug.dose["15mg"] : drug.values;
      return vals[idx === -1 ? vals.length - 1 : idx] || 0;
    };
    return {
      week,
      mounjaro: getVal(CLINICAL_DATA.MOUNJARO, week, "15mg"),
      wegovy: getVal(CLINICAL_DATA.WEGOVY, week),
    };
  });

  return (
    // ✅ 요구사항: Desktop min-height 320px, Mobile 240px
    <div className="w-full h-[240px] md:h-[320px] bg-white relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 70, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="week" type="number" domain={[0, 72]} hide />
          <YAxis domain={[0, -25]} hide />
          
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            formatter={(val: any) => [`${Number(val).toFixed(1)}%`, '']}
          />
          
          {/* ✅ 요구사항: 배경 쉐이딩 유지, 텍스트 라벨 제거 */}
          {STAGES.map(s => (
            <ReferenceArea key={s.phase} x1={s.start} x2={s.end} fill={s.color} fillOpacity={0.03} />
          ))}

          {/* ✅ 요구사항: 임상 곡선 직접 라벨링 (빌드 에러 해결) */}
          <Line 
            type="monotone" dataKey="mounjaro" stroke="#94a3b8" strokeDasharray="4 4" dot={false} strokeWidth={1}
            label={<CustomizedLineLabel labelText="터제타파이드" data={chartData} />}
          />
          <Line 
            type="monotone" dataKey="wegovy" stroke="#cbd5e1" strokeDasharray="4 4" dot={false} strokeWidth={1}
            label={<CustomizedLineLabel labelText="위고비" data={chartData} />}
          />
          
          {/* ✅ 요구사항: "나의 현재" 마커 포커스 */}
          {userData.drugStatus === '사용 중' && (
            <ReferenceDot 
              x={userData.currentWeek} 
              y={analysis.userLossPct} 
              r={7} fill="#2563EB" stroke="white" strokeWidth={3}
              label={{ position: 'top', value: '나의 현재', fill: '#1e40af', fontSize: 11, fontWeight: "800" }} 
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
