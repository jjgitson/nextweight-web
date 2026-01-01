// /components/OnboardingForm.tsx
"use client";
import { useState } from 'react';
import { DRUG_TYPES } from '../lib/drug-config';

export default function OnboardingForm({ onComplete }: { onComplete: (data: any) => void }) {
  const [formData, setFormData] = useState({
    userName: '', userAge: 35, userGender: '여성', 
    currentWeight: 80, targetWeight: 65, 
    drugStatus: '사용 전', drugType: 'MOUNJARO' as keyof typeof DRUG_TYPES, 
    currentDose: 0, duration: '사용 전', 
    muscleMass: '표준', exercise: '1-2회', 
    budget: '표준형', mainConcern: '요요', resolution: '' 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const inputClass = "w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "text-xs font-bold text-gray-500 mb-1 block uppercase";

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6 bg-white p-8 rounded-[32px] shadow-lg border border-gray-100">
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelClass}>1. 성함 </label><input type="text" required className={inputClass} onChange={e => setFormData({...formData, userName: e.target.value})} /></div>
        <div><label className={labelClass}>2. 나이 </label><input type="number" className={inputClass} value={formData.userAge} onChange={e => setFormData({...formData, userAge: Number(e.target.value)})} /></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelClass}>4. 현재 체중 (kg) </label><input type="number" className={inputClass} value={formData.currentWeight} onChange={e => setFormData({...formData, currentWeight: Number(e.target.value)})} /></div>
        <div><label className={labelClass}>5. 목표 체중 (kg) </label><input type="number" className={inputClass} value={formData.targetWeight} onChange={e => setFormData({...formData, targetWeight: Number(e.target.value)})} /></div>
      </div>

      <div className="space-y-4">
        <label className={labelClass}>6~7. 투약 정보 </label>
        <div className="grid grid-cols-2 gap-2">
          {['사용 전', '사용 중'].map(s => (
            <button key={s} type="button" onClick={() => setFormData({...formData, drugStatus: s})} className={`p-3 rounded-xl font-bold ${formData.drugStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{s}</button>
          ))}
        </div>
        <select className={inputClass} value={formData.drugType} onChange={e => setFormData({...formData, drugType: e.target.value as any})}>
          {Object.entries(DRUG_TYPES).map(([k, v]) => <option key={k} value={k}>{v.name} </option>)}
        </select>
      </div>

      {formData.drugStatus === '사용 중' && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className={labelClass}>8. 현재 용량 ({DRUG_TYPES[formData.drugType].unit}) </label>
            <select className={inputClass} onChange={e => setFormData({...formData, currentDose: Number(e.target.value)})}>
              {DRUG_TYPES[formData.drugType].steps.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>9. 투약 기간 </label>
            <select className={inputClass} onChange={e => setFormData({...formData, duration: e.target.value})}>
              <option value="4">4주 (1개월) 미만</option>
              <option value="12">3개월 미만</option>
              <option value="24">3~6개월</option>
              <option value="48">6개월+</option>
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>12. 관리 예산 </label>
          <select className={inputClass} value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}>
            {['실속형', '표준형', '집중형'].map(b => <option key={b} value={b}>{b}</option>)} 
          </select>
        </div>
        <div>
          <label className={labelClass}>10. 골격근량 </label>
          <select className={inputClass} value={formData.muscleMass} onChange={e => setFormData({...formData, muscleMass: e.target.value})}>
            {['모름', '이하', '표준', '이상'].map(m => <option key={m} value={m}>{m}</option>)} 
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>14. 다이어트 각오 </label>
        <textarea className={inputClass} placeholder="자유롭게 입력해주세요" onChange={e => setFormData({...formData, resolution: e.target.value})} />
      </div>

      <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-blue-700 transition-all">로드맵 생성</button>
    </form>
  );
}
