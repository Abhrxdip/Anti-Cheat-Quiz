import { useEffect, useMemo, useState } from "react";
import {
  getAdminSubmissions,
  getHealth,
  getServerInfo,
  reportViolation,
  startQuiz,
  submitQuiz,
} from "../services/api";

function formatDate(value) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString();
}

export default function AdminDashboard({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    count: 0,
    flaggedCount: 0,
    disqualifiedCount: 0,
    submissions: [],
  });
  const [testerName, setTesterName] = useState("abhra");
  const [testerSessionToken, setTesterSessionToken] = useState("");
  const [violationType, setViolationType] = useState("tab_switch");
  const [clientDurationSeconds, setClientDurationSeconds] = useState("30");
  const [submitReason, setSubmitReason] = useState("manual_test_from_dashboard");
  const [answersJson, setAnswersJson] = useState("[]");
  const [latestResponse, setLatestResponse] = useState("No API action run yet.");
  const [testerError, setTesterError] = useState("");
  const [startQuestions, setStartQuestions] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const payload = await getAdminSubmissions();
      setData(payload);
    } catch (err) {
      setError(err.message || "Unable to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const averageScore = useMemo(() => {
    if (data.submissions.length === 0) {
      return 0;
    }
    const total = data.submissions.reduce((sum, entry) => sum + entry.score, 0);
    return (total / data.submissions.length).toFixed(2);
  }, [data.submissions]);

  const runAction = async (fn) => {
    try {
      setTesterError("");
      const payload = await fn();
      setLatestResponse(JSON.stringify(payload, null, 2));
    } catch (err) {
      setTesterError(err.message || "API request failed");
    }
  };

  const handleStartQuiz = () => {
    runAction(async () => {
      const payload = await startQuiz(testerName);
      setTesterSessionToken(payload.sessionToken || "");
      setStartQuestions(payload.questions || []);
      return payload;
    });
  };

  const handleViolation = () => {
    runAction(async () => {
      return reportViolation({
        sessionToken: testerSessionToken,
        type: violationType,
        clientTimestamp: Date.now(),
      });
    });
  };

  const handleSubmit = () => {
    runAction(async () => {
      const answers = JSON.parse(answersJson);
      return submitQuiz({
        sessionToken: testerSessionToken,
        answers,
        clientDurationSeconds: Number(clientDurationSeconds) || 30,
        reason: submitReason,
      });
    });
  };

  const autofillAnswers = () => {
    const generated = startQuestions.map((question) => ({
      questionId: question.id,
      optionId: question.options?.[0]?.id || "",
    }));
    setAnswersJson(JSON.stringify(generated, null, 2));
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-8">
      <div className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/35 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Admin Monitor</p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Submission Review Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-400"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-cyan-200"
            >
              Back
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <StatTile label="Total Attempts" value={data.count} tone="cyan" />
          <StatTile label="Flagged" value={data.flaggedCount} tone="amber" />
          <StatTile label="Disqualified" value={data.disqualifiedCount} tone="rose" />
          <StatTile label="Avg Score" value={averageScore} tone="emerald" />
        </div>

        {loading ? <p className="mt-5 text-sm text-slate-300">Loading submissions...</p> : null}
        {error ? <p className="mt-5 text-sm text-rose-300">{error}</p> : null}

        <div className="mt-6 space-y-3">
          {data.submissions.map((entry) => (
            <article
              key={entry.id}
              className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-sm text-slate-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold text-white">{entry.userName}</h2>
                <p className="text-xs text-slate-400">{formatDate(entry.submittedAt)}</p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-5">
                <Metric text={`Score: ${entry.score}/${entry.totalQuestions}`} />
                <Metric text={`Cheat: ${entry.cheatCount}`} />
                <Metric text={`Elapsed: ${entry.elapsedSeconds}s`} />
                <Metric text={`Flagged: ${entry.flagged ? "Yes" : "No"}`} />
                <Metric text={`Disqualified: ${entry.disqualified ? "Yes" : "No"}`} />
              </div>
              <p className="mt-2 text-xs text-slate-400">Reason: {entry.reason || "-"}</p>
            </article>
          ))}

          {!loading && data.submissions.length === 0 ? (
            <p className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-sm text-slate-300">
              No submissions recorded yet.
            </p>
          ) : null}
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-300/30 bg-slate-800/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Backend API Tester</p>
          <h2 className="mt-2 text-lg font-bold text-white">Run Backend Endpoints Without Postman</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              value={testerName}
              onChange={(event) => setTesterName(event.target.value)}
              placeholder="User name"
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            />
            <input
              value={testerSessionToken}
              onChange={(event) => setTesterSessionToken(event.target.value)}
              placeholder="Session token"
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            />
            <select
              value={violationType}
              onChange={(event) => setViolationType(event.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              <option value="tab_switch">tab_switch</option>
              <option value="window_blur">window_blur</option>
              <option value="fullscreen_exit">fullscreen_exit</option>
              <option value="right_click">right_click</option>
              <option value="copy_attempt">copy_attempt</option>
              <option value="back_navigation">back_navigation</option>
            </select>
            <input
              value={clientDurationSeconds}
              onChange={(event) => setClientDurationSeconds(event.target.value)}
              placeholder="Client duration seconds"
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <input
            value={submitReason}
            onChange={(event) => setSubmitReason(event.target.value)}
            placeholder="Submit reason"
            className="mt-3 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          />

          <textarea
            value={answersJson}
            onChange={(event) => setAnswersJson(event.target.value)}
            rows={8}
            className="mt-3 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 font-mono text-xs text-slate-100"
            placeholder='[{"questionId":"q1","optionId":"a"}]'
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runAction(getServerInfo)}
              className="rounded-lg border border-slate-500 px-3 py-2 text-xs font-semibold text-slate-100"
            >
              GET /
            </button>
            <button
              type="button"
              onClick={() => runAction(getHealth)}
              className="rounded-lg border border-slate-500 px-3 py-2 text-xs font-semibold text-slate-100"
            >
              GET /api/health
            </button>
            <button
              type="button"
              onClick={handleStartQuiz}
              className="rounded-lg border border-emerald-400/60 px-3 py-2 text-xs font-semibold text-emerald-200"
            >
              POST /api/quiz/start
            </button>
            <button
              type="button"
              onClick={handleViolation}
              className="rounded-lg border border-amber-400/60 px-3 py-2 text-xs font-semibold text-amber-200"
            >
              POST /api/quiz/violation
            </button>
            <button
              type="button"
              onClick={autofillAnswers}
              className="rounded-lg border border-sky-400/60 px-3 py-2 text-xs font-semibold text-sky-200"
            >
              Autofill Answers
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg border border-fuchsia-400/60 px-3 py-2 text-xs font-semibold text-fuchsia-200"
            >
              POST /api/quiz/submit
            </button>
            <button
              type="button"
              onClick={() => runAction(getAdminSubmissions)}
              className="rounded-lg border border-cyan-400/60 px-3 py-2 text-xs font-semibold text-cyan-200"
            >
              GET /api/admin/submissions
            </button>
          </div>

          {testerError ? <p className="mt-3 text-sm text-rose-300">{testerError}</p> : null}

          <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200">
            {latestResponse}
          </pre>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, tone }) {
  const toneClass = {
    cyan: "border-cyan-300/40 bg-cyan-300/10 text-cyan-200",
    amber: "border-amber-300/40 bg-amber-300/10 text-amber-200",
    rose: "border-rose-400/40 bg-rose-400/10 text-rose-200",
    emerald: "border-emerald-300/40 bg-emerald-300/10 text-emerald-200",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 ${toneClass[tone] || toneClass.cyan}`}>
      <p className="text-[11px] uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function Metric({ text }) {
  return <p className="rounded-md bg-slate-900/60 px-2 py-1 text-xs">{text}</p>;
}
