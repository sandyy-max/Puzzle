# Banana Brain

CIS046-3 Software For Enterprise — Banana API puzzle game.

## Run

```powershell
cd d:\Level_6\SoE_Assignment\Puzzle
copy .env.example .env
npm install
npm start
```

Open http://localhost:3000

Docs: [step by step](docs/STEP_BY_STEP.md) · [testing](docs/TESTING.md) · [critical evaluation](docs/CRITICAL_EVALUATION.md)

## Features

- Banana API puzzles (solution stays on the server)
- Easy / Medium / Hard timers
- Register, login, logout, profile
- Leaderboard and personal game history
- Guest play (scores save only when logged in)

## Stack

HTML / CSS / JS · Express · SQLite · [Banana API](https://marcconrad.com/uob/banana/doc.php)
