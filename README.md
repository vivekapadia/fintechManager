# Fintech Manager

**Fintech Manager** is a comprehensive personal finance application designed to track and manage Loans, Fixed Deposits (FD), Stock Portfolios, and Mutual Funds. It leverages a modern, open-source technology stack to provide enterprise-grade features in a secure, local environment.

---

## 🚀 Key Features

*   **User Authentication**: Secure Sign-up and Login using JWT (JSON Web Tokens).
*   **Asset Management**: Centralized tracking for Loans, FDs, and Investments (Stocks/MFs).
*   **Real-time Dashboard**: Interactive charts and summaries of your financial health. [In Progress]
*   **Analytics Engine**: Python-powered financial projections and performance calculations. [In Progress]

---

## 🛠 Technology Stack

### Core Infrastructure
*   **Monorepo**: [TurboRepo](https://turbo.build/) for efficient build and dependency management.
*   **Database**: [PostgreSQL](https://www.postgresql.org/) (running via Docker).
*   **ORM**: [Prisma](https://www.prisma.io/) for type-safe database access and migrations.

### Backend (`apps/api`)
*   **Framework**: [NestJS](https://nestjs.com/) (Node.js framework).
*   **Language**: TypeScript.
*   **Auth**: Passport.js (JWT Strategy).

### Frontend (`apps/web`)
*   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/).
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/).
*   **State**: Context API (Auth).

---

## 📂 Project Structure

```bash
fintechManager/
├── apps/
│   ├── api/            # NestJS Backend Application
│   └── web/            # React Frontend Application
├── packages/
│   └── database/       # Shared Prisma Client & Schema
├── docker-compose.yml  # Docker Infrastructure (DB, etc.)
├── package.json        # Root dependency management
└── turbo.json          # TurboRepo configuration
```

---

## 📚 Documentation & Setup

*   **[SETUP.md](./SETUP.md)**: Detailed instructions on setting up the development environment.
*   **[TECHNICAL_SPECIFICATION.md](./TECHNICAL_SPECIFICATION.md)**: In-depth architecture, database schema, and API contracts.

---

## 🤝 Contribution

1.  Clone the repository.
2.  Follow the steps in `SETUP.md`.
3.  Create a feature branch and submit a Pull Request.

---

**Author**: Admin
**License**: UNLICENSED
