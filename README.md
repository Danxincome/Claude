# OddsOracle

AI-powered betting predictions.

## Setup

```bash
npm install
npm start
```

Open http://localhost:3000 to view the landing page.

## API

- `POST /api/waitlist` - Join the waitlist (body: `{"email": "..."}`)
- `GET /api/waitlist/count` - Get total waitlist signups
