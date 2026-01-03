// /app/results/page.tsx
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
          <h1 className="text-3xl font-black italic text-slate-900">Next Weight Lab</h1>
          <p className="text-slate-500 font-bold">비싼 다이어트가 요요로 끝나지 않도록.</p>
        </header>

        {performance && (
          <div className="bg-blue-600 text-white p-8 rounded-[40px] shadow-lg animate-in zoom-in-95">
            <h3 className="text-xl font-black mb-2 flex items-center gap-2">📊 임상 데이터 대비 분석</h3>
            <p className="text-lg opacity-90 leading-relaxed">
              {userData.userName}님은 임상 평균({performance.clinicalAvg}%) 대비 
              <strong> {performance.status}</strong> 상태입니다. <br/>
              {Number(performance.weightDiff) <= 0 
                ? `평균보다 ${Math.abs(Number(performance.weightDiff))}kg 더 감량하셨습니다! 👏` 
                : `현재 궤도를 안정적으로 추적 중입니다.`}
            </p>
          </div>
        )}

        <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black mb-8 italic">Metabolic Bridge Simulation</h2>
          <RoadmapChart data={roadmap} userData={userData} drugConfig={DRUG_TYPES[userData.drugType]} />
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl text-xs text-slate-500">
            * 차트의 파란 곡선은 {drugName} 임상 평균 성취도 궤도이며, 빨간 점은 {userData.userName}님의 현재 위치입니다.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm">
            <h3 className="text-xl font-black mb-4">🥩 GPS: 영양 & 운동</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {roadmap.find(r => r.week >= userData.currentWeek)?.guidance}
            </p>
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-700 font-bold text-sm">
              단백질 100g, 수분 2L, 주 2~3회 근력 운동 필수
            </div>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-sm border-l-4 border-red-500">
            <h3 className="text-xl font-black mb-4">⚠️ Side Effect SOS</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {roadmap.find(r => r.week >= userData.currentWeek)?.sos}
            </p>
            <p className="text-[10px] text-slate-400 italic">출처: 비만 진료지침 2024 및 시트 데이터</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<div>로드맵 분석 중...</div>}><ResultsContent /></Suspense>;
}
