# Finance Tracker

A personal finance application for recording income and expenses, tracking balances, and reviewing transactions. Built with Next.js, Java 17 / Spring Boot, and PostgreSQL.

**[Open Finance Tracker](https://ftlethabodev0d15ae8b.z1.web.core.windows.net/)**

## Features

- Account registration and sign-in.
- Income and expense tracking with categories and dates.
- Personal transaction history and balance summaries.
- An admin dashboard for registered users, transactions, and overall financial statistics.

Admin functions require the `ADMIN` role, checked by the backend. Ordinary registration creates a `USER` account. Site visit analytics and sign-in history are not yet implemented.

## Ownership and hosting

Owned and maintained by [LethaboDev](https://github.com/LethaboDev). Repository commits use `LethaboDev <lethabomaredi30@gmail.com>`.

This is a standalone repository with fresh history. The application uses its own Azure resources, database, and credentials; it does not depend on the original owner's hosting or database. No previous user accounts or data were imported.

| Component | Deployment |
| --- | --- |
| Frontend | [Azure Storage static website](https://ftlethabodev0d15ae8b.z1.web.core.windows.net/) |
| Backend | [Spring Boot API on Azure App Service](https://ft-lethabodev-0d15ae8b.azurewebsites.net), F1 Free plan |
| Database | Azure Database for PostgreSQL Flexible Server |
| Region | South Africa North |

Resources run in the owner's Azure for Students subscription. University administrator access inherited from that subscription still applies. PostgreSQL and storage usage may consume student credit; check Azure Cost Management for current usage.

GitHub Actions runs backend and frontend tests on `main`, then deploys successful builds to Azure. Deployment is enabled and uses GitHub OIDC instead of stored deployment passwords. See the [Azure setup guide](deploy/AZURE.md) for infrastructure details. The [provisioning script](scripts/provision-azure.sh) is for a new deployment and refuses to reuse the existing resource group.

## Local development

### Backend

Install Java 17 or later and create a local PostgreSQL database. Set these environment variables:

| Variable | Value |
| --- | --- |
| `DB_URL` | JDBC URL, such as `jdbc:postgresql://localhost:5432/finance_tracker` |
| `DB_USERNAME` | Your local database username |
| `DB_PASSWORD` | Your local database password |
| `JWT_SECRET` | A fresh signing secret; generate one with `openssl rand -base64 64` |
| `FRONTEND_ORIGINS` | Exact allowed origins, comma-separated; use `http://localhost:3000` locally |
| `PORT` | Optional; defaults to `8080` |

Run from the repository root:

```sh
sh mvnw spring-boot:run
```

Database credentials and the JWT signing secret have no production fallback. Keep secrets outside version control and use a separate database for local development.

### Frontend

Use Node.js 22 or later. From the repository root:

```sh
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to `http://localhost:8080` for local development. Open `http://localhost:3000`.

`npm run build` produces the static site in `frontend/out`. The root `index.html` is a legacy frontend and is excluded from the deployed Next.js site.

## Tests

Run backend tests from the repository root:

```sh
sh mvnw test
```

Backend tests use the `local` profile and an isolated in-memory database. Their signing secret is only for testing.

Run frontend tests from `frontend`:

```sh
npm test
```

## Repository

[LethaboDev/finance-tracker](https://github.com/LethaboDev/finance-tracker)

Preserve any license notices required by the source or its dependencies.
