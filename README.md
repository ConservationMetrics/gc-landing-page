# Guardian Connector Landing Page

A modern, lightweight landing page for Guardian Connector communities with environment-based service configuration and optional authentication.

## 🚀 Features

### Core Functionality
- **Multi-tenant Community Support** - Dynamic service URLs based on community name
- **Optional Auth0 Integration** - Secure authentication with role-based access control
- **Environment-based Service Configuration** - Simple boolean flags for service availability
- **Conditional Rendering** - Only enabled services shown in UI
- **Static Site Generation** - Fast, CDN-friendly deployment

## 📦 Installation and Deployment

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

### Build Constraints & Environment Variables

**Important Note:** This application is configured for **server-side rendering (SSR)** rather than static site generation (SSG) due to environment variable constraints encountered during development.

**Why SSR instead of SSG:**
- **Environment Variable Issues**: When attempting to prerender routes at build time (SSG), we encountered complex problems with environment variables that required runtime evaluation
- **Docker Complexity**: SSG would require docker-compose and additional complexity to handle environment variable injection at build time
- **Runtime Flexibility**: SSR allows for dynamic service configuration based on environment variables without build-time constraints

**Current Approach:**
- Uses Nuxt's SSR mode with `ssr: false` (SPA mode) for client-side rendering
- Requires a Node.js server runtime (contributing to Docker image size)
- Environment variables are evaluated at runtime, providing flexibility for multi-tenant deployments
- Docker image size optimized to ~341MB using distroless base image

## 🔐 Authentication

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

### Authentication Flow

1. User clicks "Sign In" → Redirected to Auth0
2. Auth0 authenticates user → Redirects to `/login`
3. `/login` handles auth code → Redirects to main page
4. User authenticated → Can access community services


## 🔍 Service Configuration Details

### Service Flags

| Flag | Service | URL Pattern |
|------|---------|-------------|
| `NUXT_PUBLIC_SUPERSET_ENABLED` | Superset | `https://superset.{community}.guardianconnector.net` |
| `NUXT_PUBLIC_WINDMILL_ENABLED` | Windmill | `https://windmill.{community}.guardianconnector.net` |
| `NUXT_PUBLIC_EXPLORER_ENABLED` | Explorer | `https://explorer.{community}.guardianconnector.net` |
| `NUXT_PUBLIC_FILEBROWSER_ENABLED` | Filebrowser | `https://files.{community}.guardianconnector.net` |

### Multi-Tenant Support

Service URLs are dynamically configured based on `NUXT_COMMUNITY_NAME`:

```bash
# Community: demo
https://superset.demo.guardianconnector.net
https://windmill.demo.guardianconnector.net

# Community: acme
https://superset.acme.guardianconnector.net
https://windmill.acme.guardianconnector.net
```

---

**Built with ❤️ for Guardian Connector communities**
