export default function ResultScreen({ result, onRestart }) {
  const percentage = result
    ? Math.round((result.score / result.totalQuestions) * 100)
    : 0;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10 sm:px-8">
      <div className="w-full rounded-3xl border border-teal-300/30 bg-slate-900/80 p-8 shadow-2xl shadow-teal-900/15 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Quiz Complete</p>
        <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">Your Score</h1>
        <p className="mt-4 text-5xl font-black text-teal-300">
          {result.score}/{result.totalQuestions}
        </p>
        <p className="mt-2 text-sm text-slate-300">Accuracy: {percentage}%</p>

        <div className="mt-8 grid gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-sm text-slate-200">
          <p>Cheat count: {result.cheatCount}</p>
          <p>Elapsed time: {result.elapsedSeconds}s</p>
          <p>Flagged: {result.flagged ? "Yes" : "No"}</p>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="mt-8 rounded-lg bg-teal-300 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-teal-200"
        >
          Take Another Quiz
        </button>
      </div>
    </div>
  );
}
