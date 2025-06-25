# Guardian Connector Landing Page

A modern, lightweight landing page for Guardian Connector communities with environment-based service configuration and optional authentication.

## 🚀 Features

### Core Functionality
- **Multi-tenant Community Support** - Dynamic service URLs based on community name
- **Environment-based Service Configuration** - Simple boolean flags for service availability
- **Optional Auth0 Integration** - Secure authentication with role-based access control
- **Static Site Generation** - Fast, CDN-friendly deployment
- **Responsive Design** - Beautiful UI that works on all devices

### Service Configuration
- **Environment-based Flags** - Simple boolean variables to enable/disable services
- **Community-aware URLs** - Dynamic service URLs based on `COMMUNITY_NAME`
- **No Build-time Complexity** - Fast builds without network requests
- **Predictable Configuration** - Services are either enabled or disabled explicitly
- **Easy Deployment** - Just set environment variables in your deployment platform

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        app.vue                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  <NuxtPage />                       │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │   index.vue │  │  login.vue  │  │             │  │    │
│  │  │             │  │             │  │             │  │    │
│  │  │ Main        │  │ Auth0       │  │             │  │    │
│  │  │ Landing     │  │ Handler     │  │             │  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Git

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd gc-landing-experiment

# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
pnpm dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required: Community Configuration
COMMUNITY_NAME=demo

# Optional: Auth0 Configuration (enables authentication)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_REDIRECT_URI=https://your-domain.com/login

# Service Availability Flags (set to 'true' to enable each service)
SUPERSET_ENABLED=true
WINDMILL_ENABLED=true
EXPLORER_ENABLED=false
FILES_BROWSER_ENABLED=true
```

**Create `.env.example` file:**
```bash
# Community Configuration (Required)
COMMUNITY_NAME=demo

# Auth0 Configuration (Optional - set these to enable authentication)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_REDIRECT_URI=https://your-domain.com/login

# Service Availability Flags (Optional - set to 'true' to enable each service)
SUPERSET_ENABLED=true
WINDMILL_ENABLED=true
EXPLORER_ENABLED=false
FILES_BROWSER_ENABLED=true

# Note: AUTH0_REDIRECT_URI defaults to /login if not set
```

## 🔧 Development

### Project Structure

```
gc-landing-experiment/
├── app.vue                    # Main app layout
├── nuxt.config.ts            # Build configuration & environment variables
├── pages/
│   ├── index.vue             # Main landing page
│   └── login.vue             # Auth0 redirect handler
├── components/
└── .env.example              # Environment variables template
```

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm generate         # Generate static site
pnpm preview          # Preview production build

# Testing
pnpm test             # Run tests (if configured)

# Linting
pnpm lint             # Lint code
pnpm lint:fix         # Fix linting issues
```

### Service Configuration

Services are configured via environment variables:

```bash
# Enable specific services
SUPERSET_ENABLED=true
WINDMILL_ENABLED=true
EXPLORER_ENABLED=false
FILES_BROWSER_ENABLED=true

# The app will show only enabled services
```

**Example Output:**
```bash
# With SUPERSET_ENABLED=true, WINDMILL_ENABLED=true, EXPLORER_ENABLED=false, FILES_BROWSER_ENABLED=true
# The app will show: Superset, Windmill, and File Browser (3 services)
```

## 🔐 Authentication

### Auth0 Setup

1. **Create Auth0 Application**
   - Application Type: Single Page Application
   - Allowed Callback URLs: `http://localhost:3000/login` (dev), `https://your-domain.com/login` (prod)
   - Allowed Logout URLs: `http://localhost:3000` (dev), `https://your-domain.com` (prod)

2. **Configure Environment Variables**
   ```bash
   AUTH0_DOMAIN=your-tenant.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   ```

### Authentication Flow

1. User clicks "Sign In" → Redirected to Auth0
2. Auth0 authenticates user → Redirects to `/login`
3. `/login` handles auth code → Redirects to main page
4. User authenticated → Can access community services

## 🚀 Deployment

### Static Site Generation

```bash
# Build static site
COMMUNITY_NAME=your-community SUPERSET_ENABLED=true WINDMILL_ENABLED=true pnpm generate

# Deploy .output/public directory
# (works with any static hosting: Netlify, Vercel, S3, etc.)
```

### Docker Deployment

See [Dockerfile](./Dockerfile) for the complete configuration.

**Build and run:**
```bash
# Build with community name, auth setup, and service flags
docker build \
  --build-arg COMMUNITY_NAME=your-community \
  --build-arg AUTH0_DOMAIN=your-tenant.auth0.com \
  --build-arg AUTH0_CLIENT_ID=your-client-id \
  --build-arg AUTH0_REDIRECT_URI=https://your-domain.com/login \
  --build-arg SUPERSET_ENABLED=true \
  --build-arg WINDMILL_ENABLED=true \
  --build-arg EXPLORER_ENABLED=false \
  --build-arg FILES_BROWSER_ENABLED=true \
  -t guardian-connector .

# Run the container on port 8080
docker run -p 8080:8080 guardian-connector
```

### Environment-Specific Builds

```bash
# Development
COMMUNITY_NAME=demo SUPERSET_ENABLED=true WINDMILL_ENABLED=true pnpm generate

# Staging
COMMUNITY_NAME=staging SUPERSET_ENABLED=true WINDMILL_ENABLED=true EXPLORER_ENABLED=true pnpm generate

# Production
COMMUNITY_NAME=production SUPERSET_ENABLED=true WINDMILL_ENABLED=true EXPLORER_ENABLED=true FILES_BROWSER_ENABLED=true pnpm generate
```

## 🔍 Service Configuration Details

### How It Works

1. **Environment Variables** - Set boolean flags for each service
2. **Runtime Generation** - Services list generated from enabled flags
3. **Dynamic URLs** - Service URLs built using `COMMUNITY_NAME`
4. **Conditional Rendering** - Only enabled services shown in UI

### Service Flags

| Flag | Service | URL Pattern |
|------|---------|-------------|
| `SUPERSET_ENABLED` | Superset | `https://superset.{community}.guardianconnector.net` |
| `WINDMILL_ENABLED` | Windmill | `https://windmill.{community}.guardianconnector.net` |
| `EXPLORER_ENABLED` | Explorer | `https://explorer.{community}.guardianconnector.net` |
| `FILES_BROWSER_ENABLED` | File Browser | `https://files.{community}.guardianconnector.net` |

### Multi-Tenant Support

Services are dynamically configured based on community:

```bash
# Community: demo
https://superset.demo.guardianconnector.net
https://windmill.demo.guardianconnector.net

# Community: acme
https://superset.acme.guardianconnector.net
https://windmill.acme.guardianconnector.net
```

## 🛠️ Troubleshooting

### Common Issues

#### Services Not Showing
```bash
# Check environment variables
echo $SUPERSET_ENABLED
echo $WINDMILL_ENABLED
echo $EXPLORER_ENABLED
echo $FILES_BROWSER_ENABLED

# Verify they are set to 'true' (string)
SUPERSET_ENABLED=true
```

#### Auth0 Issues
```bash
# Check callback URLs in Auth0 dashboard
# Verify environment variables
echo $AUTH0_DOMAIN
echo $AUTH0_CLIENT_ID

# Check browser network tab for redirect issues
```

### Debug Mode

```bash
# Enable verbose logging
DEBUG=nuxt:* pnpm dev

# Check environment variables
echo $COMMUNITY_NAME
echo $SUPERSET_ENABLED
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Vue 3 Composition API patterns
- Use TypeScript for type safety
- Test service configuration with different environment variables
- Ensure authentication flows work correctly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Review [troubleshooting section](#troubleshooting)
- Open an issue on GitHub

---

**Built with ❤️ for Guardian Connector communities**
