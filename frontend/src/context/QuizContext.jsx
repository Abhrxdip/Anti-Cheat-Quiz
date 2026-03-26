import { useCallback, useMemo, useState } from "react";
import { reportViolation, startQuiz, submitQuiz } from "../services/api";
import { QuizContext } from "./quizContextObject";

export function QuizProvider({ children }) {
  const [status, setStatus] = useState("idle");
  const [sessionToken, setSessionToken] = useState("");
  const [name, setName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [startedAt, setStartedAt] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [cheatCount, setCheatCount] = useState(0);
  const [warningLevel, setWarningLevel] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const bootQuiz = useCallback(async (userName) => {
    setError("");
    const payload = await startQuiz(userName);
    setSessionToken(payload.sessionToken);
    setName(userName);
    setQuestions(payload.questions);
    setStartedAt(payload.startedAt);
    setDurationSeconds(payload.durationSeconds);
    setAnswers({});
    setCheatCount(0);
    setWarningLevel(0);
    setWarningMessage("");
    setResult(null);
    setStatus("in_progress");
  }, []);

  const answerQuestion = useCallback((questionId, optionId) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  }, []);

  const closeWarning = useCallback(() => {
    setWarningMessage("");
  }, []);

  const finishQuiz = useCallback(
    async ({ forced = false, reason = "" } = {}) => {
      if (status !== "in_progress") {
        return;
      }

      try {
        const answerList = questions.map((question) => ({
          questionId: question.id,
          optionId: answers[question.id] || "",
        }));

        const nowSeconds = startedAt ? Math.max(1, Math.floor((Date.now() - startedAt) / 1000)) : 1;

        const payload = await submitQuiz({
          sessionToken,
          answers: answerList,
          clientDurationSeconds: nowSeconds,
          reason: forced ? reason || "Auto-submitted by anti-cheat system." : reason || "normal_submission",
        });

        setResult(payload);
        setStatus(payload.disqualified ? "disqualified" : "submitted");
      } catch (err) {
        setError(err.message || "Submission failed");
      }
    },
    [answers, questions, sessionToken, startedAt, status],
  );

  const recordViolation = useCallback(
    async (type) => {
      if (status !== "in_progress" || !sessionToken) {
        return;
      }

      try {
        const payload = await reportViolation({
          sessionToken,
          type,
          clientTimestamp: Date.now(),
        });

        setCheatCount(payload.cheatCount);

        if (payload.cheatCount === 1) {
          setWarningLevel(1);
          setWarningMessage("Warning: suspicious behavior detected. Stay focused on the quiz.");
        }

        if (payload.cheatCount === 2) {
          setWarningLevel(2);
          setWarningMessage("Final warning: one more violation will disqualify this attempt.");
        }

        if (payload.disqualified || payload.cheatCount >= 3) {
          await finishQuiz({ forced: true, reason: "Disqualified after repeated anti-cheat violations." });
        }
      } catch (err) {
        setError(err.message || "Unable to process anti-cheat event.");
      }
    },
    [finishQuiz, sessionToken, status],
  );

  const contextValue = useMemo(
    () => ({
      status,
      name,
      questions,
      answers,
      durationSeconds,
      startedAt,
      cheatCount,
      warningLevel,
      warningMessage,
      result,
      error,
      bootQuiz,
      answerQuestion,
      recordViolation,
      closeWarning,
      finishQuiz,
      setError,
    }),
    [
      answerQuestion,
      bootQuiz,
      cheatCount,
      closeWarning,
      durationSeconds,
      error,
      finishQuiz,
      name,
      questions,
      recordViolation,
      result,
      startedAt,
      status,
      warningLevel,
      warningMessage,
      answers,
    ],
  );

  return <QuizContext.Provider value={contextValue}>{children}</QuizContext.Provider>;
}
