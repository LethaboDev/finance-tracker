# Finance Tracker

Independent personal finance application: Next.js static frontend, Java 17 / Spring Boot API, and PostgreSQL.

## Backend

Create a new PostgreSQL database in your own account. Supply these environment variables before running `./mvnw spring-boot:run`:

- `DB_URL`: JDBC PostgreSQL URL (`jdbc:postgresql://HOST:5432/DATABASE`)
- `DB_USERNAME` and `DB_PASSWORD`: credentials for your new database
- `JWT_SECRET`: a newly generated secret (generate with `openssl rand -base64 64`)
- `FRONTEND_ORIGINS`: comma-separated exact frontend origins, such as `https://YOUR-USERNAME.github.io` (no path)
- `PORT`: optional; defaults to 8080

Production configuration deliberately has no database credentials or signing-secret fallback. Do not reuse the previous deployment's database, signing secret, user accounts, backups, or environment variables.

Run backend tests with `./mvnw test`. Tests use the `local` profile and an isolated in-memory database; its signing secret is for tests only.

## Frontend

In `frontend`, copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_API_URL` to your own backend, then run `npm ci` and `npm run dev`. Use `npm test` for tests and `npm run build` to export static files to `frontend/out`.

## Azure hosting

Owner: [LethaboDev](https://github.com/LethaboDev). Commit email: `lethabomaredi30@gmail.com`.

Use your Azure for Students subscription. The frontend deploys to Azure Storage static website hosting in South Africa North, the backend to Azure App Service (F1 Free), and data lives in a new Azure PostgreSQL database. See [the Azure setup guide](deploy/AZURE.md) and `scripts/provision-azure.sh` for account setup, costs, provisioning, and deployment.

GitHub Actions runs tests on `main`; Azure deployment stays disabled until your resources and credentials are configured. GitHub Pages is no longer the deployment target.

The root `index.html` is a legacy frontend, outside the Next.js deployment. It defaults to localhost; configure its API constant with your own backend only if you choose to deploy it.

## Independent ownership

Local code preparation does not transfer cloud resources or repository ownership. Before going live:

1. Use a new standalone GitHub repository in your account, rather than a fork, with fresh history and your own commit name and email. Original history should remain only in a separate local backup.
2. Deploy the backend in a project owned and billed by your own hosting account.
3. Provision a new database in your own account and configure the environment variables above. Start with an empty database so existing users and administrators are not carried over.
4. Deploy the frontend from your new repository and point it at your new backend.
5. Verify account ownership, collaborators, deploy keys, OAuth/GitHub app access, CI secrets, domain/DNS access, and billing in your own accounts. Use only your credentials and remove any unwanted collaborator access from your new resources.
6. Register your own app account. If you need admin access, promote only your account to `ADMIN` directly in your new database; ordinary registration creates `USER` accounts.
7. Verify registration, login, and transactions against the new backend, and check browser network requests for the expected API host.

The intended remote is `https://github.com/LethaboDev/finance-tracker.git`. Preserve any license notices required by the source or its dependencies.
