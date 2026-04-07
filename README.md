# Beyond — Senior Growth Marketer Assessment App

Next.js + Supabase + Vercel

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase schema

Go to your Supabase project → SQL Editor → run the contents of `supabase-schema.sql`.

### 3. Environment variables

The `.env.local` file is already populated with your credentials. For Vercel deployment, add these same variables in:
**Vercel Dashboard → Project → Settings → Environment Variables**

```
NEXT_PUBLIC_SUPABASE_URL=https://gdlewpxdzoqxtsnatvdp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_PASSWORD=sd15AZs4Jw7Wm86b2
```

### 4. Run locally

```bash
npm run dev
```

App runs at http://localhost:3000

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo in the Vercel dashboard and it will deploy automatically on push.

---

## App Routes

| Route | Description |
|---|---|
| `/` | Candidate entry (name + email) |
| `/dashboard` | Candidate task dashboard |
| `/task/1` `/task/2` `/task/3` | Individual task pages (split view: brief + response) |
| `/submit` | Submission confirmation |
| `/admin` | Admin login |
| `/admin/submissions` | All submissions list + CSV export |
| `/admin/[id]` | Submission detail + scoring rubric |

---

## Admin Panel

- URL: `/admin`
- Password: `sd15AZs4Jw7Wm86b2`
- The submissions list shows all candidates, task completion, scores, and DQ flags
- Click Review on any submitted candidate to score their work
- Scores auto-calculate from 13 rubric dimensions (max 40)
- DQ flags are tracked separately and surface prominently
- Export CSV from the submissions list for panel distribution

---

## Candidate Experience

1. Candidate enters name + email at `/`
2. If returning, they pick up where they left off (same email)
3. Dashboard shows 3 task cards with status indicators
4. Each task opens a split-screen view: brief context on the left, response fields on the right
5. Work auto-saves every 1.5 seconds
6. Candidates mark each task complete individually, then submit all three from the dashboard
7. Submitted assessments are locked — candidates cannot re-enter

---

## Notes

- The admin password is hardcoded in `/app/admin/page.tsx` — swap for Supabase Auth in a future version if needed
- `.env.local` is gitignored by default in Next.js — do not commit credentials to a public repo
- The `ADMIN_PASSWORD` env var is set but the check in `/app/admin/page.tsx` uses the hardcoded string for simplicity in v1
