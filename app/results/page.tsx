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
    drugType: searchParams.get('drugType') || 'MOUNJARO',
    duration: searchParams.get('duration') || '0',
    budget: searchParams.get('budget') || '표준형',
    muscleMass: searchParams.get('muscleMass') || '표준',
  };

  const { roiMessage, clinicalStatus, roadmap, drugName } = generatePersonalizedRoadmap(userData as any);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center py-6">
          <h1 className="text-3xl font-black text-slate-900 italic">Next Weight Lab</h1>
          <p className="text-slate-500 font-bold">비싼 다이어트가 요요로 끝나지 않도록. [cite: 10]</p>
        </header>

        {/* 임상 성취도 분석 카드 (마스터 시트 핵심 로직) */}
        {userData.drugStatus === '사용 중' && (
          <div className="bg-blue-600 text-white p-8 rounded-[40px] shadow-lg">
            <h3 className="text-xl font-black mb-2 flex items-center gap-2">📊 임상 평균 성취도 분석 </h3>
            <p className="text-lg opacity-90 leading-relaxed">
              {userData.userName}님은 현재 {drugName} 임상 평균치({clinicalStatus.percent}%)를 기준으로 
              <strong> {clinicalStatus.label}</strong> 상태입니다. [cite: 7]
            </p>
          </div>
        )}

        {/* ROI 분석 조언 (Message Library) */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border-l-8 border-blue-600">
          <h4 className="text-blue-600 font-black mb-1 uppercase tracking-widest text-xs">ROI Analysis </h4>
          <p className="text-xl font-bold text-slate-800">{roiMessage} [cite: 6]</p>
        </div>

        {/* 차트 및 GPS 로드맵 */}
        <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black mb-8 italic">Metabolic Bridge Simulation [cite: 4]</h2>
          <RoadmapChart data={roadmap} isCurrentPatient={userData.drugStatus === '사용 중'} />
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<div>로드맵 분석 중...</div>}><ResultsContent /></Suspense>;
}
