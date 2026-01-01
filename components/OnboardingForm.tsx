// /components/OnboardingForm.tsx
"use client";
import { useState } from 'react';

export default function OnboardingForm({ onComplete }: { onComplete: (data: any) => void }) {
  const [formData, setFormData] = useState({
    userName: '', userAge: 35, userGender: '여성', // 1, 2, 3
    currentWeight: 80, targetWeight: 65, // 4, 5
    startWeightBeforeDrug: 80, // 임상 비교를 위해 추가
    drugStatus: '사용 전', drugType: 'MOUNJARO', // 6, 7
    currentDose: 2.5, duration: '사용 전', // 8, 9
    muscleMass: '표준', exercise: '안 함', budget: '표준형', // 10, 11, 12
    mainConcern: '요요', resolution: '' // 13, 14
  });

  const labelClass = "text-xs font-bold text-slate-500 mb-2 block uppercase tracking-tighter";
  const inputClass = "w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onComplete(formData); }} className="max-w-2xl mx-auto space-y-8 bg-white p-12 rounded-[50px] shadow-xl border border-slate-100">
      <div className="grid grid-cols-2 gap-6">
        <div><label className={labelClass}>1. 성함</label><input type="text" required className={inputClass} onChange={e => setFormData({...formData, userName: e.target.value})} /></div>
        <div><label className={labelClass}>2. 나이</label><input type="number" className={inputClass} value={formData.userAge} onChange={e => setFormData({...formData, userAge: Number(e.target.value)})} /></div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div><label className={labelClass}>4. 현재 체중 (kg)</label><input type="number" className={inputClass} value={formData.currentWeight} onChange={e => setFormData({...formData, currentWeight: Number(e.target.value)})} /></div>
        <div><label className={labelClass}>5. 목표 체중 (kg)</label><input type="number" className={inputClass} value={formData.targetWeight} onChange={e => setFormData({...formData, targetWeight: Number(e.target.value)})} /></div>
      </div>

      <div className="p-8 bg-slate-50 rounded-[40px] space-y-6">
        <div><label className={labelClass}>6. 투약 상태</label>
          <div className="flex gap-2">
            {['사용 전', '사용 중'].map(s => (
              <button key={s} type="button" onClick={() => setFormData({...formData, drugStatus: s})} className={`flex-1 p-4 rounded-2xl font-black ${formData.drugStatus === s ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}>{s}</button>
            ))}
          </div>
        </div>

        {formData.drugStatus === '사용 중' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
            <div><label className={labelClass}>[비교용] 투약 시작 전 체중 (kg)</label><input type="number" className={inputClass} value={formData.startWeightBeforeDrug} onChange={e => setFormData({...formData, startWeightBeforeDrug: Number(e.target.value)})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>8. 현재 용량</label><input type="number" className={inputClass} onChange={e => setFormData({...formData, currentDose: Number(e.target.value)})} /></div>
              <div><label className={labelClass}>9. 투약 기간</label>
                <select className={inputClass} onChange={e => setFormData({...formData, duration: e.target.value})}>
                  <option value="4">4주 미만</option><option value="12">3개월 미만</option><option value="24">3~6개월</option><option value="48">6개월+</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div><label className={labelClass}>12. 관리 예산</label>
          <select className={inputClass} value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}>
            {['실속형', '표준형', '집중형'].map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div><label className={labelClass}>10. 골격근량</label>
          <select className={inputClass} value={formData.muscleMass} onChange={e => setFormData({...formData, muscleMass: e.target.value})}>
            {['모름', '이하', '표준', '이상'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black text-xl rounded-[25px] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all">무료 로드맵 생성</button>
    </form>
  );
}
