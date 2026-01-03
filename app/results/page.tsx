// /app/results/page.tsx
"use client";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedAnalysis } from '../../lib/roadmap-engine';
import RoadmapChart from '../../components/RoadmapChart';

function ResultsContent() {
  const searchParams = useSearchParams();
  const userData = {
    currentWeight: Number(searchParams.get('currentWeight')) || 80,
    startWeightBeforeDrug: Number(searchParams.get('startWeightBeforeDrug')) || 80,
    currentWeek: Number(searchParams.get('currentWeek')) || 0,
    drugType: (searchParams.get('drugType') as 'MOUNJARO' | 'WEGOVY') || 'WEGOVY',
    drugStatus: searchParams.get('drugStatus') || '사용 전'
  };

  const analysis = generatePersonalizedAnalysis(userData);

  return (
    <div className="max-w-md mx-auto px-6 pt-10 space-y-8 md:max-w-2xl font-sans">
      {/* 5. Chart Summary Card */}
      <section className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-blue-400 text-xs font-black uppercase tracking-tighter">현재 단계: {analysis.summary.stage}</span>
            <h2 className="text-4xl font-black">{analysis.summary.week}</h2>
          </div>
          <p className="text-right text-sm font-bold text-blue-100">{analysis.summary.comparison}</p>
        </div>
        <p className="text-lg font-bold italic">“{analysis.summary.action}”</p>
      </section>

      {/* 6. Path Simulation Chart */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-50">
        <RoadmapChart userData={userData} analysis={analysis} />
      </div>

      <footer className="text-center pt-10 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 leading-relaxed italic">
          본 차트는 임상 연구 평균값을 비교하는 자기관리용 시뮬레이션 도구입니다. 의료적 판단이나 처방을 제공하지 않습니다.
        </p>
      </footer>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<div className="p-20 text-center font-black text-slate-300 tracking-widest">ANALYZING BRIDGE...</div>}><ResultsContent /></Suspense>;
}
