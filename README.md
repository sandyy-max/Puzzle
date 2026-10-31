# Banana Brain

A small web game for CIS046-3 Software For Enterprise. You get a picture puzzle from the university Banana API, type the missing digit, and try to score before the timer runs out.

I built it as a normal website plus a Node server, not as a huge framework app. That was enough for version control, events, interoperability and login, which is what the video has to talk about.

Banana API docs: https://marcconrad.com/uob/banana/doc.php

## Run it

You need Node.js on your machine.

```powershell

copy .env.example .env
npm install
npm start
```

Then open http://localhost:3000

`npm test` runs the automated checks. For Postman, import `docs/postman/Banana-Brain.postman_collection.json`.

Copy `.env.example` to `.env` and leave the Banana URL as it is unless your tutor gives a different one. Do not commit `.env`.

## What you can do in the game

- Start as a guest, or register so scores are kept
- Pick Easy, Medium or Hard (timer and points change; the Banana API itself has no difficulty setting)
- Fetch a new puzzle, submit an answer, go to the next round, end the game
- See a leaderboard and your own history after you log in

## How the pieces fit

```
Browser  ->  Express on localhost:3000  ->  SQLite file
                                  \->  Banana API (puzzle image + solution)
```

The browser never sees the solution until after you submit. If it called the Banana API directly, you could cheat. That is why the server sits in the middle.

| Folder | What it is |
|---|---|
| `Client/` | Pages, CSS, JavaScript |
| `Server/` | Express, SQLite, Banana calls |
| `docs/` | Testing notes, evaluation, video plan |
| `.env` | Port, session secret, API URL (local only) |

## Database (short)

- `users` — username, email, password hash
- `games` — one finished (or in progress) run, score, difficulty
- `game_rounds` — each answer in that run

Passwords go through bcrypt. SQL uses placeholders, not string concatenation.

## HTTP routes worth knowing

Auth: `POST /api/auth/register`, `login`, `logout` · `GET /api/auth/me`, `profile`  
Game: `POST /api/game/begin`, `answer`, `end` · `GET /api/game/puzzle`, `leaderboard`, `history`

History only works when you are logged in. It always uses the user id from the session, not an id from the query string.

Write-ups:

- `docs/STEP_BY_STEP.md` — how it was built
- `docs/TESTING.md` — what I actually ran
- `docs/CRITICAL_EVALUATION.md` — why these tools, and what is weak
- `docs/ACKNOWLEDGEMENTS.md` — API, libraries, AI help

## Licence

MIT. Made with love by Sandhya.
