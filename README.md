# Aswin Typing Monitor v5, Testing Edition

A testing-focused typing practice app designed to improve technical typing accuracy while reinforcing good automation-testing habits.

## What changed in v5

- All generic prose and unrelated programming drills were removed from the active exercise bank.
- The exercise bank now focuses only on:
  - Python automation and pytest
  - Selenium WebDriver
  - JMeter, JSR223/Groovy, correlation and CLI execution
  - Postman and Newman
  - Mixed testing workflows
  - Right-hand QA-focused drills using real testing syntax
- 144 curated testing exercises are included.
- Every exercise has an ID and a visible Learning Focus that explains the best-practice pattern being typed.
- Exercises rotate continuously during a timed session. Completing one code block automatically appends another, so practice does not stop after a short snippet.
- Levels are progressive:
  - Level 1: core patterns and clean syntax
  - Level 2: reusable testing techniques
  - Level 3: realistic automation tasks
  - Level 4: longer competition-style and multi-step patterns
- Session history records the starting exercise concept and completed code-block count.
- Right-hand versus left-hand error tracking remains enabled.
- Paste and drag-and-drop insertion remain blocked.
- Telegram notifications fail gracefully when credentials are not configured.

## Testing principles reinforced

Exercises intentionally model practices such as:

- explicit request timeouts
- pytest fixtures and parameterization
- environment-based configuration
- stable Selenium locators
- explicit waits instead of fixed sleeps
- Page Object methods
- failure screenshots
- JMeter non-GUI execution
- thread-local JMeter correlation
- unique test-data generation
- fail-fast assertions
- randomized JMeter pacing
- Postman correlation and schema validation
- expected negative tests such as HTTP 403
- Newman machine-readable reports

## Run locally

Requires Node.js 18 to 24.

```powershell
npm install
npm start
```

Open:

```text
http://localhost:8080
```

## Render

The project root contains `package.json`, so the following Render settings can be used:

```text
Build Command: npm install
Start Command: npm start
```

The server listens on `process.env.PORT` and `0.0.0.0`.

## Telegram

Do not put Telegram secrets in source code or GitHub.

Configure these environment variables locally or in Render:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

An `.env.example` file is included with variable names only.

## Session data

The current build preserves the existing storage design:

```text
data/sessions.json
```

This is persistent when the app is run on a normal local machine with a persistent disk.

Important: Render Free web-service filesystems are ephemeral. If this build is deployed to Render Free, `data/sessions.json` must not be treated as permanent storage. To retain centralized history across Render restarts and redeployments, migrate session storage to an external persistent database such as PostgreSQL.

## Scoring

- Accuracy contributes up to 70 points.
- Speed contributes up to 30 points only when accuracy is at least 95%.
- Default pass gate is 97% accuracy.
- Completing additional code blocks does not compensate for low accuracy.
