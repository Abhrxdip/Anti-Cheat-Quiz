import { useContext } from "react";
import { QuizContext } from "./quizContextObject";

export function useQuiz() {
  const value = useContext(QuizContext);
  if (!value) {
    throw new Error("useQuiz must be used inside QuizProvider");
  }
  return value;
}
