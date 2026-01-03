// /app/results/page.tsx
"use client";

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedAnalysis, UserData } from '../../lib/roadmap-engine';
import RoadmapChart from '../../components/RoadmapChart';
import { STAGES } from '../../lib/drug-config';
import { ChevronDown, ChevronUp } from 'lucide-react';

function ResultsContent() {
  const searchParams = useSearchParams();
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({});

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
  const toggleSection = (id: string) => setOpenSections(prev => ({...prev, [id]: !prev[id]}));

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto px-6 pt-10 space-y-8 md:max-w-2xl">
        
        {/* 1️⃣ Above-the-fold Recomposition */}
        <section className="space-y-6">
          {/* Status Card */}
          <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex flex-col items-center text-center">
            <span className="text-blue-600 font-black text-xs uppercase tracking-widest mb-1">{analysis.currentStage.name}</span>
            <h2 className="text-3xl font-black text-slate-900 mb-2">{userData.currentWeek}주차</h2>
            <p className="text-slate-500 text-sm font-medium">{analysis.comparisonMsg}</p>
          </div>

          {/* One Action Sentence (Reflective Tone) */}
          <p className="text-center text-slate-800 font-bold text-lg px-4 leading-snug">
            “{analysis.actionSentence}”
          </p>

          {/* Primary CTA */}
          <button className="w-full py-5 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
            나의 체중 경로 관리하기
          </button>
        </section>

        {/* 2️⃣ Stage Bar Compression */}
        <section className="overflow-x-auto pb-2 scrollbar-hide swipeable-container">
          <div className="flex items-center min-w-[400px] justify-between px-2">
            {STAGES.map((s, idx) => {
              const isCurrent = s.phase === analysis.currentStage.phase;
              const isPast = userData.currentWeek > s.end;
              const isFuture = userData.currentWeek < s.start;

              return (
                <div key={s.phase} className="flex-1 flex flex-col items-center relative group">
                  <div className={`h-1.5 w-full mb-3 rounded-full transition-all ${
                    isCurrent ? 'bg-blue-600' : isPast ? 'bg-slate-200' : 'bg-slate-100 opacity-50'
                  }`} />
                  <span className={`text-[11px] font-bold ${
                    isCurrent ? 'text-blue-600' : 'text-slate-400'
                  }`}>{s.name}</span>
                  
                  {/* Tooltip on current stage */}
                  {isCurrent && (
                    <div className="absolute top-10 z-10 w-48 bg-slate-900 text-white text-[10px] p-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-1">
                      <p className="leading-normal font-medium">{s.actionTooltip}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 3️⃣ Chart Area */}
        <section className="bg-white rounded-3xl overflow-hidden border border-slate-50">
          <RoadmapChart userData={userData} analysis={analysis} />
        </section>

        {/* 4️⃣ Collapsible Sections */}
        <section className="space-y-3 pt-4">
          {[
            { id: 'desc', title: '단계별 상세 설명', content: analysis.currentStage.msg },
            { id: 'clinical', title: '임상 비교 데이터 근거', content: "마운자로 SURMOUNT-1(NEJM 2022), 위고비 STEP 1(NEJM 2021) 데이터를 기준으로 개인의 체중 변화를 %p 단위로 산출합니다." },
            { id: 'disclaimer', title: '비의료 자기관리 면책 문구', content: "본 서비스는 의료 행위가 아닌 자기관리 정보 도구입니다. 약물 관련 결정은 반드시 의료진과 상의하세요." }
          ].map(sec => (
            <div key={sec.id} className="border-b border-slate-100">
              <button 
                onClick={() => toggleSection(sec.id)}
                className="w-full py-4 flex justify-between items-center text-slate-400 font-bold text-sm"
              >
                <span>{sec.title}</span>
                <span className="text-[11px] flex items-center gap-1">자세히 보기 {openSections[sec.id] ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</span>
              </button>
              {openSections[sec.id] && (
                <div className="pb-6 text-slate-600 text-sm leading-relaxed animate-in slide-in-from-top-1">
                  {sec.content}
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black text-slate-300">ANALYZING BRIDGE...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
