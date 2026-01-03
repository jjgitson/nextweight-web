// /app/results/page.tsx
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedRoadmap, UserData } from '../../lib/roadmap-engine';
import RoadmapChart from '../../components/RoadmapChart';
import { DRUG_TYPES } from '../../lib/drug-config';

/** * 요구사항 반영: 4단계 정보 디자인 시각화 
 */
function ResultsContent() {
  const searchParams = useSearchParams();
  
  const userData: UserData = {
    userName: searchParams.get('userName') || '사용자',
    userAge: Number(searchParams.get('userAge')) || 35,
    userGender: searchParams.get('userGender') || '여성',
    currentWeight: Number(searchParams.get('currentWeight')) || 80,
    targetWeight: Number(searchParams.get('targetWeight')) || 70,
    drugStatus: searchParams.get('drugStatus') || '사용 전',
    drugType: (searchParams.get('drugType') as keyof typeof DRUG_TYPES) || 'MOUNJARO',
    currentDose: Number(searchParams.get('currentDose')) || 0,
    currentWeek: Number(searchParams.get('currentWeek')) || 0,
    startWeightBeforeDrug: Number(searchParams.get('startWeightBeforeDrug')) || 80,
    muscleMass: searchParams.get('muscleMass') || '표준',
    exercise: searchParams.get('exercise') || '안 함',
    budget: searchParams.get('budget') || '표준형',
    mainConcern: searchParams.get('mainConcern') || '요요',
    resolution: searchParams.get('resolution') || '',
  };

  const { performance, roadmap, drugName, analysis } = generatePersonalizedRoadmap(userData);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center py-6">
          <h1 className="text-4xl font-black italic text-slate-900 tracking-tighter">Next Weight Lab</h1>
          <p className="text-slate-500 font-bold tracking-tight">4-Stage Metabolic Bridge Tracking</p>
        </header>

        {/* 📊 성취도 분석 카드 (요구사항: 현재 위치 및 임상 비교 메시지) */}
        {performance && (
          <div className="bg-blue-600 text-white p-10 rounded-[40px] shadow-lg">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">📊 임상 데이터 분석</h3>
            <div className="space-y-2 text-lg">
              <p>현재 {userData.userName}님은 <span className="font-black underline decoration-2">{analysis.currentStage.name} ({analysis.currentStage.start}–{analysis.currentStage.end}주)</span>에 위치해 있습니다.</p>
              <p className="opacity-90">{analysis.comparisonMsg}</p>
            </div>
          </div>
        )}

        {/* 🌉 요구사항: 4-Stage Metabolic Bridge 정보 디자인 */}
        <section className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black mb-8 text-slate-900 italic underline decoration-blue-500">Timeline Strategy</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {roadmap.filter(r => [0, 8, 24, 52].includes(r.week)).map((step, i) => (
              <div key={i} className="relative p-6 rounded-3xl border border-slate-50 bg-slate-50/30" style={{borderTop: `6px solid ${step.color}`}}>
                <div className="text-2xl mb-2">{step.icon}</div>
                <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{color: step.color}}>{step.phase}</div>
                <div className="font-black text-slate-800 mb-2">{step.name}</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">{step.msg}</div>
                {userData.currentWeek >= step.start && userData.currentWeek < (step.end || 99) && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded-full font-bold">현재 위치</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 📈 요구사항: 개인화 체중 추적 차트 (X축 72주, Y축 %) */}
        <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black mb-8 italic">Metabolic Bridge Simulation</h2>
          <RoadmapChart data={roadmap} userData={userData} analysis={analysis} />
        </div>

        {/* 법적 고지 및 푸터 (요구사항: 비의료 안전 문구 고정) */}
        <footer className="mt-16 pt-10 border-t border-slate-200 text-center">
          <p className="text-slate-400 text-[10px] leading-relaxed max-w-lg mx-auto">
            본 차트는 임상 연구 평균값과 개인 기록을 비교해 보여주는 자기관리용 정보 도구입니다. 
            의료적 판단이나 처방을 제공하지 않습니다.
          </p>
        </footer>
      </div>
    </div>
  );
}

// ✅ Next.js 15 Page 타입 에러 해결: Promise 기반 Props 정의
export default function ResultsPage(props: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-slate-400">대사 로드맵을 설계 중입니다...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
