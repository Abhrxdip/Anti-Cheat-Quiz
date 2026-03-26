const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { v4: uuidv4 } = require("uuid");

const { QUESTION_BANK } = require("./data/questions");
const {
  addSession,
  getSession,
  updateSession,
  addSubmission,
  getSubmissions,
} = require("./store/sessions");
const { shuffleArray } = require("./utils/shuffle");
const {
  isValidName,
  isValidViolationType,
  normalizeAnswerMap,
} = require("./utils/validators");
const {
  QUIZ_DURATION_SECONDS,
  MIN_SECONDS_PER_QUESTION,
  CHEAT_DISQUALIFY_COUNT,
} = require("./config");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "200kb" }));

function withoutAnswers(questions) {
  return questions.map((question) => ({
    id: question.id,
    text: question.text,
    options: question.options,
  }));
}

function findQuestion(questionId) {
  return QUESTION_BANK.find((question) => question.id === questionId);
}

function evaluateAttempt(session, answerMap) {
  let score = 0;
  let answeredCount = 0;

  for (const questionId of session.questionOrder) {
    const selected = answerMap.get(questionId);
    if (!selected) {
      continue;
    }

    answeredCount += 1;
    const question = findQuestion(questionId);
    if (!question) {
      continue;
    }

    if (question.correctOptionId === selected) {
      score += 1;
    }
  }

  return {
    score,
    answeredCount,
    totalQuestions: session.questionOrder.length,
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "quiz-backend" });
});

app.get("/", (_req, res) => {
  res.json({
    message: "Quiz backend is running.",
    hint: "Open the frontend at http://localhost:5173",
    endpoints: [
      "/api/health",
      "/api/quiz/start",
      "/api/quiz/violation",
      "/api/quiz/submit",
      "/api/admin/submissions",
    ],
  });
});

app.post("/api/quiz/start", (req, res) => {
  const { name } = req.body ?? {};
  if (!isValidName(name)) {
    return res.status(400).json({
      error: "Please provide a valid name between 2 and 40 characters.",
    });
  }

  const shuffledQuestions = shuffleArray(QUESTION_BANK).slice(0, 8);
  const questionOrder = shuffledQuestions.map((q) => q.id);
  const sessionToken = uuidv4();
  const now = Date.now();

  addSession({
    sessionToken,
    userName: name.trim(),
    startedAt: now,
    questionOrder,
    cheatCount: 0,
    cheatEvents: [],
    submitted: false,
    disqualified: false,
  });

  return res.json({
    sessionToken,
    startedAt: now,
    durationSeconds: QUIZ_DURATION_SECONDS,
    questions: withoutAnswers(shuffledQuestions),
  });
});

app.post("/api/quiz/violation", (req, res) => {
  const { sessionToken, type, clientTimestamp } = req.body ?? {};

  if (typeof sessionToken !== "string") {
    return res.status(400).json({ error: "Missing session token." });
  }

  if (!isValidViolationType(type)) {
    return res.status(400).json({ error: "Invalid violation type." });
  }

  const session = getSession(sessionToken);
  if (!session) {
    return res.status(404).json({ error: "Session not found." });
  }

  if (session.submitted) {
    return res.status(409).json({ error: "Quiz already submitted." });
  }

  const updated = updateSession(sessionToken, (current) => {
    const nextCheatCount = current.cheatCount + 1;
    const disqualified = nextCheatCount >= CHEAT_DISQUALIFY_COUNT;
    return {
      ...current,
      cheatCount: nextCheatCount,
      disqualified,
      cheatEvents: [
        ...current.cheatEvents,
        {
          type,
          clientTimestamp: Number.isFinite(clientTimestamp)
            ? clientTimestamp
            : null,
          serverTimestamp: Date.now(),
        },
      ],
    };
  });

  return res.json({
    cheatCount: updated.cheatCount,
    disqualified: updated.disqualified,
  });
});

app.post("/api/quiz/submit", (req, res) => {
  const { sessionToken, answers, clientDurationSeconds, reason } = req.body ?? {};

  if (typeof sessionToken !== "string") {
    return res.status(400).json({ error: "Missing session token." });
  }

  const session = getSession(sessionToken);
  if (!session) {
    return res.status(404).json({ error: "Session not found." });
  }

  if (session.submitted) {
    return res.status(409).json({ error: "Quiz already submitted." });
  }

  const answerMap = normalizeAnswerMap(answers);
  if (!answerMap) {
    return res.status(400).json({ error: "Invalid answer payload." });
  }

  const now = Date.now();
  const elapsedSeconds = Math.max(1, Math.floor((now - session.startedAt) / 1000));
  const maxSeconds = QUIZ_DURATION_SECONDS + 5;

  const suspiciousSpeed =
    elapsedSeconds < session.questionOrder.length * MIN_SECONDS_PER_QUESTION;

  const suspiciousDurationMismatch =
    Number.isFinite(clientDurationSeconds) &&
    Math.abs(clientDurationSeconds - elapsedSeconds) > 20;

  const timedOut = elapsedSeconds > maxSeconds;
  const disqualified = session.disqualified || session.cheatCount >= CHEAT_DISQUALIFY_COUNT;
  const flagged = disqualified || suspiciousSpeed || suspiciousDurationMismatch;

  const evaluation = evaluateAttempt(session, answerMap);

  updateSession(sessionToken, (current) => ({
    ...current,
    submitted: true,
  }));

  const result = {
    id: uuidv4(),
    sessionToken,
    userName: session.userName,
    score: disqualified ? 0 : evaluation.score,
    totalQuestions: evaluation.totalQuestions,
    answeredCount: evaluation.answeredCount,
    cheatCount: session.cheatCount,
    flagged,
    disqualified,
    reason: reason || null,
    suspiciousSpeed,
    suspiciousDurationMismatch,
    startedAt: new Date(session.startedAt).toISOString(),
    submittedAt: new Date(now).toISOString(),
    elapsedSeconds,
    cheatEvents: session.cheatEvents,
  };

  addSubmission(result);

  return res.json(result);
});

app.get("/api/admin/submissions", (_req, res) => {
  const submissions = getSubmissions().sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );

  const flaggedCount = submissions.filter((entry) => entry.flagged).length;
  const disqualifiedCount = submissions.filter((entry) => entry.disqualified).length;

  res.json({
    count: submissions.length,
    flaggedCount,
    disqualifiedCount,
    submissions,
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Quiz backend running on http://localhost:${PORT}`);
});
