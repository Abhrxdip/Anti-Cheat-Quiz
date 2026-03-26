import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuiz } from "../context/useQuiz";
import { useAntiCheat } from "../hooks/useAntiCheat";
import { useFullscreen } from "../hooks/useFullscreen";
import QuestionCard from "./QuestionCard";
import WarningModal from "./WarningModal";

const PER_QUESTION_SECONDS = 20;

function formatSeconds(total) {
  const safe = Math.max(0, total);
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safe % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function QuizScreen() {
  const {
    name,
    questions,
    answers,
    durationSeconds,
    startedAt,
    cheatCount,
    warningLevel,
    warningMessage,
    answerQuestion,
    closeWarning,
    recordViolation,
    finishQuiz,
    error,
  } = useQuiz();

  const { enterFullscreen } = useFullscreen();
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [activeIndex, setActiveIndex] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(PER_QUESTION_SECONDS);

  const moveToIndex = useCallback((nextIndex) => {
    setActiveIndex(nextIndex);
    setQuestionTimeLeft(PER_QUESTION_SECONDS);
  }, []);

  useEffect(() => {
    enterFullscreen();
  }, [enterFullscreen]);

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const nextLeft = Math.max(0, durationSeconds - elapsed);
      setTimeLeft(nextLeft);

      if (nextLeft <= 0) {
        clearInterval(id);
        finishQuiz({ forced: true, reason: "timer_expired" });
      }
    }, 250);

    return () => clearInterval(id);
  }, [durationSeconds, finishQuiz, startedAt]);

  useEffect(() => {
    const id = setInterval(() => {
      setQuestionTimeLeft((current) => {
        if (current <= 1) {
          if (activeIndex < questions.length - 1) {
            moveToIndex(activeIndex + 1);
            return PER_QUESTION_SECONDS;
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [activeIndex, moveToIndex, questions.length]);

  useAntiCheat({
    active: true,
    onViolation: recordViolation,
  });

  const currentQuestion = questions[activeIndex];

  const progressPercent = useMemo(() => {
    if (questions.length === 0) {
      return 0;
    }
    return Math.round((Object.keys(answers).length / questions.length) * 100);
  }, [answers, questions.length]);

  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex < questions.length - 1;

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
      <div className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/35 sm:p-8">
        <div className="flex flex-col gap-4 border-b border-slate-700 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Candidate</p>
            <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">{name}</h1>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatChip label="Global Timer" value={formatSeconds(timeLeft)} tone="teal" />
            <StatChip
              label="Question Timer"
              value={`${questionTimeLeft}s`}
              tone={questionTimeLeft <= 5 ? "rose" : "slate"}
            />
            <StatChip label="Violations" value={cheatCount.toString()} tone={cheatCount >= 2 ? "rose" : "amber"} />
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-300 via-cyan-300 to-emerald-300 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs uppercase tracking-wider text-slate-400">{progressPercent}% answered</p>
        </div>

        <div className="mt-6">
          {currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              index={activeIndex}
              total={questions.length}
              selectedOption={answers[currentQuestion.id]}
              onSelect={answerQuestion}
            />
          ) : null}
        </div>

        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-sm text-slate-300">
          <p className="font-semibold text-cyan-200">Webcam Proctoring Placeholder</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Camera stream integration can be plugged into this panel. Current build uses event-based anti-cheat signals.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => moveToIndex(Math.max(0, activeIndex - 1))}
              disabled={!canGoPrevious}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => moveToIndex(Math.min(questions.length - 1, activeIndex + 1))}
              disabled={!canGoNext}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>

          <button
            type="button"
            onClick={() => finishQuiz({ forced: false })}
            className="rounded-lg bg-teal-300 px-5 py-2 text-sm font-bold text-slate-900 transition hover:bg-teal-200"
          >
            Submit Quiz
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      </div>

      <WarningModal
        open={Boolean(warningMessage)}
        message={warningMessage}
        level={warningLevel}
        onClose={closeWarning}
      />
    </div>
  );
}

function StatChip({ label, value, tone }) {
  const toneClass = {
    teal: "border-teal-300/40 bg-teal-300/10 text-teal-200",
    amber: "border-amber-300/40 bg-amber-300/10 text-amber-200",
    rose: "border-rose-400/40 bg-rose-400/10 text-rose-200",
    slate: "border-slate-600 bg-slate-800 text-slate-200",
  };

  return (
    <div className={`rounded-xl border px-3 py-2 ${toneClass[tone] || toneClass.slate}`}>
      <p className="text-[11px] uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
