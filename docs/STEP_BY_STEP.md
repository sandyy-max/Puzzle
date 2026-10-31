# Banana Brain — Step-by-step documentation

CIS046-3 Software For Enterprise. Supporting material for the 10-minute video (not marked on its own).

## 1. What the system is

Banana Brain is a browser puzzle game.

1. The player opens the site.
2. The Express server asks the official Banana API for a puzzle image.
3. The player types the missing digit before the timer ends.
4. The server checks the answer (the solution never goes to the browser first).
5. Logged-in players keep scores, history, and a place on the leaderboard.

Official API: https://marcconrad.com/uob/banana/doc.php  
The API has **no difficulty parameter** and **no API key**. Difficulty is local (timer + points).

## 2. How to run

```powershell
cd d:\Level_6\SoE_Assignment\Puzzle
copy .env.example .env
npm install
npm start
```

Open http://localhost:3000

Stop the server with `Ctrl+C`.

Tests:

```powershell
npm test
```

## 3. Colour palette (one swatch only)

Taken from the supplied five-colour strip:

| Token | Hex | Use |
|---|---|---|
| Olive | `#C5B358` | Level chips, brand mix |
| Taupe | `#998E6C` | Borders, muted lines |
| Sun yellow | `#FFC34D` | Primary buttons, brand mark |
| Sky | `#92DFF3` | Stats, timer, hover |
| Teal | `#5BC2C1` | Secondary buttons, nav chip |

Background cream `#F7F3E4` is a light mix so text stays readable. No extra accent colours.

## 4. Folder map

```
Puzzle/
  Client/                 Frontend (HTML, CSS, JS)
    index.html            Play screen
    pages/                Login, register, profile, leaderboard
    css/                  One palette, shared layout
    js/                   api, auth, game, leaderboard, ui
  Server/
    server.js             Process entry
    src/app.js            Express wiring
    src/config/           Env + SQLite
    src/routes/           HTTP paths
    src/controllers/      Request handlers
    src/services/         Banana API + game + auth rules
    src/models/           Parameterised SQL
    src/middleware/       Auth gate + errors
    src/utils/            Difficulty + validators
    tests/                Node test runner
  .env                    Secrets (not committed)
  .env.example            Placeholders
  docs/STEP_BY_STEP.md    This file
```

## 5. Architecture

```
Browser (Client)
    HTTP + JSON + cookie session
Express (Server)
    ├── SQLite  users, games, game_rounds
    └── Banana API  { question, solution }
```

| Part | Job |
|---|---|
| Client | Events, UI, timers. Never stores passwords or solutions. |
| Express | Auth, scoring, proxy to Banana API, access control. |
| SQLite | Users and finished games. File is gitignored. |
| Banana API | Random picture puzzle + numeric solution. |

Why a backend proxy: the API returns the **solution**. If the browser called it directly, players could cheat. HTTP (not HTTPS) on the API is a known limitation.

## 6. Database

`users(id, username, email, password_hash, created_at)`  
`games(id, user_id, difficulty, score, rounds_played, rounds_correct, started_at, finished_at)`  
`game_rounds(id, game_id, was_correct, points, player_answer, answered_at)`

- Passwords: bcrypt hash only.
- Queries: parameterised (`?` / `@name`) — no string-built SQL.
- History: `WHERE user_id = ?` using the session user, not a client-supplied id.
- Leaderboard: finished games (`finished_at IS NOT NULL`) joined to `users`.

## 7. HTTP API

| Method | Path | Who | What |
|---|---|---|---|
| GET | `/api/health` | anyone | Server alive |
| POST | `/api/auth/register` | anyone | Create user, start session |
| POST | `/api/auth/login` | anyone | Check password, start session |
| POST | `/api/auth/logout` | session | Destroy cookie |
| GET | `/api/auth/me` | anyone | Current user or `null` |
| GET | `/api/auth/profile` | logged in | Stats for that user |
| POST | `/api/game/begin` | session | New game + difficulty |
| GET | `/api/game/puzzle` | session | Fetch Banana puzzle |
| POST | `/api/game/answer` | session | Check answer / timeout |
| POST | `/api/game/end` | session | Finish game, save if logged in |
| GET | `/api/game/stats` | session | Live score |
| GET | `/api/game/leaderboard` | anyone | Top finished scores |
| GET | `/api/game/history` | logged in | That player’s games only |

Puzzle JSON to the browser: `{ question, timeLimitSec, stats }` — **no `solution`**.  
After submit: `{ correct, solution, pointsAwarded, stats }`.

## 8. Difficulty (app-side)

Banana API does not support levels.

| Level | Time | Points if correct |
|---|---|---|
| Easy | 45s | 5 |
| Medium | 30s | 10 |
| Hard | 20s | 15 |

Server also rejects late answers (timer + elapsed time).

## 9. Virtual identity

1. Register validates username / email / password.
2. Password hashed with bcrypt (10 rounds).
3. `req.session.regenerate` after login/register (stops session fixation).
4. Cookie `banana.sid`: HttpOnly, SameSite=lax.
5. Logout destroys the session and clears the cookie.
6. Profile and history require `requireAuth`.

Guests can play. Their run is not stored on the leaderboard until they log in and finish a game.

## 10. Event-driven client

| Event | Handler |
|---|---|
| `DOMContentLoaded` | Draw nav, bind buttons |
| Click Start game | `begin` then `puzzle` |
| Submit form | POST answer |
| Timer tick (`setInterval`) | Countdown; at 0 POST `timedOut: true` |
| Click Next / End | New round or finish game |
| Auth form submit | Register or login then redirect |

State updates after every response: score pills, feedback, puzzle image, timer.

## 11. Interoperability

- Client ↔ Server: `fetch` + JSON + cookie.
- Server ↔ Banana API: `GET .../api.php?out=json&base64=no`.
- Image URL from `question` is shown in `<img>`.
- Failures: timeout, bad JSON, HTTP errors → `{ ok: false, error }` to the UI.

## 12. Security choices

- Secrets in `.env`, not in frontend JS.
- Helmet, JSON size limit 32kb.
- Server-side validation of answers and auth fields.
- No client-supplied user id for history.
- Solution held in session until after submit.

Limits: Banana API is HTTP; sessions are in memory (lost on server restart); no email verification.

## 13. Play the system (manual)

1. Open http://localhost:3000 — cream / yellow / teal UI.
2. Register a user.
3. Choose Medium → Start game → puzzle image loads, timer runs.
4. Enter a number → Check. Feedback + score update.
5. Next puzzle a few times → End game.
6. Leaderboard shows the finished score.
7. Profile shows history for **that** account only.
8. Log out. History API returns 401 without the cookie.

## 14. Mapping to the four video themes

| Theme | Where to show |
|---|---|
| Version control | Git history (when you resume Git) |
| Interoperability | `bananaApi.service.js` + Network tab JSON |
| Event-driven | `game.js` listeners and timer |
| Virtual identity | Register/login, cookie, hashed password, profile |

## 15. Acknowledgements

- Banana API and sample game: Marc Conrad, University of Bedfordshire.  
- Express, better-sqlite3, bcryptjs, helmet, express-session: their authors.  
- Layout and comments: student work with Cursor AI assistance; Banana request/response checked against official docs, not invented.
