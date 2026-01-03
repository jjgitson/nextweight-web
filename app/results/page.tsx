// /app/results/page.tsx (핵심 추가/수정 부분)
"use client";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedRoadmap, UserData } from '../../lib/roadmap-engine';
import RoadmapChart from '../../components/RoadmapChart';
import { DRUG_TYPES } from '../../lib/drug-config';

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

  const { performance, roadmap, drugName } = generatePersonalizedRoadmap(userData);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center py-6">
          <h1 className="text-4xl font-black italic text-slate-900 tracking-tighter">Next Weight Lab</h1>
          <p className="text-slate-500 font-bold tracking-tight">비싼 다이어트가 요요로 끝나지 않도록.</p>
        </header>

        {/* 📊 임상 성취도 대조 (Performance Card) */}
        {performance && (
          <div className="bg-blue-600 text-white p-8 rounded-[40px] shadow-lg">
            <h3 className="text-xl font-black mb-2 flex items-center gap-2">📊 임상 대비 나의 성취도</h3>
            <p className="text-lg opacity-95">
              {userData.userName}님은 현재 <strong>{performance.userLoss}%</strong> 감량 중이며, 
              임상 평균({performance.clinicalAvg}%) 대비 <strong>{performance.status}</strong> 상태입니다. 
              {Number(performance.weightDiff) <= 0 ? `평균보다 ${Math.abs(Number(performance.weightDiff))}kg 더 감량하셨습니다!` : `현재 안정적인 궤도를 추적 중입니다.`}
            </p>
          </div>
        )}

        {/* 🌉 타임라인 정보 디자인 (4-Stage Roadmap) */}
        <section className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black mb-8 text-slate-900 italic">4-Stage Metabolic Bridge</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {roadmap.filter(r => [0, 12, 36, 72].includes(r.week)).map((step, i) => (
              <div key={i} className="relative p-6 rounded-3xl border border-slate-50 transition-all hover:bg-slate-50" style={{borderTop: `6px solid ${step.color}`}}>
                <div className="text-[24px] mb-2">{step.icon}</div>
                <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{color: step.color}}>{step.phase}</div>
                <div className="font-black text-slate-800 mb-2">{step.name}</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">{step.msg}</div>
                {userData.currentWeek >= step.week && userData.currentWeek < (roadmap.find(r => r.week > step.week)?.week || 99) && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded-full font-bold">현재 위치</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 📉 차트 섹션 */}
        <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black mb-8 italic">Weight Simulation</h2>
          <RoadmapChart data={roadmap} userData={userData} />
        </div>

        {/* 🥩 영양/운동 GPS 가이드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm">
            <h3 className="text-xl font-black mb-4">🥩 영양 전략 (Protein)</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">단백질 100g을 4회 분할 섭취하여 근손실을 방어하세요. {roadmap.find(r => r.week >= userData.currentWeek)?.msg}</p>
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-700 font-bold text-sm">하루 수분 2L & 단백질 퍼스트 식단</div>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-sm">
            <h3 className="text-xl font-black mb-4">🏋️ 운동 전략 (Strength)</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">근육은 스스로 에너지를 태우는 엔진입니다. 주 2-3회 저항성 운동이 가교 단계의 승부처입니다.</p>
            <div className="bg-purple-50 p-4 rounded-2xl text-purple-700 font-bold text-sm">중력 저항 운동(근력) 주 3회 필수</div>
          </div>
        </div>

        {/* 💰 ROI 분석 섹션 */}
        <div className="bg-slate-900 text-white p-10 rounded-[50px] shadow-2xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">💰 {userData.budget} 등급 ROI 분석</h3>
          <p className="text-yellow-400 font-bold text-lg leading-snug">
            {userData.budget === '표준형' 
              ? "월 5~10만 원 투자가 근육 1kg 사수 → 재투약 비용 200만 원 절감" 
              : "추가 지출 0원, 기초대사량 사수로 약값 매몰 방지"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<div className="p-20 text-center font-bold">대사 가교를 설계 중입니다...</div>}><ResultsContent /></Suspense>;
}
