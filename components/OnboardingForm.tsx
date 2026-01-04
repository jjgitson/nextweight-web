// /components/OnboardingForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type DrugType = "MOUNJARO" | "WEGOVY";
type DrugStatus = "사용 전" | "사용 중";

type FormData = {
  userName: string;
  userAge: number;
  userGender: "여성" | "남성";
  exercise: "안 함" | "1-2회" | "3-4회" | "5회+";
  muscleMass: "모름" | "이하" | "표준" | "이상";
  budget: "실속형" | "표준형" | "집중형";

  currentWeight: number;
  targetWeight: number;

  drugStatus: DrugStatus;
  drugType: DrugType;
  startWeightBeforeDrug: number;

  currentDose: number; // 숫자 유지
  startDate?: string; // YYYY-MM-DD
  currentWeek: number;

  weekMode: "auto" | "manual"; // 자동/수동
  mainConcern: "요요" | "근감소" | "비용" | "부작용";
  resolution: string;
};

function safeNumber(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function weekFromStartDate(startDate?: string) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return 0;
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  // 시작일부터 1주차로 보는 방식
  const w = Math.floor(diffDays / 7) + 1;
  return Math.max(0, w);
}

function doseOptions(drugType: DrugType) {
  if (drugType === "MOUNJARO") {
    return [2.5, 5, 7.5, 10, 12.5, 15];
  }
  return [0.25, 0.5, 1, 1.7, 2.4];
}

function formatDoseMg(v: number) {
  // 1 -> "1 mg", 2.5 -> "2.5 mg"
  return `${Number.isInteger(v) ? v.toFixed(0) : v} mg`;
}

function budgetHelpText(budget: FormData["budget"]) {
  const base =
    "GLP-1은 비싼 다이어트입니다. 예산에 맞게 효율적인 전략이 필요합니다. 예산 범위는 개인마다 달라 3가지 범주로 구분했습니다.";
  if (budget === "실속형") return base + " 실속형은 추가 지출을 최소화하고, 생활 습관으로 대사 방어를 만드는 접근입니다.";
  if (budget === "표준형") return base + " 표준형은 핵심 보충(예: 단백질, HMB 등)으로 근손실을 방어하는 접근입니다.";
  return base + " 집중형은 운동/영양을 더 촘촘히 설계해 약물 의존도를 빨리 낮추는 접근입니다.";
}

export default function OnboardingForm({ onComplete }: { onComplete: (data: any) => void }) {
  const [formData, setFormData] = useState<FormData>({
    userName: "",
    userAge: 35,
    userGender: "여성",
    exercise: "안 함",
    muscleMass: "모름",
    budget: "표준형",

    currentWeight: 80,
    targetWeight: 65,

    drugStatus: "사용 전",
    drugType: "MOUNJARO",
    startWeightBeforeDrug: 80,

    currentDose: 0,
    startDate: "",
    currentWeek: 0,

    weekMode: "auto",
    mainConcern: "요요",
    resolution: "",
  });

  const labelClass = "text-xs font-bold text-slate-500 mb-2 block tracking-tight";
  const inputClass =
    "w-full p-4 bg-white rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all";
  const sectionCard =
    "bg-white p-8 rounded-[34px] border border-slate-100 shadow-sm space-y-6";
  const sectionTitle = "text-sm font-black text-slate-900 tracking-tight";

  // 약물 바뀌면 용량 선택지 리셋(현재 용량이 옵션에 없으면 첫 옵션으로)
  useEffect(() => {
    const opts = doseOptions(formData.drugType);
    if (formData.drugStatus !== "사용 중") {
      setFormData((p) => ({ ...p, currentDose: 0 }));
      return;
    }
    if (!opts.includes(formData.currentDose)) {
      setFormData((p) => ({ ...p, currentDose: opts[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.drugType, formData.drugStatus]);

  // startDate 기반 자동 주차 계산(weekMode=auto, drugStatus=사용 중일 때만)
  useEffect(() => {
    if (formData.drugStatus !== "사용 중") {
      setFormData((p) => ({ ...p, currentWeek: 0 }));
      return;
    }
    if (formData.weekMode !== "auto") return;

    const w = weekFromStartDate(formData.startDate);
    setFormData((p) => ({ ...p, currentWeek: w }));
  }, [formData.startDate, formData.weekMode, formData.drugStatus]);

  const doseOpts = useMemo(() => doseOptions(formData.drugType), [formData.drugType]);

  const submit = () => {
    const payload: any = { ...formData };

    // 사용 전이면 투약 관련 값 정리
    if (payload.drugStatus !== "사용 중") {
      payload.currentDose = 0;
      payload.currentWeek = 0;
      payload.startDate = "";
      payload.startWeightBeforeDrug = payload.currentWeight;
      payload.weekMode = "auto";
    }

    onComplete(payload);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* 기본 정보 */}
      <div className={`${sectionCard} bg-slate-50`}>
        <div className={sectionTitle}>기본 정보</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>성함</label>
            <input
              type="text"
              required
              className={inputClass}
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              placeholder="예: 홍길동"
            />
          </div>

          <div>
            <label className={labelClass}>나이</label>
            <input
              type="number"
              className={inputClass}
              value={formData.userAge}
              onChange={(e) => setFormData({ ...formData, userAge: safeNumber(e.target.value, 35) })}
            />
          </div>

          <div>
            <label className={labelClass}>성별</label>
            <select
              className={inputClass}
              value={formData.userGender}
              onChange={(e) => setFormData({ ...formData, userGender: e.target.value as any })}
            >
              <option value="여성">여성</option>
              <option value="남성">남성</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>주간 운동 빈도</label>
            <select
              className={inputClass}
              value={formData.exercise}
              onChange={(e) => setFormData({ ...formData, exercise: e.target.value as any })}
            >
              <option value="안 함">안 함</option>
              <option value="1-2회">1-2회</option>
              <option value="3-4회">3-4회</option>
              <option value="5회+">5회+</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>골격근량</label>
            <select
              className={inputClass}
              value={formData.muscleMass}
              onChange={(e) => setFormData({ ...formData, muscleMass: e.target.value as any })}
            >
              <option value="모름">모름</option>
              <option value="이하">이하</option>
              <option value="표준">표준</option>
              <option value="이상">이상</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>다이어트 관리 예산</label>
            <select
              className={inputClass}
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value as any })}
            >
              <option value="실속형">실속형</option>
              <option value="표준형">표준형</option>
              <option value="집중형">집중형</option>
            </select>
            <div className="mt-2 text-xs text-slate-500 leading-relaxed">
              {budgetHelpText(formData.budget)}
            </div>
          </div>
        </div>
      </div>

      {/* 체중 목표 */}
      <div className={`${sectionCard} bg-emerald-50`}>
        <div className={sectionTitle}>체중 목표</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>현재 체중 (kg)</label>
            <input
              type="number"
              className={inputClass}
              value={formData.currentWeight}
              onChange={(e) => setFormData({ ...formData, currentWeight: safeNumber(e.target.value, 80) })}
            />
          </div>
          <div>
            <label className={labelClass}>목표 체중 (kg)</label>
            <input
              type="number"
              className={inputClass}
              value={formData.targetWeight}
              onChange={(e) => setFormData({ ...formData, targetWeight: safeNumber(e.target.value, 65) })}
            />
          </div>
        </div>
      </div>

      {/* 투약 정보 */}
      <div className={`${sectionCard} bg-blue-50`}>
        <div className={sectionTitle}>투약 정보</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 투약 상태 */}
          <div>
            <label className={labelClass}>투약 상태</label>
            <div className="flex gap-2">
              {(["사용 전", "사용 중"] as DrugStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, drugStatus: s })}
                  className={`flex-1 p-4 rounded-2xl font-black transition-all border ${
                    formData.drugStatus === s
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 약물 선택 */}
          <div>
            <label className={labelClass}>약물 선택</label>
            <select
              className={inputClass}
              value={formData.drugType}
              onChange={(e) => setFormData({ ...formData, drugType: e.target.value as DrugType })}
            >
              <option value="MOUNJARO">마운자로</option>
              <option value="WEGOVY">위고비</option>
            </select>
          </div>
        </div>

        {formData.drugStatus === "사용 중" && (
          <div className="mt-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 시작 체중 */}
              <div>
                <label className={labelClass}>투약 전 시작 체중 (kg)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={formData.startWeightBeforeDrug}
                  onChange={(e) =>
                    setFormData({ ...formData, startWeightBeforeDrug: safeNumber(e.target.value, formData.currentWeight) })
                  }
                />
              </div>

              {/* 용량 */}
              <div>
                <label className={labelClass}>현재 투약 용량</label>
                <select
                  className={inputClass}
                  value={String(formData.currentDose)}
                  onChange={(e) => setFormData({ ...formData, currentDose: safeNumber(e.target.value, doseOpts[0]) })}
                >
                  {doseOpts.map((d) => (
                    <option key={d} value={String(d)}>
                      {formatDoseMg(d)}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-slate-500">약물 기준으로 용량 단계를 선택하세요.</div>
              </div>
            </div>

            {/* 시작일/주차 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>투약 시작일</label>
                <input
                  type="date"
                  className={inputClass}
                  value={formData.startDate || ""}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <div className="mt-2 text-xs text-slate-500">시작일 기준으로 현재 주차를 자동 계산합니다.</div>
              </div>

              <div>
                <label className={labelClass}>현재 투약 주차</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className={`${inputClass} flex-1`}
                    value={formData.currentWeek}
                    onChange={(e) => setFormData({ ...formData, currentWeek: safeNumber(e.target.value, 0) })}
                    disabled={formData.weekMode === "auto"}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, weekMode: "auto" })}
                    className={`px-5 rounded-2xl font-black border ${
                      formData.weekMode === "auto"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    자동
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, weekMode: "manual" })}
                    className={`px-5 rounded-2xl font-black border ${
                      formData.weekMode === "manual"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    수동
                  </button>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {formData.weekMode === "auto"
                    ? `자동 계산값: ${formData.currentWeek}주차 (필요하면 수동으로 보정하세요)`
                    : "수동 입력 모드입니다. 실제 주차에 맞게 조정하세요."}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 고민 */}
      <div className={`${sectionCard} bg-amber-50`}>
        <div className={sectionTitle}>고민</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>다이어트에서 가장 큰 고민</label>
            <select
              className={inputClass}
              value={formData.mainConcern}
              onChange={(e) => setFormData({ ...formData, mainConcern: e.target.value as any })}
            >
              <option value="요요">요요</option>
              <option value="근감소">근감소</option>
              <option value="비용">비용</option>
              <option value="부작용">부작용</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>다이어트 각오</label>
            <textarea
              className={`${inputClass} min-h-[96px]`}
              placeholder="예: 이번에는 요요 없이 성공하겠습니다."
              value={formData.resolution}
              onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-6 bg-slate-900 text-white font-black text-lg rounded-[22px] shadow-xl hover:bg-slate-800 transition-all"
      >
        무료 로드맵 생성
      </button>
    </form>
  );
}
