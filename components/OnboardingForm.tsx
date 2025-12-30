"use client";
import { useState } from 'react';
import { DRUG_TYPES } from '../lib/drug-config';

export default function OnboardingForm({ onComplete }: { onComplete: (data: any) => void }) {
  const [formData, setFormData] = useState({
    drugType: 'TIRZEPATIDE',
    currentDose: 2.5,
    age: 40,
    gender: 'female',
    weight: 70
  });

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">현재 복용 중인 약물</label>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(DRUG_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFormData({...formData, drugType: key})}
                className={`p-4 rounded-2xl border-2 transition-all ${formData.drugType === key ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}
              >
                <div className="font-bold">{config.name}</div>
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={() => onComplete(formData)}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all"
        >
          나의 리포트 확인하기
        </button>
      </div>
    </div>
  );
}
