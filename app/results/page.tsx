// /app/results/page.tsx
"use client";

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic'; // 추가
import { generatePersonalizedAnalysis, UserData } from '../../lib/roadmap-engine';
import { STAGES } from '../../lib/drug-config';
import { ChevronDown } from 'lucide-react';

// ✅ 차트 컴포넌트를 클라이언트 사이드에서만 로드하도록 설정 (SSR 완전 배제)
const RoadmapChart = dynamic(() => import('../../components/RoadmapChart'), { 
  ssr: false,
  loading: () => <div className="w-full h-[260px] md:h-[360px] bg-slate-50 animate-pulse rounded-3xl" />
});

function ResultsContent() {
  const searchParams = useSearchParams();
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({});

  const userData: UserData = {
    userName: searchParams.get('userName') || '사용자',
    userAge: Number(searchParams.get('userAge')) || 35,
    userGender: searchParams.get('userGender') || '여성',
    currentWeight: Number(searchParams.get('currentWeight')) || 80,
    targetWeight: Number(searchParams.get('targetWeight')) || 70,
    startWeightBeforeDrug: Number(searchParams.get('startWeightBeforeDrug')) || 80,
    drugType: (searchParams.get('drugType') as 'MOUNJARO' | 'WEGOVY') || 'MOUNJARO',
    currentDose: Number(searchParams.get('currentDose')) || 0,
    currentWeek: Number(searchParams.get('currentWeek')) || 0,
    drugStatus: searchParams.get('drugStatus') || '사용 전',
    budget: searchParams.get('budget') || '표준형',
    muscleMass: searchParams.get('muscleMass') || '표준',
    exercise: searchParams.get('exercise') || '안 함',
    mainConcern: searchParams.get('mainConcern') || '요요',
    resolution: searchParams.get('resolution') || '',
  };

  const analysis = generatePersonalizedAnalysis(userData);

  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      <div className="max-w-md mx-auto px-6 pt-8 space-y-6 md:max-w-2xl">
        
        {/* Status Card */}
        <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-blue-400 font-black text-xs uppercase tracking-tighter">{analysis.statusCard.stageName}</span>
              <h2 className="text-4xl font-black">{analysis.statusCard.weekText}</h2>
            </div>
            <div className="text-right text-[11px] font-bold opacity-70">
              <p>{analysis.statusCard.drugInfo}</p>
              <p>{analysis.statusCard.budget} 전략</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm font-bold text-blue-100">{analysis.statusCard.comparison}</p>
          </div>
        </div>

        {/* GPS KPI Row */}
        <div className="grid grid-cols-3 gap-3">
          {analysis.gps.map((kpi, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
              <p className="text-[9px] font-black text-slate-400 mb-1">{kpi.label}</p>
              <p className="text-[10px] font-black text-slate-900 truncate">{kpi.value}</p>
              <div className={`h-1 w-4 mx-auto mt-2 rounded-full ${kpi.status === 'attention' ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'}`} />
            </div>
          ))}
        </div>

        {/* Action Sentence */}
        <p className="text-center text-slate-800 font-bold text-lg px-2 italic leading-snug">
          “{analysis.currentStage.msg}”
        </p>

        {/* 4-Stage Horizontal Bar */}
        <div className="flex items-center justify-between px-2 pt-2">
          {STAGES.map((s) => {
            const isCurrent = s.phase === analysis.currentStage.phase;
            const isPast = userData.currentWeek > s.end;
            return (
              <div key={s.phase} className="flex-1 flex flex-col items-center relative">
                <div className={`h-1 w-full mb-3 rounded-full transition-all ${isCurrent ? 'bg-blue-600' : isPast ? 'bg-slate-300' : 'bg-slate-100 opacity-50'}`} />
                <span className={`text-[11px] font-bold ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>{s.icon} {s.name}</span>
              </div>
            );
          })}
        </div>

        {/* ✅ 차트 컴포넌트 호출 (최소 높이 보장 영역) */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-50 shadow-sm min-h-[260px] md:min-h-[360px]">
          <RoadmapChart userData={userData} analysis={analysis} />
        </div>

        {/* 상세 설명 (차트 하단 이동) */}
        <div className="space-y-2 border-t border-slate-50 pt-6">
          {[
            { id: 'cta', title: '나의 체중 경로 관리하기', content: <button className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl">플랜 생성 및 알림 받기</button> },
            { id: 'desc', title: '단계별 상세 설명', content: analysis.currentStage.msg },
            { id: 'clinical', title: '임상 비교 데이터 근거', content: "본 분석은 NEJM(2021, 2022) 임상 데이터를 기준으로 산출됩니다." },
            { id: 'disclaimer', title: '비의료 자기관리 면책 문구', content: "본 서비스는 의료 진단이 아닌 자기관리 가이드 도구입니다." }
          ].map(sec => (
            <div key={sec.id} className="border-b border-slate-100 last:border-0">
              <button onClick={() => setOpenSections(prev => ({...prev, [sec.id]: !prev[sec.id]}))} className="w-full py-4 flex justify-between items-center text-slate-400 font-black text-xs uppercase tracking-widest">
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
  return (
    <Suspense fallback={<div className="p-20 text-center font-black text-slate-300 tracking-widest">ANALYZING BRIDGE...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
