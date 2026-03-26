import { useState } from "react";
import { QuizProvider } from "./context/QuizContext";
import { useQuiz } from "./context/useQuiz";
import StartScreen from "./components/StartScreen";
import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";
import DisqualifiedScreen from "./components/DisqualifiedScreen";
import AdminDashboard from "./components/AdminDashboard";

const ADMIN_PASSWORD = "abhradip69";

function AppBody() {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("quiz");
  const [adminError, setAdminError] = useState("");
  const { status, result, bootQuiz, setError, error } = useQuiz();

  const handleStart = async (name) => {
    try {
      setLoading(true);
      await bootQuiz(name);
    } catch (error) {
      setError(error.message || "Unable to start quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdmin = (password) => {
    if (password !== ADMIN_PASSWORD) {
      setAdminError("Access denied. MAKA LADLE MEOW GOP GOP");
      return;
    }

    setAdminError("");
    setView("admin");
  };

  if (status === "in_progress") {
    return <QuizScreen />;
  }

  if (status === "disqualified") {
    return <DisqualifiedScreen result={result} />;
  }

  if (status === "submitted" && result) {
    return <ResultScreen result={result} onRestart={() => window.location.reload()} />;
  }

  if (view === "admin") {
    return <AdminDashboard onBack={() => setView("quiz")} />;
  }

  return (
    <StartScreen
      loading={loading}
      error={error}
      onStart={handleStart}
      onOpenAdmin={handleOpenAdmin}
      adminError={adminError}
    />
  );
}

function App() {
  return (
    <QuizProvider>
      <AppBody />
    </QuizProvider>
  );
}

export default App;
