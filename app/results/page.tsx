// /app/results/page.tsx (ResultsContent 내부 추가 코드)
// ... 상단 분석 카드 이후 ...

{/* 🌉 타임라인 정보 디자인 (Timeline Stages) */}
<section className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
  <h2 className="text-2xl font-black mb-8 text-slate-900 italic">4-Stage Metabolic Roadmap</h2>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
    {/* 단계별 카드 */}
    {roadmap.filter(r => [0, 12, 36, 72].includes(r.week)).map((step, i) => (
      <div key={i} className="relative p-6 rounded-3xl border border-slate-50 transition-all hover:bg-slate-50" style={{borderTop: `6px solid ${step.color}`}}>
        <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{color: step.color}}>{step.phase}</div>
        <div className="font-black text-slate-800 mb-2">{step.name}</div>
        <div className="text-[11px] text-slate-500 leading-relaxed">{step.msg}</div>
        {/* 현재 사용자 위치 표시 */}
        {userData.currentWeek >= step.week && userData.currentWeek < (roadmap[i+1]?.week || 99) && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded-full font-bold">현재 단계</div>
        )}
      </div>
    ))}
  </div>
</section>

{/* 📈 차트 섹션 */}
<div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
  <h2 className="text-2xl font-black mb-8 italic">Weight Simulation</h2>
  <RoadmapChart data={roadmap} userData={userData} />
</div>
// ... ROI 분석 및 가이드 섹션 ...
