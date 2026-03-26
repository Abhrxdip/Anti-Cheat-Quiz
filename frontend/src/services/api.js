const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://backend-for-quiz-mvji.onrender.com";
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

async function request(path, options = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error(`Unable to reach backend at ${API_BASE_URL}. Check VITE_API_BASE_URL.`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export function startQuiz(name) {
  return request("/api/quiz/start", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function reportViolation(payload) {
  return request("/api/quiz/violation", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function submitQuiz(payload) {
  return request("/api/quiz/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAdminSubmissions() {
  return request("/api/admin/submissions", {
    method: "GET",
  });
}

export function getHealth() {
  return request("/api/health", {
    method: "GET",
  });
}

export function getServerInfo() {
  return request("/", {
    method: "GET",
  });
}
