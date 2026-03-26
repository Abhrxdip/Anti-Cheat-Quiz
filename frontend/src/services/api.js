const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
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
