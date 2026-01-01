// /components/OnboardingForm.tsx
"use client";

import { useState } from 'react';

export default function OnboardingForm({ onComplete }: { onComplete: (data: any) => void }) {
  const [formData, setFormData] = useState({
    userName: '', userAge: 35, userGender: '여성',
    currentWeight: 80, targetWeight: 65,
    drugStatus: '사용 전', drugType: 'MOUNJARO', currentDose: 0,
    duration: '사용 전', muscleMass: '표준', exercise: '1-2회',
    budget: '표준형', mainConcern: '요요', resolution: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const inputClass = "w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all";
  const labelClass = "text-sm font-bold text-gray-700 mb-2 block";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 bg-white p-10 rounded-[40px] shadow-xl border border-gray-100">
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 border-b pb-4">1. 기본 프로필</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>성함</label><input type="text" required className={inputClass} onChange={e => setFormData({...formData, userName: e.target.value})} /></div>
          <div><label className={labelClass}>나이</label><input type="number" className={inputClass} value={formData.userAge} onChange={e => setFormData({...formData, userAge: Number(e.target.value)})} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>현재 체중 (kg)</label><input type="number" className={inputClass} value={formData.currentWeight} onChange={e => setFormData({...formData, currentWeight: Number(e.target.value)})} /></div>
          <div><label className={labelClass}>목표 체중 (kg)</label><input type="number" className={inputClass} value={formData.targetWeight} onChange={e => setFormData({...formData, targetWeight: Number(e.target.value)})} /></div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 border-b pb-4">2. 약물 및 대사 정보</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>약물 선택</label>
            <select className={inputClass} onChange={e => setFormData({...formData, drugType: e.target.value})}>
              <option value="MOUNJARO">터제타파이드 (마운자로)</option>
              <option value="WEGOVY">세마글루타이드 (위고비)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>관리 예산</label>
            <select className={inputClass} onChange={e => setFormData({...formData, budget: e.target.value})}>
              <option value="실속형">실속형</option>
              <option value="표준형">표준형</option>
              <option value="집중형">집중형</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>골격근량</label>
            <select className={inputClass} onChange={e => setFormData({...formData, muscleMass: e.target.value})}>
              <option value="모름">모름</option>
              <option value="이하">이하</option>
              <option value="표준">표준</option>
              <option value="이상">이상</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>가장 큰 고민</label>
            <select className={inputClass} onChange={e => setFormData({...formData, mainConcern: e.target.value})}>
              <option value="요요">요요 방지</option>
              <option value="근감소">근력 감소</option>
              <option value="비용">비용 효율</option>
              <option value="부작용">부작용 관리</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className={labelClass}>이번 다이어트의 각오</label>
        <textarea className={inputClass} placeholder="예: 이번엔 꼭 요요 없이 성공하고 싶습니다!" onChange={e => setFormData({...formData, resolution: e.target.value})} />
      </div>

      <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black text-xl rounded-2xl hover:bg-blue-700 shadow-xl transition-all">
        무료 로드맵 생성하기
      </button>
    </form>
  );
}
