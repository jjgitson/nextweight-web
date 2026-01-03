// /app/results/page.tsx
// ... (ResultsContent 내부)
  const { performance, roadmap, drugName } = generatePersonalizedRoadmap(userData);
  const drugConfig = DRUG_TYPES[userData.drugType];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center py-6">
          <h1 className="text-3xl font-black italic text-slate-900 tracking-tighter">Next Weight Lab</h1>
          <p className="text-slate-500 font-bold tracking-tight">비싼 다이어트가 요요로 끝나지 않도록.</p>
        </header>

        {/* 임상 성취도 대조 섹션 */}
        {performance && (
          <div className="bg-blue-600 text-white p-8 rounded-[40px] shadow-lg">
            <h3 className="text-xl font-black mb-2 flex items-center gap-2">📊 임상 데이터 분석 (Benchmarking)</h3>
            <p className="text-lg opacity-90 leading-relaxed font-medium">
              {userData.userName}님은 현재 <strong>{performance.userLoss}%</strong> 감량 중입니다.<br/>
              {drugName} 임상 평균({performance.clinicalAvg}%) 대비 <strong>{performance.status}</strong> 상태입니다.
            </p>
          </div>
        )}

        {/* 메인 로드맵 차트 (빌드 에러 해결 포인트) */}
        <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black mb-8 italic">Metabolic Bridge Simulation</h2>
          <RoadmapChart data={roadmap} userData={userData} drugConfig={drugConfig} />
        </div>

        {/* ROI 및 경제적 논리 섹션 */}
        <div className="bg-slate-900 text-white p-10 rounded-[50px]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">💰 {userData.budget} ROI 분석</h3>
          <p className="text-yellow-400 font-bold text-lg leading-snug">
            {userData.budget === '표준형' 
              ? "월 5~10만 원 투자가 근육 1kg 사수 → 재투약 비용 200만 원 절감" 
              : "추가 지출 0원으로 기초대사량 하한선 사수, 약값 매몰 방지"}
          </p>
        </div>
      </div>
    </div>
  );
// ...
