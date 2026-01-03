// /components/OnboardingForm.tsx
"use client";
import { useState } from 'react';

export default function OnboardingForm({ onComplete }: { onComplete: (data: any) => void }) {
  const [formData, setFormData] = useState({
    userName: '', userAge: 35, userGender: '여성', // 1, 2, 3
    currentWeight: 80, targetWeight: 65, // 4, 5
    startWeightBeforeDrug: 80, // 투약 중 비교 기준
    drugStatus: '사용 전', drugType: 'MOUNJARO', // 6, 7
    currentDose: 2.5, currentWeek: 0, // 8, 9 (상세 주차)
    muscleMass: '표준', exercise: '안 함', budget: '표준형', // 10, 11, 12
    mainConcern: '요요', resolution: '' // 13, 14
  });

  const labelClass = "text-xs font-bold text-slate-500 mb-2 block uppercase tracking-tighter";
  const inputClass = "w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onComplete(formData); }} className="max-w-2xl mx-auto space-y-8 bg-white p-12 rounded-[50px] shadow-xl border border-slate-100">
      {/* 1~3: 기본 프로필 */}
      <div className="grid grid-cols-2 gap-6">
        <div><label className={labelClass}>1. 성함</label><input type="text" required className={inputClass} onChange={e => setFormData({...formData, userName: e.target.value})} /></div>
        <div><label className={labelClass}>2. 나이</label><input type="number" className={inputClass} value={formData.userAge} onChange={e => setFormData({...formData, userAge: Number(e.target.value)})} /></div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div><label className={labelClass}>3. 성별</label>
          <select className={inputClass} value={formData.userGender} onChange={e => setFormData({...formData, userGender: e.target.value})}><option>여성</option><option>남성</option></select>
        </div>
        <div><label className={labelClass}>11. 주간 운동 횟수</label>
          <select className={inputClass} value={formData.exercise} onChange={e => setFormData({...formData, exercise: e.target.value})}><option>안 함</option><option>1-2회</option><option>3-4회</option><option>5회+</option></select>
        </div>
      </div>

      {/* 4~5: 체중 목표 */}
      <div className="grid grid-cols-2 gap-6">
        <div><label className={labelClass}>4. 현재 체중 (kg)</label><input type="number" className={inputClass} value={formData.currentWeight} onChange={e => setFormData({...formData, currentWeight: Number(e.target.value)})} /></div>
        <div><label className={labelClass}>5. 목표 체중 (kg)</label><input type="number" className={inputClass} value={formData.targetWeight} onChange={e => setFormData({...formData, targetWeight: Number(e.target.value)})} /></div>
      </div>

      {/* 6~9: 투약 상세 정보 */}
      <div className="p-8 bg-slate-50 rounded-[40px] space-y-6 border border-slate-100">
        <label className={labelClass}>6. 투약 상태</label>
        <div className="flex gap-2">
          {['사용 전', '사용 중'].map(s => (
            <button key={s} type="button" onClick={() => setFormData({...formData, drugStatus: s})} className={`flex-1 p-4 rounded-2xl font-black transition-all ${formData.drugStatus === s ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}>{s}</button>
          ))}
        </div>
        <div>
          <label className={labelClass}>7. 관심 약물</label>
          <select className={inputClass} value={formData.drugType} onChange={e => setFormData({...formData, drugType: e.target.value as any})}><option value="MOUNJARO">터제타파이드 (마운자로)</option><option value="WEGOVY">위고비</option></select>
        </div>

        {formData.drugStatus === '사용 중' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
            <div><label className={labelClass}>투약 전 시작 체중 (kg)</label><input type="number" className={inputClass} value={formData.startWeightBeforeDrug} onChange={e => setFormData({...formData, startWeightBeforeDrug: Number(e.target.value)})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={labelClass}>8. 현재 용량</label><input type="number" step="0.1" className={inputClass} onChange={e => setFormData({...formData, currentDose: Number(e.target.value)})} /></div>
              <div><label className={labelClass}>9. 현재 주차</label><input type="number" placeholder="예: 8" className={inputClass} onChange={e => setFormData({...formData, currentWeek: Number(e.target.value)})} /></div>
            </div>
          </div>
        )}
      </div>

      {/* 10, 12, 13: 대사 및 예산 */}
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelClass}>10. 골격근량</label>
          <select className={inputClass} value={formData.muscleMass} onChange={e => setFormData({...formData, muscleMass: e.target.value})}><option>모름</option><option>이하</option><option>표준</option><option>이상</option></select>
        </div>
        <div><label className={labelClass}>12. 관리 예산</label>
          <select className={inputClass} value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}><option>실속형</option><option>표준형</option><option>집중형</option></select>
        </div>
        <div><label className={labelClass}>13. 가장 큰 고민</label>
          <select className={inputClass} value={formData.mainConcern} onChange={e => setFormData({...formData, mainConcern: e.target.value})}><option>요요</option><option>근감소</option><option>비용</option><option>부작용</option></select>
        </div>
      </div>

      {/* 14: 각오 */}
      <div><label className={labelClass}>14. 다이어트 각오</label><textarea className={inputClass} placeholder="예: 이번에는 기필코 요요 없이 성공하겠습니다." onChange={e => setFormData({...formData, resolution: e.target.value})} /></div>

      <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black text-xl rounded-[25px] shadow-2xl hover:bg-blue-700 transition-all">무료 로드맵 생성</button>
    </form>
  );
}
