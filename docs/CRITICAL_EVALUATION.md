# Critical evaluation

CIS046-3 — supporting notes for the video. This is appraisal, not a feature list.

## Why this stack

| Choice | Why | Alternative | Trade-off |
|---|---|---|---|
| HTML / CSS / JS | Matches the module examples; enough for events and HTTP | React | Extra build step, weaker “I wrote this” story for a 10-minute video |
| Express | Small REST layer, easy sessions, industry-common | PHP / Java | PHP would match some lab demos; Node keeps one language front and back |
| SQLite | Zero server, file on disk, fine for one assignment | MySQL / MongoDB | SQLite is not multi-server; that is acceptable here |
| bcrypt + sessions | Fits Week 5 (auth and cookies) | JWT / Firebase | JWT is stateless; cookies + regenerate() better show virtual identity |
| Backend Banana proxy | API returns the solution | Call API from the browser | Browser call would leak answers and skip error handling on the server |

## Interoperability

The Banana API is a third-party HTTP JSON service (`question` + `solution`). We did not invent difficulty or API keys — docs do not provide them.

Limits we actually hit:

- The API is **HTTP**, not HTTPS.
- It can be slow or down; tests mock it, live fetch was checked once in development.
- Image URLs point at another host (`sanfoh.com`).

That is a fair industry point: you do not control the remote contract.

## Event-driven design

The client is event-driven (`click`, `submit`, `setInterval`, `fetch` callbacks). The server is request/response, not a message bus. That is enough for the learning outcome. A socket server would be overkill.

## Virtual identity

Identity is a username + hashed password + HttpOnly cookie. Strengths: regenerate-on-login, history scoped to `session.userId`, no password stored in plain text. Weaknesses: sessions live in memory (lost on restart), no email verify, no rate limit on login. Those are honest limits for a student app.

## Security review (this step)

Checked in code and tests:

- `.env` is gitignored; secrets are not in Client JS.
- SQL is parameterised.
- History is 401 for guests; player B cannot see player A.
- Puzzle GET never includes `solution`.
- Weak passwords and duplicate usernames rejected.
- Banana failures return 502, not a stack dump (in production `NODE_ENV`).

Still open: in-memory sessions, HTTP Banana API, no CSRF token (SameSite=lax mitigates some CSRF on this same-origin app).

## Testing results (executed)

`npm test` is the source of truth. Cases include health, register/login/logout, weak password, duplicate username, puzzle without solution, correct/incorrect/timeout scoring, owner-only history, leaderboard, Banana API down → 502, answer with no puzzle → 400.

Banana API in automated tests is **mocked** so scores are deterministic. Live API was used earlier (real PNG URL; solution withheld on `/puzzle`).

## What I would change next

1. Store sessions in SQLite so a restart does not log everyone out.
2. HTTPS proxy or cache if the Banana host offered it.
3. Rate-limit login.
4. Keep the UI this simple for the video — complexity will not raise the mark.

## Acknowledgements

Banana API: Marc Conrad. Libraries: Express, better-sqlite3, bcryptjs, helmet, express-session. Cursor AI used for scaffolding; Banana payload checked against official docs.
