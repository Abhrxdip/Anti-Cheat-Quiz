function isValidName(name) {
  return typeof name === "string" && name.trim().length >= 2 && name.trim().length <= 40;
}

function isValidViolationType(value) {
  const allowed = new Set([
    "tab_switch",
    "window_blur",
    "fullscreen_exit",
    "right_click",
    "copy_attempt",
    "back_navigation",
    "before_unload",
  ]);
  return allowed.has(value);
}

function normalizeAnswerMap(answers) {
  if (!Array.isArray(answers)) {
    return null;
  }

  const answerMap = new Map();
  for (const answer of answers) {
    if (
      !answer ||
      typeof answer.questionId !== "string" ||
      typeof answer.optionId !== "string"
    ) {
      return null;
    }

    answerMap.set(answer.questionId, answer.optionId);
  }

  return answerMap;
}

module.exports = {
  isValidName,
  isValidViolationType,
  normalizeAnswerMap,
};
