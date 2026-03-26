# Full-Stack Quiz Web Application

This repository contains a robust anti-cheat quiz platform built with:

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express

## Project Structure

- frontend/
- backend/

## Quick Start

### 1) Backend

- cd backend
- npm install
- npm run dev

Backend starts at http://localhost:4000

### 2) Frontend

Open a new terminal:

- cd frontend
- npm install
- copy .env.example .env
- npm run dev

Frontend starts at http://localhost:5173

## Core Capabilities

- MCQ quiz with randomized questions
- Global quiz timer with auto-submit on timeout
- Per-question timer (bonus)
- Anti-cheat detection:
  - tab switch
  - window blur / alt+tab
  - fullscreen exit
  - right-click attempt
  - copy shortcut (Ctrl/Cmd + C)
  - back navigation key
- Warning system:
  - 1st violation: warning modal
  - 2nd violation: final warning modal
  - 3rd violation: auto-submit + disqualification
- Backend validation:
  - validates submission payload
  - computes score server-side
  - stores cheat events and timestamps
  - flags suspicious speed and suspicious time mismatch

## Admin Endpoint

- GET /api/admin/submissions

This endpoint returns recorded submissions with score, cheat count, timestamps, and flagged/disqualified metadata.

## Persistence

- Submissions and sessions are stored in backend/data/quiz-db.json
- Data survives backend restarts

## Admin Dashboard UI

- Open the frontend start page and click "Open Admin Dashboard"
- It auto-refreshes every 15 seconds and shows flagged/disqualified trends
