# OhPera 💸

> *"Oh, pera."* — that sinking feeling when you check your wallet.

OhPera is an open-source personal finance and payables tracking app built for real-life Filipino budgeting. No fluff, no vanity dashboards — just a clear answer to the question: **"What do I need to pay, and can my next salary cover it?"**

> ⚠️ **This project is currently under active development and not yet deployed.** Expect breaking changes.

---

## What It Does

Most finance apps show you charts. OhPera shows you what matters:

- **What do I owe, and when is it due?**
- **Which payables belong to this payday cycle?**
- **How much should I set aside from my next salary?**
- **Am I overdue on anything?**
- **Can I actually afford this?**

---

## Features

### ✅ Done (Backend)
- **Auth** — register, login, JWT access + refresh tokens
- **Payables CRUD** — create, read, update, soft delete
- **Payment Periods** — auto-generated for one-time, bounded, and indefinite recurring payables
- **Recurring Schedules** — weekly, biweekly, semi-monthly, monthly, quarterly, annually, or custom intervals

### 🚧 In Progress
- **Payables Frontend** — list, create, detail views
- **Dashboard** — bucket summary, upcoming dues, overdue alerts

### 📋 Planned
- **Payment Buckets** — payables grouped by salary cycle
- **Income Tracking** — expected vs actual salary, side income, irregular income
- **Savings Goals** — emergency fund, travel, tuition, gadgets
- **Calendar View** — all due dates, salary dates, and reminders in one timeline
- **Notifications & Reminders** — due date alerts, overdue warnings
- **Budget Planning** — category-based spending limits
- **Freemium / PRO Tiers** — free tier with limits, PRO with full access
- **Export** — PDF/CSV export (PRO)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (Pages Router) + TypeScript + Tailwind CSS |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens) |
| State | Zustand (auth) + TanStack Query (server state) |

---

## Project Structure

```
ohpera/
├── frontend/          # Next.js app (Pages Router)
│   ├── pages/
│   ├── features/      # Feature-based vertical slices
│   │   ├── auth/
│   │   └── payables/
│   └── shared/        # Shared lib, hooks, components, store
│
└── backend/           # NestJS app
    ├── src/
    │   ├── features/  # Feature-based modules
    │   │   ├── auth/
    │   │   ├── users/
    │   │   └── payables/
    │   ├── shared/    # Database, common decorators, utils
    │   └── prisma/    # Schema + migrations + seed
```

---

## Getting Started (Local Development)

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your DATABASE_URL and JWT secrets in .env

npx prisma migrate dev
npx prisma db seed

npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL

npm run dev
```

### Environment Variables

**Backend `.env`:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ohpera
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Roadmap

- [x] Auth (register, login, JWT refresh)
- [x] Payables CRUD
- [x] Payment periods (one-time, bounded, indefinite rolling)
- [ ] Payables frontend (list, create, detail)
- [ ] Dashboard (bucket summary, upcoming dues, overdue alerts)
- [ ] Payment buckets
- [ ] Income tracking
- [ ] Savings goals
- [ ] Calendar view
- [ ] Push notifications
- [ ] Freemium / PRO tiers
- [ ] Payment gateway
- [ ] Deployment

---

## Contributing

OhPera is open source under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. You are free to use, study, and contribute to the code. If you modify and distribute OhPera — including running it as a hosted service — your modifications must also be released under AGPL-3.0.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines (coming soon).

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push and open a pull request

---

## License

Copyright © 2025 OhPera Contributors

OhPera is licensed under the **GNU Affero General Public License v3.0**.
See [LICENSE](./LICENSE) for the full license text.

**In plain terms:** You can use, modify, and share this code freely. But if you run a modified version as a service (even privately hosted), you must release those modifications under the same license. You cannot take this code, close it, and sell it as a proprietary product.

For commercial licensing inquiries, contact the maintainers.

---

## Disclaimer

OhPera is a personal finance *tracking* tool. It is not financial advice. All monetary data is stored locally to your account and is never sold or shared with third parties.
