const fs = require("fs");
const path = require("path");

const DB_DIR = path.resolve(__dirname, "../../data");
const DB_FILE = path.join(DB_DIR, "quiz-db.json");

function ensureStorage() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      sessions: {},
      submissions: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
  }
}

function loadState() {
  ensureStorage();
  try {
    const content = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(content);
    return {
      sessions: parsed.sessions || {},
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
    };
  } catch {
    return {
      sessions: {},
      submissions: [],
    };
  }
}

const state = loadState();
const sessions = new Map(Object.entries(state.sessions));
const submissions = [...state.submissions];

function persist() {
  const serializable = {
    sessions: Object.fromEntries(sessions.entries()),
    submissions,
  };

  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(serializable, null, 2), "utf8");
  fs.renameSync(tmpFile, DB_FILE);
}

function addSession(session) {
  sessions.set(session.sessionToken, session);
  persist();
}

function getSession(sessionToken) {
  return sessions.get(sessionToken);
}

function updateSession(sessionToken, updater) {
  const existing = sessions.get(sessionToken);
  if (!existing) {
    return null;
  }

  const next = updater(existing);
  sessions.set(sessionToken, next);
  persist();
  return next;
}

function addSubmission(submission) {
  submissions.push(submission);
  persist();
}

function getSubmissions() {
  return [...submissions];
}

module.exports = {
  addSession,
  getSession,
  updateSession,
  addSubmission,
  getSubmissions,
};
