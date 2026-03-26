export default function DisqualifiedScreen({ result }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10 sm:px-8">
      <div className="w-full rounded-3xl border border-rose-400/40 bg-slate-900/85 p-8 shadow-2xl shadow-rose-900/20 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">Attempt Invalid</p>
        <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">Disqualified</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-200 sm:text-base">
          This quiz was auto-submitted after repeated anti-cheating violations.
        </p>
        <div className="mt-8 grid gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-sm text-slate-200">
          <p>Cheat count: {result?.cheatCount ?? 3}</p>
          <p>Score recorded: {result?.score ?? 0}</p>
          <p>Status: flagged for manual review</p>
        </div>
      </div>
    </div>
  );
}
