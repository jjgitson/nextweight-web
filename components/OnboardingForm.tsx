// /components/OnboardingForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  onComplete: (data: any) => void;
};

type DrugType = "MOUNJARO" | "WEGOVY";
type DrugStatus = "사용 전" | "사용 중";
type WeekMode = "AUTO" | "MANUAL";

const DOSE_OPTIONS: Record<DrugType, number[]> = {
  MOUNJARO: [2.5, 5, 7.5, 10, 12.5, 15],
  WEGOVY: [0.25, 0.5, 1, 1.7, 2.4],
};

function clampNumber(v: number, min: number, max: number) {
  if (Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, v));
}

function calcWeekFromStartDate(startDate: string | undefined) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return 0;

  const today = new Date();
  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const w = Math.floor(diffDays / 7);

  return clampNumber(w, 0, 500);
}

export default function OnboardingForm({ onComplete }: Props) {
  const [formData, setFormData] = useState({
    // 기본 정보
    userName: "",
    userAge: 35,
    userGender: "남성",
    exercise: "안 함",
    muscleMass: "모름",
    budget: "표준형",

    // 체중 정보
    currentWeight: 80,
    targetWeight: 65,

    // 투약 정보
    drugStatus: "사용 전" as DrugStatus,
    drugType: "MOUNJARO" as DrugType,
    startWeightBeforeDrug: 80,
    currentDose: 2.5,
    startDate: "" as string, // yyyy-mm-dd
    weekMode: "AUTO" as WeekMode,
    currentWeek: 0,

    // 고민
    mainConcern: "요요",
    resolution: "",
  });

  const labelClass =
    "text-sm font-black text-slate-700 mb-2 block tracking-tight";
  const helpClass = "text-xs text-slate-500 mt-2 leading-relaxed";
  const inputClass =
    "w-full px-4 py-3 bg-white rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-300 outline-none transition-all";

  const doseOptions = useMemo(() => DOSE_OPTIONS[formData.drugType], [formData.drugType]);

  // 약물 변경 시 용량이 범위 밖이면 첫 옵션으로 보정
  useEffect(() => {
    if (!doseOptions.includes(formData.currentDose)) {
      setFormData((prev) => ({ ...prev, currentDose: doseOptions[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.drugType]);

  // AUTO 모드면 시작일 기준 주차 자동 계산
  useEffect(() => {
    if (formData.drugStatus !== "사용 중") return;
    if (formData.weekMode !== "AUTO") return;

    const w = calcWeekFromStartDate(formData.startDate || undefined);
    setFormData((prev) => ({ ...prev, currentWeek: w }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startDate, formData.weekMode, formData.drugStatus]);

  const budgetDescription =
    "GLP-1은 비용이 큰 다이어트입니다. 예산에 맞게 효율적인 전략이 필요합니다. 사용자마다 관리 범위가 달라 3가지 예산 등급으로 표현했습니다.";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      // 사용 전이면 투약 관련 값들을 최소화해서 전달
      startWeightBeforeDrug:
        formData.drugStatus === "사용 중"
          ? Number(formData.startWeightBeforeDrug)
          : Number(formData.currentWeight),
      currentDose: formData.drugStatus === "사용 중" ? Number(formData.currentDose) : 0,
      startDate: formData.drugStatus === "사용 중" ? (formData.startDate || "") : "",
      currentWeek: formData.drugStatus === "사용 중" ? Number(formData.currentWeek) : 0,
    };

    onComplete(payload);
  };

  return (
    <form
      onSubmit={submit}
      className="max-w-3xl mx-auto space-y-6 bg-white p-10 md:p-12 rounded-[32px] shadow-xl border border-slate-100"
    >
      {/* 기본 정보 */}
      <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 md:p-7">
        <div className="text-lg font-black text-slate-900 mb-5">기본 정보</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>성함</label>
            <input
              type="text"
              required
              className={inputClass}
              value={formData.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
              placeholder="예: 서진원"
            />
          </div>

          <div>
            <label className={labelClass}>나이</label>
            <input
              type="number"
              className={inputClass}
              value={formData.userAge}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  userAge: clampNumber(Number(e.target.value), 0, 120),
                })
              }
            />
          </div>

          <div>
            <label className={labelClass}>성별</label>
            <select
              className={inputClass}
              value={formData.userGender}
              onChange={(e) =>
                setFormData({ ...formData, userGender: e.target.value })
              }
            >
              <option>여성</option>
              <option>남성</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>주간 운동 빈도</label>
            <select
              className={inputClass}
              value={formData.exercise}
              onChange={(e) =>
                setFormData({ ...formData, exercise: e.target.value })
              }
            >
              <option>안 함</option>
              <option>1-2회</option>
              <option>3-4회</option>
              <option>5회+</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>골격근량</label>
            <select
              className={inputClass}
              value={formData.muscleMass}
              onChange={(e) =>
                setFormData({ ...formData, muscleMass: e.target.value })
              }
            >
              <option>모름</option>
              <option>이하</option>
              <option>표준</option>
              <option>이상</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>다이어트 관리 예산</label>
            <select
              className={inputClass}
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
            >
              <option>실속형</option>
              <option>표준형</option>
              <option>집중형</option>
            </select>
            <div className={helpClass}>{budgetDescription}</div>
          </div>
        </div>
      </div>

      {/* 체중 목표 */}
      <div className="rounded-3xl border border-slate-100 bg-sky-50/60 p-6 md:p-7">
        <div className="text-lg font-black text-slate-900 mb-5">체중 목표</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>현재 체중 (kg)</label>
            <input
              type="number"
              className={inputClass}
              value={formData.currentWeight}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentWeight: clampNumber(Number(e.target.value), 0, 500),
                })
              }
            />
          </div>

          <div>
            <label className={labelClass}>목표 체중 (kg)</label>
            <input
              type="number"
              className={inputClass}
              value={formData.targetWeight}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetWeight: clampNumber(Number(e.target.value), 0, 500),
                })
              }
            />
          </div>
        </div>
      </div>

      {/* 투약 정보 */}
      <div className="rounded-3xl border border-slate-100 bg-amber-50/60 p-6 md:p-7">
        <div className="text-lg font-black text-slate-900 mb-5">투약 정보</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>투약 상태</label>
            <div className="flex gap-2">
              {(["사용 전", "사용 중"] as DrugStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      drugStatus: s,
                      // 사용 전으로 바꾸면 주차/시작일 리셋
                      ...(s === "사용 전"
                        ? { startDate: "", currentWeek: 0, weekMode: "AUTO" as WeekMode }
                        : {}),
                    }))
                  }
                  className={`flex-1 px-4 py-3 rounded-2xl font-black transition-all border ${
                    formData.drugStatus === s
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>약물 선택</label>
            <select
              className={inputClass}
              value={formData.drugType}
              onChange={(e) =>
                setFormData({ ...formData, drugType: e.target.value as DrugType })
              }
            >
              <option value="MOUNJARO">마운자로</option>
              <option value="WEGOVY">위고비</option>
            </select>
          </div>
        </div>

        {formData.drugStatus === "사용 중" && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>투약 전 시작 체중 (kg)</label>
              <input
                type="number"
                className={inputClass}
                value={formData.startWeightBeforeDrug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startWeightBeforeDrug: clampNumber(Number(e.target.value), 0, 500),
                  })
                }
              />
            </div>

            <div>
              <label className={labelClass}>현재 투약 용량</label>
              <select
                className={inputClass}
                value={String(formData.currentDose)}
                onChange={(e) =>
                  setFormData({ ...formData, currentDose: Number(e.target.value) })
                }
              >
                {doseOptions.map((d) => (
                  <option key={d} value={String(d)}>
                    {d} mg
                  </option>
                ))}
              </select>
              <div className={helpClass}>약물 기준으로 용량 단계를 선택하세요.</div>
            </div>

            <div>
              <label className={labelClass}>투약 시작일</label>
              <input
                type="date"
                className={inputClass}
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
              <div className={helpClass}>시작일 기준으로 현재 주차를 자동 계산합니다.</div>
            </div>

            <div>
              <label className={labelClass}>현재 투약 주차</label>

              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, weekMode: "AUTO" })}
                  className={`px-4 py-2 rounded-xl font-black border transition-all ${
                    formData.weekMode === "AUTO"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  자동
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, weekMode: "MANUAL" })}
                  className={`px-4 py-2 rounded-xl font-black border transition-all ${
                    formData.weekMode === "MANUAL"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  수동
                </button>
              </div>

              <input
                type="number"
                className={inputClass}
                value={formData.currentWeek}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentWeek: clampNumber(Number(e.target.value), 0, 500),
                  })
                }
                disabled={formData.weekMode === "AUTO"}
              />

              <div className={helpClass}>
                {formData.weekMode === "AUTO"
                  ? `자동 계산값: ${calcWeekFromStartDate(formData.startDate || undefined)}주차 (필요하면 수동으로 전환해 보정하세요)`
                  : "주차를 직접 입력합니다. 시작일과 맞지 않아도 됩니다."}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 고민 */}
      <div className="rounded-3xl border border-slate-100 bg-rose-50/60 p-6 md:p-7">
        <div className="text-lg font-black text-slate-900 mb-5">고민</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>다이어트에서 가장 큰 고민</label>
            <select
              className={inputClass}
              value={formData.mainConcern}
              onChange={(e) =>
                setFormData({ ...formData, mainConcern: e.target.value })
              }
            >
              <option>요요</option>
              <option>근감소</option>
              <option>비용</option>
              <option>부작용</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>다이어트 각오</label>
            <textarea
              className={inputClass}
              rows={3}
              value={formData.resolution}
              onChange={(e) =>
                setFormData({ ...formData, resolution: e.target.value })
              }
              placeholder="예: 이번에는 요요 없이 성공하겠습니다."
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-5 bg-slate-900 text-white font-black text-lg rounded-2xl shadow-lg hover:bg-slate-800 transition-all"
      >
        무료 로드맵 생성
      </button>
    </form>
  );
}
