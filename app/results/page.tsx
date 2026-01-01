// /app/results/page.tsx
"use client";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePersonalizedRoadmap, UserData } from '../../lib/roadmap-engine';
import RoadmapChart from '../../components/RoadmapChart';
import { DRUG_TYPES } from '../../lib/drug-config';

function ResultsContent() {
  const searchParams = useSearchParams();
  
  // ✅ 14개 필드 모두 바인딩 (빌드 에러 완벽 해결)
  const userData: UserData = {
    userName: searchParams.get('userName') || '사용자',
    userAge: Number(searchParams.get('userAge')) || 35,
    userGender: searchParams.get('userGender') || '여성',
    currentWeight: Number(searchParams.get('currentWeight')) || 80,
    targetWeight: Number(searchParams.get('targetWeight')) || 70,
    startWeightBeforeDrug: Number(searchParams.get('startWeightBeforeDrug')) || undefined,
    drugStatus: searchParams.get('drugStatus') || '사용 전',
    drugType: (searchParams.get('drugType') as keyof typeof DRUG_TYPES) || 'MOUNJARO',
    currentDose: Number(searchParams.get('currentDose')) || 0,
    duration: searchParams.get('duration') || '0',
    muscleMass: searchParams.get('muscleMass') || '표준',
    exercise: searchParams.get('exercise') || '안 함',
    budget: searchParams.get('budget') || '표준형',
    mainConcern: searchParams.get('mainConcern') || '요요',
    resolution: searchParams.get('resolution') || '',
  };

  const { advice, clinicalStatus, roadmap, drugName } = generatePersonalizedRoadmap(userData);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900">Next Weight Lab</h1>
          <p className="text-slate-500 font-bold mt-2">비싼 다이어트가 요요로 끝나지 않도록. [cite: 40]</p>
        </header>

        {clinicalStatus && (
          <div className="bg-blue-600 text-white p-8 rounded-[40px] shadow-lg">
            <h3 className="font-black mb-2 flex items-center gap-2">📊 임상 평균 성취도 분석</h3>
            <p className="text-lg opacity-90">
              {userData.userName}님은 임상 평균({clinicalStatus.clinicalPercent}%) 대비 
              <strong> {clinicalStatus.label}</strong> 상태입니다.
            </p>
          </div>
        )}

        <div className="bg-white p-8 rounded-[40px] shadow-sm border-l-8 border-blue-600">
          <h4 className="text-blue-600 font-black mb-1 uppercase text-xs tracking-widest">Personalized Advice</h4>
          <p className="text-xl font-bold text-slate-800 leading-snug">{advice}</p>
        </div>

        <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black mb-8 italic">Metabolic Bridge Curve</h2>
          <RoadmapChart data={roadmap} />
        </div>

        <div className="bg-slate-900 text-white p-10 rounded-[50px]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">💰 ROI 분석 ({userData.budget}) [cite: 38]</h3>
          <p className="text-yellow-400 font-bold text-lg">
            {userData.budget === '표준형' ? "근육 1kg 사수 시 재투약 비용 200만 원 절감 [cite: 38]" : "추가 지출 0원으로 약값 매몰 방지 [cite: 38]"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense fallback={<div className="p-20 text-center font-bold">데이터 분석 중...</div>}><ResultsContent /></Suspense>;
}
