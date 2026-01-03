// /app/results/page.tsx
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedAnalysis, UserData, RoadmapStep } from '../../lib/roadmap-engine';
import RoadmapChart from '../../components/RoadmapChart';

function ResultsContent() {
  const searchParams = useSearchParams();
  
  const userData: UserData = {
    userName: searchParams.get('userName') || '사용자',
    userAge: Number(searchParams.get('userAge')) || 35,
    userGender: searchParams.get('userGender') || '여성',
    currentWeight: Number(searchParams.get('currentWeight')) || 80,
    targetWeight: Number(searchParams.get('targetWeight')) || 70,
    drugStatus: (searchParams.get('drugStatus') as '사용 중' | '사용 전') || '사용 전',
    drugType: (searchParams.get('drugType') as 'MOUNJARO' | 'WEGOVY') || 'MOUNJARO',
    currentDose: Number(searchParams.get('currentDose')) || 0,
    currentWeek: Number(searchParams.get('currentWeek')) || 0,
    startWeightBeforeDrug: Number(searchParams.get('startWeightBeforeDrug')) || 80,
    muscleMass: searchParams.get('muscleMass') || '표준',
    exercise: searchParams.get('exercise') || '안 함',
    budget: searchParams.get('budget') || '표준형',
    mainConcern: searchParams.get('mainConcern') || '요요',
    resolution: searchParams.get('resolution') || '',
  };

  const analysis = generatePersonalizedAnalysis(userData);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center py-6">
          <h1 className="text-4xl font-black italic text-slate-900 tracking-tighter uppercase">Next Weight Lab</h1>
          <p className="text-slate-500 font-bold mt-2">비싼 다이어트가 요요로 끝나지 않도록.</p>
        </header>

        {/* 성취도 분석 카드 */}
        <div className="bg-blue-600 text-white p-10 rounded-[40px] shadow-2xl">
          <p className="text-xl font-bold mb-2">현재 {userData.userName}님은 {analysis.currentStage.name} 구간에 있습니다.</p>
          <p className="text-lg opacity-90 leading-snug">{analysis.comparisonMsg}</p>
        </div>

        {/* 4-Stage 정보 디자인 타임라인 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {analysis.roadmap.map((step: RoadmapStep, i: number) => (
            <div key={i} className="relative p-6 rounded-3xl border border-slate-100 bg-white shadow-sm" style={{borderTop: `6px solid ${step.color}`}}>
              <div className="text-2xl mb-2">{step.icon}</div>
              <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{color: step.color}}>{step.name}</div>
              <div className="text-[11px] text-slate-500 leading-relaxed font-medium">{step.msg}</div>
              {userData.currentWeek >= step.start && userData.currentWeek < step.end && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-3 py-1 rounded-full font-black shadow-lg">CURRENT</div>
              )}
            </div>
          ))}
        </div>

        {/* 차트 컨테이너 (고정 높이 요구사항 반영) */}
        <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-50">
          <h2 className="text-2xl font-black mb-8 italic text-slate-900 underline decoration-blue-500 decoration-4 underline-offset-8">Weight Path Simulation (%)</h2>
          <div className="min-h-[240px] md:min-h-[320px]">
            <RoadmapChart userData={userData} analysis={analysis} />
          </div>
        </div>

        {/* 비의료 안전 문구 고정 */}
        <footer className="mt-20 pt-10 border-t border-slate-200 text-center">
          <p className="text-slate-400 text-[10px] leading-relaxed max-w-lg mx-auto font-medium">
            본 차트는 임상 연구 평균값과 개인 기록을 비교해 보여주는 자기관리용 정보 도구입니다. 
            의료적 판단이나 처방을 제공하지 않습니다.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="p-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 font-black text-slate-400">ANALYZING METABOLIC BRIDGE...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
