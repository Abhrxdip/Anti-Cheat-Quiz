export default function WarningModal({ open, message, level, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-300/40 bg-slate-900 p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
          Anti-cheat warning {level}/2
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Attention Required</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-200">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
        >
          Continue Quiz
        </button>
      </div>
    </div>
  );
}
