import { useState } from "react";

export default function StartScreen({ onStart, loading, onOpenAdmin, error }) {
  const [name, setName] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      return;
    }
    await onStart(name.trim());
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10 sm:px-8">
      <div className="w-full rounded-3xl border border-slate-700/60 bg-slate-900/75 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">Secure Assessment</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Fullscreen Quiz Arena
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Rules are strict. Tab switch, blur, exiting fullscreen, right-click, and copy attempts are monitored.
          Three violations trigger automatic submission and disqualification.
        </p>

        <div className="mt-6 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
          1st violation: warning. 2nd violation: final warning. 3rd violation: disqualification.
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-teal-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-teal-300 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Starting..." : "Start Quiz"}
          </button>
        </form>

        {error ? (
          <p className="mt-3 rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onOpenAdmin}
            className="rounded-lg border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-200 transition hover:border-cyan-200"
          >
            Open Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
