// /components/OnboardingForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

export type DrugStatus = "사용 전" | "사용 중";
export type DrugType = "MOUNJARO" | "WEGOVY" | "NONE";

export type FormData = {
  userName: string;
  userAge: number;
  userGender: "남성" | "여성";
  exercise: "안 함" | "주 1~2회" | "주 3회 이상";
  muscleMass: "모름" | "이하" | "표준" | "이상";
  budget: "실속형" | "표준형" | "집중형";

  currentWeight: number;
  targetWeight: number;

  drugStatus: DrugStatus;
  drugType: DrugType;

  startWeightBeforeDrug?: number;
  currentDose?: string;

  startDate?: string; // YYYY-MM-DD
  weekMode: "auto" | "manual";
  currentWeek: number;

  concern: "요요" | "근감소" | "부작용" | "정체기" | "동기" | "기타";
  resolution: string;
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[16px] outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

function safeNumber(v: any, fallback: number) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function yyyyMmDd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function calcWeekFromStartDate(startDate?: string) {
  if (!startDate) return 0;
  const s = new Date(startDate + "T00:00:00");
  if (Number.isNaN(s.getTime())) return 0;
  const now = new Date();
  const diff = now.getTime() - s.getTime();
  const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  return Math.max(0, weeks);
}

function doseOptions(drugType: DrugType) {
  if (drugType === "MOUNJARO") return ["2.5 mg", "5 mg", "7.5 mg", "10 mg", "12.5 mg", "15 mg"];
  if (drugType === "WEGOVY") return ["0.25 mg", "0.5 mg", "1 mg", "1.7 mg", "2.4 mg"];
  return ["0 mg"];
}

export default function OnboardingForm({ onComplete }: { onComplete: (data: FormData) => void }) {
  const today = useMemo(() => yyyyMmDd(new Date()), []);

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

    startWeightBeforeDrug: undefined,
    currentDose: undefined,

    startDate: undefined,
    weekMode: "auto",
    currentWeek: 0,

    concern: "요요",
    resolution: "",
  });

  // 약물/상태 변화에 따른 기본값 보정
  useEffect(() => {
    const opts = doseOptions(formData.drugType);

    // 사용 전이면 "0 mg"로 고정
    if (formData.drugStatus === "사용 전") {
      if (formData.currentDose !== "0 mg") {
        setFormData((p) => ({ ...p, currentDose: "0 mg" }));
      }
      return;
    }

    // 사용 중인데 용량이 비어있거나 해당 약물 옵션에 없으면 첫 옵션으로
    if (formData.drugStatus === "사용 중") {
      if (!formData.currentDose || !opts.includes(formData.currentDose)) {
        setFormData((p) => ({ ...p, currentDose: opts[0] }));
      }
    }
  }, [formData.drugType, formData.drugStatus]);

  // 자동 주차 계산
  useEffect(() => {
    if (formData.weekMode !== "auto") return;
    const w = calcWeekFromStartDate(formData.startDate);
    if (w !== formData.currentWeek) {
      setFormData((p) => ({ ...p, currentWeek: w }));
    }
  }, [formData.startDate, formData.weekMode, formData.currentWeek]);

  const showDrugFields = formData.drugStatus === "사용 중";

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onComplete(formData);
      }}
    >
      {/* 기본 정보 */}
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 md:p-8">
        <div className="mb-5 text-[18px] font-black text-slate-900">기본 정보</div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-600">성함</label>
            <input
              className={inputClass}
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              placeholder="예: 홍길동"
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-600">나이</label>
            <input
              type="number"
              className={inputClass}
              value={formData.userAge}
              onChange={(e) => setFormData({ ...formData, userAge: safeNumber(e.target.value, 35) })}
              min={10}
              max={120}
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-600">성별</label>
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
            <label className="mb-2 block text-[13px] font-semibold text-slate-600">주간 운동 빈도</label>
            <select
              className={inputClass}
              value={formData.exercise}
              onChange={(e) => setFormData({ ...formData, exercise: e.target.value as any })}
            >
              <option value="안 함">안 함</option>
              <option value="주 1~2회">주 1~2회</option>
              <option value="주 3회 이상">주 3회 이상</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-600">골격근량</label>
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
            <label className="mb-2 block text-[13px] font-semibold text-slate-600">다이어트 관리 예산</label>
            <select
              className={inputClass}
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value as any })}
            >
              <option value="실속형">실속형</option>
              <option value="표준형">표준형</option>
              <option value="집중형">집중형</option>
            </select>
            <div className="mt-2 text-[12px] leading-5 text-slate-500">
              GLP-1은 비용이 큰 다이어트입니다. 예산에 맞게 효율적인 전략이 필요하며, 사용자마다 관리 범위가 달라 3가지 예산 범주로 표현했습니다.
            </div>
          </div>
        </div>
      </div>

      {/* 체중 목표 */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 md:p-8">
        <div className="mb-5 text-[18px] font-black text-slate-900">체중 목표</div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-600">현재 체중 (kg)</label>
            <input
              type="number"
              className={inputClass}
              value={formData.currentWeight}
              onChange={(e) => setFormData({ ...formData, currentWeight: safeNumber(e.target.value, 0) })}
              min={0}
              step={0.1}
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-600">목표 체중 (kg)</label>
            <input
              type="number"
              className={inputClass}
              value={formData.targetWeight}
              onChange={(e) => setFormData({ ...formData, targetWeight: safeNumber(e.target.value, 0) })}
              min={0}
              step={0.1}
            />
          </div>
        </div>
      </div>

      {/* 투약 정보 */}
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 md:p-8">
        <div className="mb-5 text-[18px] font-black text-slate-900">투약 정보</div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-600">투약 상태</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, drugStatus: "사용 전", startDate: undefined, currentWeek: 0 })}
                className={`flex-1 rounded-2xl border px-5 py-4 font-black ${
                  formData.drugStatus === "사용 전"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                사용 전
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    drugStatus: "사용 중",
                    startDate: formData.startDate ?? today,
                    weekMode: "auto",
                  })
                }
                className={`flex-1 rounded-2xl border px-5 py-4 font-black ${
                  formData.drugStatus === "사용 중"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                사용 중
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-600">약물 선택</label>
            <select
              className={inputClass}
              value={formData.drugType}
              onChange={(e) => setFormData({ ...formData, drugType: e.target.value as any })}
            >
              <option value="MOUNJARO">마운자로</option>
              <option value="WEGOVY">위고비</option>
              <option value="NONE">선택 안 함</option>
            </select>
          </div>

          {showDrugFields && (
            <>
              <div>
                <label className="mb-2 block text-[13px] font-semibold text-slate-600">투약 전 시작 체중 (kg)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={formData.startWeightBeforeDrug ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startWeightBeforeDrug: e.target.value === "" ? undefined : safeNumber(e.target.value, 0),
                    })
                  }
                  min={0}
                  step={0.1}
                  placeholder="예: 104"
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold text-slate-600">현재 투약 용량</label>
                <select
                  className={inputClass}
                  value={formData.currentDose ?? doseOptions(formData.drugType)[0]}
                  onChange={(e) => setFormData({ ...formData, currentDose: e.target.value })}
                >
                  {doseOptions(formData.drugType).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-[12px] leading-5 text-slate-500">약물 기준으로 용량 단계를 선택하세요.</div>
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold text-slate-600">투약 시작일</label>
                <input
                  type="date"
                  className={inputClass}
                  value={formData.startDate ?? ""}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <div className="mt-2 text-[12px] leading-5 text-slate-500">시작일 기준으로 현재 주차를 자동 계산합니다.</div>
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold text-slate-600">현재 투약 주차</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className={`${inputClass} flex-1`}
                    value={formData.currentWeek}
                    onChange={(e) => setFormData({ ...formData, currentWeek: safeNumber(e.target.value, 0) })}
                    disabled={formData.weekMode === "auto"}
                    min={0}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, weekMode: "auto" })}
                    className={`px-5 py-4 rounded-2xl font-black border ${
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
                    className={`px-5 py-4 rounded-2xl font-black border ${
                      formData.weekMode === "manual"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    수동
                  </button>
                </div>
                <div className="mt-2 text-[12px] leading-5 text-slate-500">
                  자동 계산값: {calcWeekFromStartDate(formData.startDate)}주차 (필요하면 수동으로 보정하세요)
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 고민 */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 md:p-8">
        <div className="mb-5 text-[18px] font-black text-slate-900">고민</div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-600">다이어트에서 가장 큰 고민</label>
            <select
              className={inputClass}
              value={formData.concern}
              onChange={(e) => setFormData({ ...formData, concern: e.target.value as any })}
            >
              <option value="요요">요요</option>
              <option value="근감소">근감소</option>
              <option value="부작용">부작용</option>
              <option value="정체기">정체기</option>
              <option value="동기">동기</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-600">다이어트 각오</label>
            <textarea
              className={`${inputClass} min-h-[110px]`}
              placeholder="예: 이번에는 기필코..."
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
