// /components/OnboardingForm.tsx
"use client";
import { useState } from 'react';

export default function OnboardingForm({ onComplete }: { onComplete: (data: any) => void }) {
  const [formData, setFormData] = useState({
    userName: '', userAge: 35, userGender: '여성', // 1, 2, 3
    currentWeight: 80, targetWeight: 65, // 4, 5
    drugStatus: '사용 전', drugType: 'MOUNJARO', // 6, 7
    currentDose: 0, duration: '사용 전', // 8, 9
    muscleMass: '표준', exercise: '1-2회', budget: '표준형', // 10, 11, 12
    mainConcern: '요요', resolution: '' // 13, 14
  });

  const inputClass = "w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all";
  const labelClass = "text-sm font-bold text-gray-700 mb-2 block";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onComplete(formData); }} className="max-w-2xl mx-auto space-y-8 bg-white p-10 rounded-[40px] shadow-xl border border-gray-100">
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 border-b pb-4">기본 및 신체 정보</h2>
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
        <h2 className="text-2xl font-black text-gray-900 border-b pb-4">약물 및 관리 경험</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>투약 상태</label>
            <select className={inputClass} onChange={e => setFormData({...formData, drugStatus: e.target.value})}>
              <option value="사용 전">사용 전</option><option value="사용 중">사용 중</option>
            </select>
          </div>
          <div><label className={labelClass}>관심/사용 약물</label>
            <select className={inputClass} onChange={e => setFormData({...formData, drugType: e.target.value})}>
              <option value="MOUNJARO">마운자로</option><option value="WEGOVY">위고비</option>
            </select>
          </div>
        </div>
        {formData.drugStatus === '사용 중' && (
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>현재 용량 (mg)</label><input type="number" className={inputClass} onChange={e => setFormData({...formData, currentDose: Number(e.target.value)})} /></div>
            <div><label className={labelClass}>투약 기간</label>
              <select className={inputClass} onChange={e => setFormData({...formData, duration: e.target.value})}>
                <option value="4">4주 미만</option><option value="12">3개월 미만</option><option value="24">3~6개월</option><option value="48">6개월+</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 border-b pb-4">대사 및 예산 전략</h2>
        <div className="grid grid-cols-3 gap-2">
          {['실속형', '표준형', '집중형'].map(b => (
            <button key={b} type="button" onClick={() => setFormData({...formData, budget: b})} className={`p-4 rounded-xl font-bold ${formData.budget === b ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-400'}`}>{b}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>골격근량</label>
            <select className={inputClass} onChange={e => setFormData({...formData, muscleMass: e.target.value})}>
              <option value="모름">모름</option><option value="이하">이하</option><option value="표준">표준</option><option value="이상">이상</option>
            </select>
          </div>
          <div><label className={labelClass}>가장 큰 고민</label>
            <select className={inputClass} onChange={e => setFormData({...formData, mainConcern: e.target.value})}>
              <option value="요요">요요</option><option value="근감소">근감소</option><option value="비용">비용</option><option value="부작용">부작용</option>
            </select>
          </div>
        </div>
      </div>

      <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black text-xl rounded-2xl shadow-xl hover:bg-blue-700 transition-all">로드맵 생성하기</button>
    </form>
  );
}
