export default function QuestionCard({
  question,
  index,
  total,
  selectedOption,
  onSelect,
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
      <div className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-teal-300">
        <span>
          Question {index + 1} / {total}
        </span>
        <span>{Math.round(((index + 1) / total) * 100)}% progress</span>
      </div>
      <h2 className="text-xl font-semibold leading-relaxed text-slate-100">{question.text}</h2>
      <div className="mt-6 grid gap-3">
        {question.options.map((option) => {
          const selected = option.id === selectedOption;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(question.id, option.id)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                selected
                  ? "border-teal-300 bg-teal-300/20 text-teal-100"
                  : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500"
              }`}
            >
              {option.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
