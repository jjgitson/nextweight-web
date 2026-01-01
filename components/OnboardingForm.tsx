// /components/OnboardingForm.tsx
"use client";

import { useState } from 'react';
import { DRUG_TYPES } from '../lib/drug-config';

export default function OnboardingForm({ onComplete }: { onComplete: (data: any) => void }) {
  const [formData, setFormData] = useState({
    userName: '',
    userAge: 35,
    userGender: '여성',
    currentWeight: 80,
    targetWeight: 65,
    drugStatus: '사용 전',
    drugType: 'MOUNJARO' as keyof typeof DRUG_TYPES,
    currentDose: 0,
    duration: '사용 전',
    muscleMass: '표준',
    exercise: '1-2회',
    budget: '표준형',
    mainConcern: '요요',
    resolution: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const inputClass = "w-full p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const labelClass = "text-sm font-bold text-gray-700 mb-2 block";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 bg-white p-10 rounded-[40px] shadow-xl border border-gray-100">
      <div className="space-y-6">
        <h2 className="text-xl font-black text-gray-900 border-b pb-4">기본 정보</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>성함</label>
            <input type="text" required className={inputClass} placeholder="홍길동" 
              onChange={e => setFormData({...formData, userName: e.target.value})} />
          </div>
          <div>
            <label className={labelClass}>나이</label>
            <input type="number" className={inputClass} value={formData.userAge}
              onChange={e => setFormData({...formData, userAge: parseInt(e.target.value)})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>현재 체중 (kg)</label>
            <input type="number" className={inputClass} value={formData.currentWeight}
              onChange={e => setFormData({...formData, currentWeight: parseFloat(e.target.value)})} />
          </div>
          <div>
            <label className={labelClass}>목표 체중 (kg)</label>
            <input type="number" className={inputClass} value={formData.targetWeight}
              onChange={e => setFormData({...formData, targetWeight: parseFloat(e.target.value)})} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-black text-gray-900 border-b pb-4">약물 및 관리 정보</h2>
        
        <div>
          <label className={labelClass}>관심/사용 약물</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(DRUG_TYPES).map(([key, value]) => (
              <button key={key} type="button" 
                onClick={() => setFormData({ ...formData, drugType: key as any })}
                className={`p-4 rounded-2xl font-bold transition-all ${formData.drugType === key ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>
                {value.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>관리 예산 등급</label>
          <div className="grid grid-cols-3 gap-2">
            {['실속형', '표준형', '집중형'].map(b => (
              <button key={b} type="button" 
                onClick={() => setFormData({ ...formData, budget: b })}
                className={`p-3 rounded-xl text-sm font-bold transition-all ${formData.budget === b ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {b}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>골격근량 상태</label>
          <div className="grid grid-cols-4 gap-2">
            {['모름', '이하', '표준', '이상'].map(m => (
              <button key={m} type="button" 
                onClick={() => setFormData({ ...formData, muscleMass: m })}
                className={`p-3 rounded-xl text-xs font-bold transition-all ${formData.muscleMass === m ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black text-lg rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">
        무료 로드맵 생성하기
      </button>
    </form>
  );
}
