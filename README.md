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
- **Community-aware URLs** - Dynamic service URLs based on `NUXT_COMMUNITY_NAME`
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
- Docker and Docker Compose

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

# Start the application (builds and runs with docker-compose)
make start
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required: Community Configuration
NUXT_COMMUNITY_NAME=demo

# Optional: Auth0 Configuration (enables authentication)
NUXT_AUTH0_DOMAIN=your-tenant.auth0.com
NUXT_AUTH0_CLIENT_ID=your-client-id
NUXT_AUTH0_REDIRECT_URI=https://your-domain.com/login

# Service Availability Flags (set to 'true' to enable each service)
NUXT_SUPERSET_ENABLED=true
NUXT_WINDMILL_ENABLED=true
NUXT_EXPLORER_ENABLED=false
NUXT_FILES_BROWSER_ENABLED=true
```

**Create `.env.example` file:**
```bash
# Community Configuration (Required)
NUXT_COMMUNITY_NAME=demo

# Auth0 Configuration (Optional - set these to enable authentication)
NUXT_AUTH0_DOMAIN=your-tenant.auth0.com
NUXT_AUTH0_CLIENT_ID=your-client-id
NUXT_AUTH0_REDIRECT_URI=https://your-domain.com/login

# Service Availability Flags (Optional - set to 'true' to enable each service)
NUXT_SUPERSET_ENABLED=true
NUXT_WINDMILL_ENABLED=true
NUXT_EXPLORER_ENABLED=false
NUXT_FILES_BROWSER_ENABLED=true

# Note: NUXT_AUTH0_REDIRECT_URI defaults to /login if not set
```

## 🔧 Development

### Project Structure

```
gc-landing-experiment/
├── app.vue                    # Main app layout
├── nuxt.config.ts            # Build configuration & environment variables
├── docker-compose.yml        # Docker Compose configuration
├── Makefile                  # Development and deployment commands
├── pages/
│   ├── index.vue             # Main landing page
│   └── login.vue             # Auth0 redirect handler
├── components/
└── .env.example              # Environment variables template
```

### Available Commands

```bash
# Docker Commands (Recommended)
make start   # Build and start the application
make up      # Start the application (if already built)
make down    # Stop the application
make logs    # Show application logs
make restart # Restart the application
make clean   # Remove containers and images

# Development Commands
make dev     # Start development server
pnpm build   # Build for production
pnpm generate # Generate static site
pnpm preview # Preview production build

# Testing
pnpm test    # Run tests (if configured)

# Linting
pnpm lint    # Lint code
pnpm lint:fix # Fix linting issues
```

### Service Configuration

Services are configured via environment variables:

```bash
# Enable specific services
NUXT_SUPERSET_ENABLED=true
NUXT_WINDMILL_ENABLED=true
NUXT_EXPLORER_ENABLED=false
NUXT_FILES_BROWSER_ENABLED=true

# The app will show only enabled services
```

**Example Output:**
```bash
# With NUXT_SUPERSET_ENABLED=true, NUXT_WINDMILL_ENABLED=true, NUXT_EXPLORER_ENABLED=false, NUXT_FILES_BROWSER_ENABLED=true
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
   NUXT_AUTH0_DOMAIN=your-tenant.auth0.com
   NUXT_AUTH0_CLIENT_ID=your-client-id
   ```

### Authentication Flow

1. User clicks "Sign In" → Redirected to Auth0
2. Auth0 authenticates user → Redirects to `/login`
3. `/login` handles auth code → Redirects to main page
4. User authenticated → Can access community services

## 🚀 Deployment

### Docker Compose (Recommended)

The easiest way to deploy is using Docker Compose with the provided Makefile:

```bash
# Build and start with current .env configuration
make start

# Stop the application
make down

# View logs
make logs
```

### Manual Docker Commands

```bash
# Build and start with docker-compose
docker-compose up --build -d

# Start without rebuilding
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs -f
```

### Static Site Generation

```bash
# Build static site
NUXT_COMMUNITY_NAME=your-community NUXT_SUPERSET_ENABLED=true NUXT_WINDMILL_ENABLED=true pnpm generate

# Deploy .output/public directory
# (works with any static hosting: Netlify, Vercel, S3, etc.)
```

### Environment-Specific Builds

```bash
# Development
NUXT_COMMUNITY_NAME=demo NUXT_SUPERSET_ENABLED=true NUXT_WINDMILL_ENABLED=true pnpm generate

# Staging
NUXT_COMMUNITY_NAME=staging NUXT_SUPERSET_ENABLED=true NUXT_WINDMILL_ENABLED=true NUXT_EXPLORER_ENABLED=true pnpm generate

# Production
NUXT_COMMUNITY_NAME=production NUXT_SUPERSET_ENABLED=true NUXT_WINDMILL_ENABLED=true NUXT_EXPLORER_ENABLED=true NUXT_FILES_BROWSER_ENABLED=true pnpm generate
```

## 🔍 Service Configuration Details

### How It Works

1. **Environment Variables** - Set boolean flags for each service
2. **Runtime Generation** - Services list generated from enabled flags
3. **Dynamic URLs** - Service URLs built using `NUXT_COMMUNITY_NAME`
4. **Conditional Rendering** - Only enabled services shown in UI

### Service Flags

| Flag | Service | URL Pattern |
|------|---------|-------------|
| `NUXT_SUPERSET_ENABLED` | Superset | `https://superset.{community}.guardianconnector.net` |
| `NUXT_WINDMILL_ENABLED` | Windmill | `https://windmill.{community}.guardianconnector.net` |
| `NUXT_EXPLORER_ENABLED` | Explorer | `https://explorer.{community}.guardianconnector.net` |
| `NUXT_FILES_BROWSER_ENABLED` | File Browser | `https://files.{community}.guardianconnector.net` |

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
echo $NUXT_SUPERSET_ENABLED
echo $NUXT_WINDMILL_ENABLED
echo $NUXT_EXPLORER_ENABLED
echo $NUXT_FILES_BROWSER_ENABLED

# Verify they are set to 'true' (string)
NUXT_SUPERSET_ENABLED=true
```

#### Auth0 Issues
```bash
# Check callback URLs in Auth0 dashboard
# Verify environment variables
echo $NUXT_AUTH0_DOMAIN
echo $NUXT_AUTH0_CLIENT_ID

# Check browser network tab for redirect issues
```

#### Docker Issues
```bash
# Clean up and rebuild
make clean
make start

# Check logs
make logs
```

### Debug Mode

```bash
# Enable verbose logging
DEBUG=nuxt:* pnpm dev

# Check environment variables
echo $NUXT_COMMUNITY_NAME
echo $NUXT_SUPERSET_ENABLED
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
