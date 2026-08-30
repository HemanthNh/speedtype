
# Aswin Typing Accuracy Monitor v2

## Improvements in v2

- Telegram notification on practice start
- Telegram notification on session completion
- Built-in Telegram test button
- 97% accuracy gate
- Accuracy-first scoring
- Four practice modes
- Four difficulty levels
- Technical commands, SQL, JSON, code and API text
- Live WPM, accuracy, errors and score
- Mistake-category breakdown
- Daily practice minutes
- Average accuracy
- Best WPM
- Practice streak
- PASS / REPEAT result
- Persistent local session history

## Run

Requires Node.js 18 or newer.

```powershell
cd aswin_typing_monitor_v2
node server.js
```

Open:

```text
http://localhost:8080
```

For another machine on the same LAN:

```text
http://YOUR-PC-IP:8080
```

You may need to allow Node.js through Windows Firewall.

## Telegram

This build contains temporary default Telegram values in `server.js` for testing.

Search for:

```javascript
const DEFAULT_TELEGRAM_TOKEN = "...";
const DEFAULT_TELEGRAM_CHAT_ID = "...";
```

Replace them before regular use.

A better long-term method is environment variables:

```powershell
$env:TELEGRAM_BOT_TOKEN="YOUR_REAL_TOKEN"
$env:TELEGRAM_CHAT_ID="YOUR_CHAT_ID"
node server.js
```

Environment variables override the defaults.

## Data

Sessions are stored in:

```text
data/sessions.json
```

## Scoring

Accuracy contributes up to 70 points.
Speed contributes up to 30 points, but only when accuracy is at least 95%.

A session passes only when the configured accuracy gate is reached.
Default gate: 97%.


## v3 additions

- Paste is blocked in the typing area
- Drag-and-drop text insertion is blocked
- Paste attempts are counted in session history
- Dedicated Right Hand Focus mode
- Dedicated Right Hand Symbols mode
- Mixed Technical mode
- Larger randomized drill bank
- Right-hand vs left-hand error tracking
- Right-hand error share shown live
- Session history includes right-hand error counts

### Right-hand keys emphasized

The right-hand focused drills emphasize:

```text
Y U I O P
H J K L
N M
[ ] { } ; : ' " , . / ?
7 8 9 0 - _ = +
```

This is intentional because the current training goal is to reduce right-hand typing errors.


## v4 additions

- Much larger randomized drill bank
- More variation within every mode and level
- Rotating typing tips
- Today's challenge section
- Achievement system
- Personal progress is emphasized over generic typing benchmarks
- Technical content includes CLI, SQL, JSON, APIs, Git, Docker, JMeter, Python, npm and Postman-style assertions
- Right-hand-focused variation remains heavily represented

Current drill count: 223 individual prompts.
Current typing tips: 20.
