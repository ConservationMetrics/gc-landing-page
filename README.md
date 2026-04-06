# Guardian Connector Landing Page

A modern, lightweight landing page for Guardian Connector communities with environment-based service configuration and optional authentication.

## Features

### Core Functionality
- **Multi-tenant Community Support** - Dynamic service URLs based on community name
- **Auth0 Integration** - Secure authentication with role-based access control
- **Environment-based Service Configuration** - Simple boolean flags for service availability
- **Conditional Rendering** - Only enabled services shown in UI

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
