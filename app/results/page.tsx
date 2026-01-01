// /app/results/page.tsx
"use client";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedRoadmap } from '../../lib/roadmap-engine';
import RoadmapChart from '../../components/RoadmapChart';

function ResultsContent() {
  const searchParams = useSearchParams();
  const userData = {
    userName: searchParams.get('userName') || '사용자',
    currentWeight: Number(searchParams.get('currentWeight')) || 80,
    drugStatus: searchParams.get('drugStatus') || '사용 전',
    drugType: searchParams.get('drugType') as any || 'MOUNJARO',
    duration: searchParams.get('duration') || '0',
    budget: searchParams.get('budget') || '표준형',
    muscleMass: searchParams.get('muscleMass') || '표준',
  };

  const { advice, clinicalComparison, clinicalCurve, drugName } = generatePersonalizedRoadmap(userData as any);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="bg-white p-8 rounded-[40px] shadow-sm">
          <h1 className="text-2xl font-black mb-2">{userData.userName}님의 대사 가교 리포트 [cite: 10]</h1>
          <p className="text-blue-600 font-bold">{advice}</p>
        </header>

        {/* 임상 대비 분석 카드  */}
        {userData.drugStatus === '사용 중' && (
          <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg">
            <h3 className="font-bold mb-2">📊 임상 평균 대비 분석 </h3>
            <p className="text-sm opacity-90">
              {clinicalComparison?.status === "우수" 
                ? "현재 임상 시험 평균보다 더 빠른 속도로 감량 중입니다! 근육 사수에 더 집중하세요."
                : `현재 ${drugName} 임상 평균치(${clinicalComparison?.clinicalPercent}%)를 추적 중입니다. GPS 전략 보강이 필요합니다.`}
            </p>
          </div>
        )}

        {/* 시각화 차트 */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm">
          <h3 className="font-bold mb-6 text-gray-400 uppercase text-xs tracking-widest">Clinical Comparison Curve </h3>
          <RoadmapChart data={clinicalCurve} isCurrentPatient={userData.drugStatus === '사용 중'} currentWeek={Number(userData.duration)} />
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<div>분석 중...</div>}><ResultsContent /></Suspense>;
}
