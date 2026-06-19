# Guardian Connector Landing Page

A modern, lightweight landing page for Guardian Connector communities with environment-based service configuration and optional authentication.

## Features

### Core Functionality
- **Multi-tenant Community Support** - Dynamic service URLs based on community name
- **Auth0 Integration** - Secure authentication with role-based access control
- **Environment-based Service Configuration** - Simple boolean flags for service availability
- **Conditional Rendering** - Only enabled services shown in UI

## Database

The landing page connects to the shared `guardianconnector` Postgres database (same instance as gc-explorer). Configure these environment variables:

| Variable | Description |
|----------|-------------|
| `NUXT_DB_HOST` | Postgres host |
| `NUXT_DB_USER` | Postgres user |
| `NUXT_DB_PASSWORD` | Postgres password |
| `NUXT_DB_PORT` | Postgres port (default: `5432`) |
| `NUXT_CONFIG_DATABASE` | Database name (default: `guardianconnector`) |
| `NUXT_DB_SSL` | Set to `true` to enable SSL |

Schema changes are managed with Drizzle ORM. Migrations run automatically when the server starts — that is the preferred path in deployed environments. This follows **Option 4** from the [gc-explorer database-first migration discussion](https://github.com/ConservationMetrics/gc-explorer/issues/472#issuecomment-4625773992) (run migrations at app startup every time, rather than a separate migrate step or runtime table creation). See also [gc-landing-page#83](https://github.com/ConservationMetrics/gc-landing-page/issues/83).

```bash
# generate a migration after editing server/database/schema.ts
$ pnpm db:generate

# optional: apply migrations manually (e.g. local debugging without starting the server)
$ pnpm db:migrate
```

## Installation and Deployment

### Quick Start

```bash
# install dependencies
$ pnpm install

# serve with hot reload at localhost:8080
$ pnpm dev

# build for production and launch server
$ pnpm build
$ pnpm start

# generate static project
$ pnpm generate
```

### Deployment

Local deployment of Docker:

```sh
docker run --env-file=.env -it -p 8080:8080 gc-landing-page:latest
```

## Login page

- **Background image** — By default the sign-in page uses [`public/background.jpg`](public/background.jpg). To override it, set **`NUXT_PUBLIC_BACKGROUND_IMAGE`** to a full image URL. Leave unset to keep the default asset.

## Authentication

### Auth0 Setup

1. **Create Auth0 Application**
   - Application Type: Single Page Application
   - Allowed Callback URLs: `http://localhost:3000/login` (dev), `https://your-domain.com/login` (prod)
   - Allowed Logout URLs: `http://localhost:3000` (dev), `https://your-domain.com` (prod)

2. **Configure Environment Variables**
   ```bash
   NUXT_AUTH0_DOMAIN=your-tenant.auth0.com
   NUXT_AUTH0_CLIENT_ID=your-client-id
   ```

## Service Configuration Details

### Service Flags

| Flag | Service | URL Pattern |
|------|---------|-------------|
| `NUXT_PUBLIC_SUPERSET_ENABLED` | Superset | `https://superset.{community}.{domain}` |
| `NUXT_PUBLIC_WINDMILL_ENABLED` | Windmill | `https://windmill.{community}.{domain}` |
| `NUXT_PUBLIC_EXPLORER_ENABLED` | Explorer | `https://explorer.{community}.{domain}` |
| `NUXT_PUBLIC_FILEBROWSER_ENABLED` | Filebrowser | `https://files.{community}.{domain}` |

### Multi-Tenant Support

Service URLs are dynamically configured based on `NUXT_PUBLIC_COMMUNITY_NAME`:

```bash
# Community: demo
https://superset.demo.{domain}
https://windmill.demo.{domain}

# Community: acme
https://superset.acme.{domain}
https://windmill.acme.{domain}
```

---

**Built with ❤️ for Guardian Connector communities**
