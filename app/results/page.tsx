// /app/results/page.tsx (핵심 섹션 추출)
{performance && (
  <div className="bg-blue-600 text-white p-8 rounded-[40px] shadow-lg mb-8">
    <h3 className="text-xl font-black mb-2 flex items-center gap-2">📊 임상 데이터 대비 분석</h3>
    <div className="grid grid-cols-2 gap-4 mt-4 text-center">
      <div className="bg-white/10 p-4 rounded-2xl">
        <p className="text-xs opacity-70">나의 감량률</p>
        <p className="text-2xl font-black">{performance.userLossPercent}%</p>
      </div>
      <div className="bg-white/10 p-4 rounded-2xl">
        <p className="text-xs opacity-70">임상 평균 ({drugName})</p>
        <p className="text-2xl font-black">{performance.clinicalLossPercent}%</p>
      </div>
    </div>
    <p className="mt-6 text-center font-bold">
      {performance.weightDiff <= 0 
        ? `🎉 임상 평균보다 ${Math.abs(Number(performance.weightDiff))}kg 더 감량 중입니다!` 
        : `현재 임상 궤도를 안정적으로 추적 중입니다.`}
    </p>
  </div>
)}

{/* GPS 액션 가이드 (시트 Free_Roadmap_Content 연동) */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
    <h3 className="text-xl font-black mb-4 text-slate-900">🥩 영양 전략 (Protein)</h3>
    <ul className="space-y-3 text-sm text-slate-600">
      <li>• <strong>단백질 퍼스트:</strong> 매 끼니 단백질을 먼저 섭취하여 근손실 방어</li>
      <li>• <strong>수분 2L 법칙:</strong> 변비와 탈수 예방을 위한 필수 수칙</li>
    </ul>
  </div>
  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
    <h3 className="text-xl font-black mb-4 text-slate-900">🏋️ 운동 전략 (Strength)</h3>
    <ul className="space-y-3 text-sm text-slate-600">
      <li>• <strong>중력 저항 운동:</strong> 주 2~3회 근력 운동으로 대사 엔진 유지</li>
      <li>• <strong>가교기 승부처:</strong> 투약 종료 전후 근력 운동이 요요를 결정</li>
    </ul>
  </div>
</div>
