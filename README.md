# Aswin Typing Monitor, Render-ready

This version is ready to commit to GitHub and deploy as a Render Web Service.

## Render settings

- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`

The server listens on `process.env.PORT` and host `0.0.0.0`.

## Telegram environment variables

Add these in Render under Environment:

```text
TELEGRAM_BOT_TOKEN=your_real_bot_token
TELEGRAM_CHAT_ID=your_real_chat_id
```

Do not commit real Telegram credentials to GitHub. The included `.env.example` contains empty placeholders only.

Telegram is optional. If either environment variable is missing, the typing application continues to work and the UI reports that Telegram is not configured.

## Persistence

Render Free uses an ephemeral filesystem, so typing history is not written to the server filesystem.

The browser stores progress in `localStorage`, including:

- completed session history
- WPM history
- accuracy history
- right-hand and weak-key error statistics
- personal best WPM, accuracy and score
- practice streak data
- total practice time

This means the progress persists across page refreshes and Render restarts in the same browser profile. Clearing browser site data, changing browsers/devices, or using private browsing will not preserve that local progress.

## Local run

Requires Node.js 18 through 24.

```powershell
npm install
npm start
```

Then open:

```text
http://localhost:8080
```

## Files

```text
.
├── package.json
├── server.js
├── .gitignore
├── .env.example
├── README.md
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

## Existing features retained

The app retains its accuracy gate, no-paste mode, right-hand focus, technical typing modes, varied drill bank, tips, daily challenge, achievements, session history, mistake analysis, Telegram start/completion notifications, and trainer-oriented performance metrics.
