# Nia Tero Dashboard - Backoffice

## Steps to setup the Backoffice for the Nia Tero Dashboard

## Development

### Local Development with Docker

Since the application is designed to run in Docker, the recommended approach for local development is to use Docker with environment variables.

#### Prerequisites

- Docker
- Access to the PostgreSQL database (remote or local)

#### Environment Variables Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace the placeholder values with your actual configuration.

**Important Notes:**

- **Do NOT use quotes around values** - Docker's `--env-file` parsing includes quotes as part of the value. This is a known Docker limitation where `docker run --env-file` does not strip quotes like shell `source` commands do. Docker Compose handles this correctly, but `docker run` does not. This is Docker's behavior, not Elixir's.
  - Correct: `MICROSOFT_CLIENT_SECRET=abc123`
  - Incorrect: `MICROSOFT_CLIENT_SECRET="abc123"` (quotes become part of the value: `"abc123"`)
  - Values with spaces: `KEY=http://localhost/ # trailing slash required` (spaces are preserved, quotes are not needed)
  - See: [Docker CLI Issue #3630](https://github.com/docker/cli/issues/3630) and [Stack Overflow discussion](https://stackoverflow.com/questions/70062336/docker-environment-file-env-how-to-refer-or-quote-other-env-variables)
- The `.env` file is automatically ignored by git for security

#### Database Connection String Format

The `DATABASE_URL` follows the conventional Postgres format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

For your remote PostgreSQL setup:

- **USER**: `your_db_user`
- **PASSWORD**: Your actual password
- **HOST**: `your-db-host.com`
- **PORT**: `5432`
- **DATABASE**: `your_database_name`

#### Running the Application

1. Build the Docker image:

   ```bash
   docker build -t nia_tero_backoffice:local .
   ```

2. Run with environment variables:
   ```bash
   docker run -it -p 4000:4000 --env-file .env nia_tero_backoffice:local
   ```
3. Access the application at [`http://localhost:4000/admin`](http://localhost:4000/admin)

#### Alternative: Local Development without Docker

If you prefer to run the application directly on your machine:

- Install dependencies with `mix deps.get`
- Create and migrate your database with `mix ecto.setup`
- Install assets dependencies `cd assets && yarn install`
- Set environment variables (see above)
- Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Open [`http://localhost:4000/admin`](http://localhost:4000/admin) to see Backoffice working

## Run with Docker

To build this image, create a Docker image with the command:

```shell
$ docker build -t nia_tero_backoffice:1.0.0 .
```

## Deploy

Currently, we deploy Backoffice as a Azure Container App. It is set up
to work with an external Postgres database connection.

The following environmental variables need to be provided:

- `SECRET_KEY_BASE`: A secret key for the Elixir application.
- `DATABASE_URL`: DB connection string for a Postgres server.
- `DATABASE_POOL_SIZE`: Pool size for Postgres, Currently set to `5`
- `PORT`: Port where the application is hosted on the server. Currently set to `4000`
- `BACKOFFICE_URL`: The URL where Backoffice is hosted.
- `DASHBOARD_URL`: The URL where the Nia Tero dashboard is hosted. Used to redirect users without
  permission to access the Backoffice CMS, once logged in.
- `MAILER_KEY`: Twilio SendGrid API key with permissions to send emails.
- `MAILER_LOG`: If you want to log SendGrid activity. Currently set to `true`.
- `MAILER_SENDER`: An email address that is verified to send emails via Sendgrid.

Note: the host URL must be supplied to the Nia Tero Dashboard frontend as well.

### Configuring SMTP with Gmail

This application uses SMTP with Gmail, using a given email account that you will use to send emails. To use this, you need to configure SMTP authentication with an **App Password** for a Gmail account with 2-Step Verification enabled.

#### Steps to create an App Password

1. Go to the [Google Account Security settings](https://myaccount.google.com/security) for the account from which you want to send emails.
2. Under **Signing in to Google**, enable **2-Step Verification** if it is not already enabled.
3. Once 2-Step Verification is enabled, go to [App Passwords](https://myaccount.google.com/u/0/apppasswords).
4. Provide a name for the app password, e.g. `Backoffice`.
5. Google will generate a 16-character App Password. This is what you will provide as the `GMAIL_APP_PASSWORD` environment variable.

#### Environment variables

Set the following environment variables for your deployment:

- `GMAIL_USERNAME`: Your full Gmail address (e.g., `user@example.com`)
- `GMAIL_APP_PASSWORD`: The 16-character App Password generated above

These values are used by the application’s SMTP configuration in `runtime.exs`.

#### How it works

SMTP is handled by Swoosh: https://hexdocs.pm/swoosh/Swoosh.Adapters.SMTP.html

Note: We use SMTP directly instead of the [Gmail adapter](https://hexdocs.pm/swoosh/Swoosh.Adapters.Gmail.html) because the Gmail adapter requires you to manage OAuth2 access tokens and refresh logic. For this application which has very low-volume transactional emails, this adds unnecessary complexity.

## CI

Github Actions builds a new Docker image on each push to the `master` branch.

We do not practice continuous deployment: you need to manually trigger a deploy.

The person who authored the commit (likely the person who merged a PR into `master`)
will receive an email from GitHub with the image tag and a link they can use to deploy it.

#### To deploy via UI
1. Go to [Deploy Backoffice to Azure workflow](https://github.com/ConservationMetrics/nt-dashboard-backoffice/actions/workflows/deploy-backoffice.yml)
2. Click 'Run workflow'
3. Enter image tag

#### To deploy via CLI
```bash
IMG_TAG= # Get this from the build step
gh workflow run deploy-backend.yml -f image_tag="$IMG_TAG"
```