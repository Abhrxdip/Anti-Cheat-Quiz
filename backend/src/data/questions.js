const QUESTION_BANK = [
  {
    id: "q1",
    text: "What is the time complexity of binary search on a sorted array?",
    options: [
      { id: "a", text: "O(n)" },
      { id: "b", text: "O(log n)" },
      { id: "c", text: "O(n log n)" },
      { id: "d", text: "O(1)" },
    ],
    correctOptionId: "b",
  },
  {
    id: "q2",
    text: "Which HTTP method is idempotent by definition?",
    options: [
      { id: "a", text: "POST" },
      { id: "b", text: "PATCH" },
      { id: "c", text: "GET" },
      { id: "d", text: "CONNECT" },
    ],
    correctOptionId: "c",
  },
  {
    id: "q3",
    text: "In JavaScript, which value is strictly equal to itself?",
    options: [
      { id: "a", text: "NaN" },
      { id: "b", text: "undefined" },
      { id: "c", text: "null" },
      { id: "d", text: "Infinity" },
    ],
    correctOptionId: "d",
  },
  {
    id: "q4",
    text: "Which database index type is best for range queries in most relational engines?",
    options: [
      { id: "a", text: "Hash index" },
      { id: "b", text: "B-Tree index" },
      { id: "c", text: "Bitmap index" },
      { id: "d", text: "GIN index" },
    ],
    correctOptionId: "b",
  },
  {
    id: "q5",
    text: "What does CORS protect against by default?",
    options: [
      { id: "a", text: "SQL injection" },
      { id: "b", text: "Cross-origin read/write from browsers" },
      { id: "c", text: "DDoS" },
      { id: "d", text: "Clickjacking" },
    ],
    correctOptionId: "b",
  },
  {
    id: "q6",
    text: "Which React hook is best suited for sharing state globally in small apps?",
    options: [
      { id: "a", text: "useRef" },
      { id: "b", text: "useMemo" },
      { id: "c", text: "useContext" },
      { id: "d", text: "useId" },
    ],
    correctOptionId: "c",
  },
  {
    id: "q7",
    text: "What is the default port for HTTPS?",
    options: [
      { id: "a", text: "80" },
      { id: "b", text: "443" },
      { id: "c", text: "21" },
      { id: "d", text: "25" },
    ],
    correctOptionId: "b",
  },
  {
    id: "q8",
    text: "Which one is a symmetric encryption algorithm?",
    options: [
      { id: "a", text: "RSA" },
      { id: "b", text: "ECC" },
      { id: "c", text: "AES" },
      { id: "d", text: "DSA" },
    ],
    correctOptionId: "c",
  },
  {
    id: "q9",
    text: "Which command initializes a new git repository?",
    options: [
      { id: "a", text: "git clone" },
      { id: "b", text: "git init" },
      { id: "c", text: "git start" },
      { id: "d", text: "git create" },
    ],
    correctOptionId: "b",
  },
  {
    id: "q10",
    text: "What does JSON stand for?",
    options: [
      { id: "a", text: "JavaScript Object Notation" },
      { id: "b", text: "Java Standard Output Network" },
      { id: "c", text: "Just Structured Object Notation" },
      { id: "d", text: "Java Serialized Object Notation" },
    ],
    correctOptionId: "a",
  },
];

module.exports = {
  QUESTION_BANK,
};
