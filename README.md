# Aswin Typing Monitor v5.5

A testing-focused typing practice app for learning good automation-testing patterns while improving technical typing accuracy and speed.

## Practice bank

The app contains 144 curated testing exercises, 24 exercises per mode and 6 exercises per level.

Modes:

- Python Automation
- Selenium
- JMeter
- Postman
- Mixed Testing
- Right-Hand QA Focus

Each mode has four progressive levels. Every exercise has a unique ID and a visible learning focus. The content reinforces practices such as pytest fixtures and parameterization, explicit request timeouts, stable Selenium locators, explicit waits, Page Objects, screenshots, JMeter correlation and JSR223/Groovy, randomized pacing, non-GUI JMeter execution, Postman assertions and correlation, Newman reporting, expected negative tests, environment-based configuration and unique test data.

## Code-friendly editor workspace, v5.5

The practice surface now behaves like a lightweight coding editor rather than a plain textarea.

Features:

- side-by-side reference code and typing editor on desktop, stacked cleanly on smaller screens
- IDE-style dark code panes with monospace fonts
- line-number gutters for both reference and typed code
- non-wrapping code lines with horizontal scrolling
- synchronized reference scrolling while the learner types
- live line and column position
- live exact/mismatch status
- `Tab` stays inside the editor and inserts spaces to the next four-space tab stop
- `Shift + Tab` unindents the current line
- selected multi-line code can be indented or unindented with `Tab` and `Shift + Tab`
- visible `Spaces: 4`, `UTF-8` and Tab-enabled editor status
- reference file labels adapt to the selected testing domain

The exercise bank itself continues to use spaces for indentation. Pressing Tab therefore produces the exact indentation expected by Python, Selenium, JMeter/Groovy and Postman exercises without inserting literal tab characters.

### Responsive window and line-width handling

The practice card is no longer constrained by the narrower dashboard width. It can use up to 1700 px of the browser window.

- At browser widths up to 1540 px, **Auto layout stacks the reference and typing editors vertically** so each editor gets almost the full window width. This is intended for common 1366 px and 1440 px laptops.
- On larger desktop windows, Auto layout uses the two editors side by side.
- **Layout: Auto / Stacked / Side by side** can be cycled manually and the choice is remembered in browser progress settings.
- **Focus editor** temporarily expands the practice card over the application, similar to an IDE-focused workspace. Escape exits Focus mode.
- Editor heights scale with the viewport, with a larger typing pane in stacked laptop mode.
- The reference status bar reports the current maximum source-line width and warns if future content exceeds 100 characters.

The complete 144-exercise bank was audited for line length. **No exercise line is now longer than 88 characters.** Long JMeter and Newman commands are formatted as readable Windows PowerShell multi-line commands using the PowerShell continuation character. Long Selenium, Python, Postman and Groovy statements are broken at language-appropriate boundaries rather than visually soft-wrapped.

## v5.2+ progress system

The app now behaves as a learning progression system rather than a random typing drill.

### Overall progress

The dashboard shows:

- overall mastery across all 144 exercises
- core technical mastery across Python Automation, Selenium, JMeter and Postman only, 96 exercises
- completed levels
- repeat queue size
- weekly practice time
- per-domain progress cards
- per-level completion indicators

Mixed Testing and Right-Hand QA Focus remain part of overall progress, but do not inflate the core technical-readiness percentage.

### Dropdown status

The Practice Mode dropdown shows one of:

- `COMPLETE`
- `IN PROGRESS x/24`
- `NOT STARTED`

The Level dropdown shows one of:

- `COMPLETE`
- `x/6`
- `NOT STARTED`

### Mastery and next-step logic

Exercise states are tracked as:

- `NOT STARTED`
- `IN PROGRESS`
- `REPEAT`
- `MASTERED`

A code block counts toward mastery only when the session meets the 97% accuracy gate and at least one full block is completed.

Normal progression does not select mastered exercises again. Failed, interrupted or incomplete work is prioritized before new material. The Continue Recommended button points to the most useful next activity.

Revision Mode can be enabled explicitly when mastered material should be practised again. Revision attempts never remove existing mastery.

### Saved scores and attempts

The browser stores:

- last activity
- completion status
- previous session scores
- WPM and accuracy
- attempt counts
- per-exercise attempt history
- best score
- best accuracy
- best valid WPM
- mastery time
- recent sessions
- repeat status

The v5.1 local progress ledger is automatically migrated into v5.2 when present.

## Performance and learning analytics

v5.2 includes:

- accuracy trend for recent scored sessions
- WPM trend for recent scored sessions
- technology-specific average accuracy
- technology-specific best accuracy
- technology-specific average valid WPM
- technology-specific best valid WPM
- weekly practice time
- weekly session count
- exercises mastered during the rolling seven-day window
- weekly average accuracy
- valid WPM movement during the week
- mistake heatmap by expected key
- right-hand versus left-hand error history
- technical-symbol accuracy
- weak-area recommendation
- recently mastered exercises
- repeat queue
- milestones and achievements
- best-practice recap after a session
- automatic session notes

Interrupted and zero-block attempts remain visible in history and diagnostics, but do not distort headline accuracy or speed trends.

## WPM formula

WPM now uses the standard typing formula, which is more suitable for code than counting whitespace-delimited words:

```text
WPM = characters typed / 5 / minutes
```

Best WPM only counts a run when:

- accuracy meets the session accuracy gate, and
- at least one full code block was completed.

A very fast low-accuracy attempt cannot become the personal best.

## Session completion status

Sessions are stored as one of:

- `PASS`
- `REPEAT`
- `INCOMPLETE`
- `INTERRUPTED`

Resetting or closing an active session records it as interrupted instead of silently losing the activity.

## Reliability and offline behavior

The browser is the primary continuity layer for progress. Session results are saved locally before server synchronization is attempted.

If the server or network is temporarily unavailable:

- the typing session can continue
- completion is saved in browser localStorage
- the session is marked for later synchronization
- the app does not crash

Client-generated UUID session IDs and idempotent server APIs prevent duplicate session creation and duplicate completion updates.

If the Render session file is lost because of an ephemeral filesystem, a browser that still has the local history can restore missing completed sessions back into the server session file without re-sending old Telegram completion notifications.

Important: this improves resilience, but browser localStorage is still not a substitute for a permanent centralized database. If history must survive loss of the browser itself and must be guaranteed across devices, use an external persistent database such as PostgreSQL or Supabase.

## Local storage

Current progress key:

```text
aswinTypingProgressV3
```

The browser keeps up to 250 recent session records and a per-exercise progress ledger.

## Telegram coaching reports, v5.3+

Telegram credentials are never hardcoded in source code. Telegram failures are handled gracefully and never stop typing practice.

Configure these environment variables:

```text
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
REPORT_TIME_ZONE=Asia/Kolkata
```

`REPORT_TIME_ZONE` is optional and defaults to `Asia/Kolkata`.

Telegram now sends three notification types:

1. **Session started**, with the selected mode/level/exercise plus current level, domain, core and overall progress.
2. **Session completed/interrupted**, with a detailed coaching report containing WPM, accuracy, score, errors, completed blocks, level/domain/core/overall progress, newly mastered and repeat-required exercises, technical-symbol accuracy, right-hand/left-hand errors, top mistyped keys, technology-specific performance, personal bests, recent accuracy/WPM trend, daily target, streak, rolling seven-day progress, weak-area guidance, session note and recommended next task.
3. **Milestone achieved**, sent only when a new milestone, level completion or domain completion is reached.

Telegram reports are clamped below Telegram's message-size limit. Restoring old local sessions to an empty Render filesystem does not re-send historical Telegram notifications. Idempotent completion handling also prevents a retry of the same completed session from generating a duplicate report.

## Run locally

Requires Node.js 18 through 24.

```powershell
npm install
npm start
```

Open:

```text
http://localhost:8080
```

## Deploy to Render

Use the repository root containing `package.json` and `server.js`.

Render settings:

```text
Build Command: npm install
Start Command: npm start
```

The server listens on:

```text
process.env.PORT
0.0.0.0
```

Add the Telegram values under the Render Web Service environment-variable settings. Do not commit actual secrets to GitHub.

## Automated checks

Run:

```text
npm run check
npm test
```

The test suite covers:

- Telegram start-progress report content
- detailed Telegram completion-report content
- milestone-only notification behavior
- Telegram message-length clamping
- code-editor Tab and Shift+Tab behavior
- multi-line indent and unindent behavior
- line and column tracking
- code-editor DOM affordances and non-wrapping input
- all 144 exercise lines at 88 characters or fewer
- responsive wide/stacked/side-by-side editor layout controls
- Focus Editor entry and exit behavior
- long-line status indicator

- JavaScript syntax
- 144-exercise bank structure and unique IDs
- five-character WPM calculation
- accuracy and technical-symbol diagnostics
- accuracy-valid personal-best WPM
- core versus overall progress calculation
- browser-style progression and reload persistence
- completed-level exclusion from normal practice
- Revision Mode
- corrupted localStorage recovery
- start/reset race handling
- idempotent session start and completion
- server-side interrupted-session handling
- restoration of locally preserved sessions into an empty server session store
- duplicate HTML IDs
- DOM ID consistency
- script loading order
- Render start configuration
- Telegram secret handling

## Render Free storage note

`data/sessions.json` remains a secondary server-side session copy. Render Free filesystems are ephemeral, so this file is not guaranteed permanent. v5.2 protects same-browser continuity through localStorage and can rehydrate an empty server file from that browser's saved history. A persistent external database is still required for guaranteed centralized, cross-device retention.


## v5.6 heatmap and data-safety note

- Mistake heatmap now uses an accessible orange-to-red severity scale. High and critical cells use white text for contrast.
- The browser progress key remains `aswinTypingProgressV3`, so deploying this update to the same Render service URL does not reset browser progress.
- Do not intentionally clear browser site data during an update. Browser localStorage is currently the resilient copy used to restore progress when the Render Free filesystem is reset.
- Render Free `data/sessions.json` remains ephemeral. For guaranteed cross-device and long-term server-side retention, move session storage to a persistent database.
