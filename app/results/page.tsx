// /app/results/page.tsx
"use client";
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedAnalysis, UserData } from '../../lib/roadmap-engine';
import RoadmapChart from '../../components/RoadmapChart';
import { STAGES } from '../../lib/drug-config';
import { ChevronDown } from 'lucide-react';

function ResultsContent() {
  const searchParams = useSearchParams();
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({});

  const userData: UserData = {
    userName: searchParams.get('userName') || '사용자',
    currentWeight: Number(searchParams.get('currentWeight')) || 80,
    startWeightBeforeDrug: Number(searchParams.get('startWeightBeforeDrug')) || 80,
    drugType: (searchParams.get('drugType') as 'MOUNJARO' | 'WEGOVY') || 'MOUNJARO',
    currentDose: Number(searchParams.get('currentDose')) || 0,
    currentWeek: Number(searchParams.get('currentWeek')) || 0,
    drugStatus: searchParams.get('drugStatus') || '사용 전',
    budget: searchParams.get('budget') || '표준형',
    muscleMass: searchParams.get('muscleMass') || '표준',
    exercise: searchParams.get('exercise') || '안 함',
    mainConcern: searchParams.get('mainConcern') || '요요',
  };

  const analysis = generatePersonalizedAnalysis(userData);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto px-6 pt-10 space-y-8 md:max-w-2xl">
        
        {/* 1️⃣ Current Status Card */}
        <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-blue-400 font-black text-xs uppercase tracking-tighter">{analysis.currentStage.name}</span>
                <h2 className="text-4xl font-black">{userData.currentWeek}주차</h2>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold opacity-60">관심/사용 약물 · 예산 등급</p>
                <p className="text-xs font-black">{userData.drugType === 'MOUNJARO' ? '터제타파이드' : '위고비'} {userData.currentDose}mg · {userData.budget}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm font-bold text-blue-100">{analysis.comparisonMsg}</p>
              <p className="text-[10px] opacity-50 mt-1">주요 고민: {userData.mainConcern} 방지</p>
            </div>
          </div>
        </div>

        {/* 2️⃣ GPS Indicators */}
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(analysis.gpsIndicators).map(([key, kpi]) => (
            <div key={key} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
              <p className="text-[9px] font-black text-slate-400 mb-1">{kpi.label}</p>
              <p className="text-[11px] font-black text-slate-900 truncate">{kpi.value}</p>
              <div className={`h-1 w-4 mx-auto mt-2 rounded-full ${kpi.state === 'attention' ? 'bg-orange-400' : 'bg-blue-500'}`} />
            </div>
          ))}
        </div>

        {/* 3️⃣ ROI Summary */}
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 text-center">
          <p className="text-xs font-bold text-blue-700">💡 {analysis.roiSummary}</p>
        </div>

        {/* 4️⃣ Horizontal Stage Bar */}
        <div className="flex items-center justify-between px-2 overflow-x-auto scrollbar-hide pt-4">
          {STAGES.map((s) => {
            const isCurrent = s.phase === analysis.currentStage.phase;
            const isPast = userData.currentWeek > s.end;
            return (
              <div key={s.phase} className="flex-1 flex flex-col items-center relative min-w-[80px]">
                <div className={`h-1 w-full mb-3 rounded-full ${isCurrent ? 'bg-blue-600' : isPast ? 'bg-slate-300' : 'bg-slate-100 opacity-50'}`} />
                <span className={`text-[10px] font-black ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>{s.name}</span>
                {isCurrent && (
                  <div className="absolute top-8 z-20 w-40 bg-slate-800 text-white text-[9px] p-2 rounded-lg shadow-xl text-center font-medium leading-tight">
                    {s.msg}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 5️⃣ Action Sentence */}
        <p className="text-center text-slate-800 font-bold text-lg px-2 italic">“{analysis.currentStage.msg}”</p>

        {/* Primary CTA */}
        <button className="w-full py-5 bg-blue-600 text-white font-black text-lg rounded-3xl shadow-xl shadow-blue-200">나의 체중 경로 관리하기</button>

        {/* 📈 Weight Chart */}
        <RoadmapChart userData={userData} analysis={analysis} />

        {/* 6️⃣ Collapsible Detail Sections */}
        <div className="space-y-2">
          {[
            { id: 'desc', title: '단계별 상세 설명', content: analysis.currentStage.msg },
            { id: 'clinical', title: '임상 비교 데이터 근거', content: "본 분석은 NEJM(2021, 2022)에 발표된 STEP-1 및 SURMOUNT-1 임상 데이터를 기반으로 합니다." },
            { id: 'disclaimer', title: '비의료 자기관리 면책 문구', content: "본 서비스는 의료 진단이나 처방이 아닌 자기관리용 정보 도구입니다. 모든 의학적 결정은 반드시 의료진과 상의하세요." }
          ].map(sec => (
            <div key={sec.id} className="border-b border-slate-100">
              <button onClick={() => setOpenSections(prev => ({...prev, [sec.id]: !prev[sec.id]}))} className="w-full py-5 flex justify-between items-center text-slate-400 font-black text-xs uppercase tracking-widest">
                <span>{sec.title}</span>
                <ChevronDown size={14} className={`transition-transform ${openSections[sec.id] ? 'rotate-180' : ''}`} />
              </button>
              {openSections[sec.id] && <div className="pb-6 text-slate-600 text-sm leading-relaxed animate-in fade-in">{sec.content}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<div className="p-20 text-center font-black text-slate-300">ANALYZING METABOLIC BRIDGE...</div>}><ResultsContent /></Suspense>;
}
