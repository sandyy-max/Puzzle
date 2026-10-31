# Testing report

```powershell
cd d:\Level_6\SoE_Assignment\Puzzle
npm test
```

Postman: import `docs/postman/Banana-Brain.postman_collection.json` (base `http://localhost:3000`). Send login first so the cookie is stored.

## Automated cases (must be run with `npm test`)

| Case | Result recorded after last run |
|---|---|
| Health | Pass |
| Guest history 401 | Pass |
| Register + `/me` | Pass |
| Weak password 400 | Pass |
| Duplicate username 409 | Pass |
| Puzzle has image, no solution | Pass |
| Easy correct = +5 | Pass |
| Medium wrong = 0 | Pass |
| Non-integer answer 400 | Pass |
| Timeout = 0 | Pass |
| No active puzzle 400 | Pass |
| Hard correct + end saved | Pass |
| Player B cannot see A’s history | Pass |
| Leaderboard lists A | Pass |
| Logout then history 401 | Pass |
| Wrong password 401 | Pass |
| Banana API down 502 | Pass |
| Unknown difficulty → medium | Pass |

Scoring tests use a **mock** Banana API in `Server/tests/helpers.js`. Live Banana API was checked in development.

## Manual

1. http://localhost:3000 — Rules, Tips, Easy/Medium/Hard cards, MIT footer.
2. Start a game, submit a number, next puzzle, end game.
3. Register, finish a game, profile history, leaderboard.
4. Log out; Play still works as guest.
