# Guardian Connector Landing Page

A modern, lightweight landing page for Guardian Connector communities with real-time performance monitoring, build-time service discovery, and optional authentication.

## 🚀 Features

### Core Functionality
- **Multi-tenant Community Support** - Dynamic service discovery based on community name
- **Build-time Service Discovery** - Zero runtime HTTP requests for optimal performance
- **Real-time Performance Monitoring** - App-wide FPS, memory, and network tracking
- **Optional Auth0 Integration** - Secure authentication with role-based access control
- **Static Site Generation** - Fast, CDN-friendly deployment
- **Responsive Design** - Beautiful UI that works on all devices

### Performance Monitoring
- **Global Performance Tracking** - Monitors entire application, not just individual pages
- **Real-time Metrics** - FPS, memory usage, network status, and load times
- **Performance Dashboard** - Detailed analysis with auto-refresh and metric clearing
- **Role-based Access** - Performance features restricted to authorized users
- **Minimal Overhead** - <1KB of monitoring code

### Service Discovery
- **Build-time Discovery** - Services checked during build, not runtime
- **Community-aware URLs** - Dynamic service URLs based on `COMMUNITY_NAME`
- **Auth-friendly Logic** - Properly handles 401/403 responses as "available"
- **Graceful Degradation** - Never breaks builds, creates empty config if needed
- **Parallel Checking** - Fast discovery with 5-second timeouts

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        app.vue                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Global Performance Monitor                │    │
│  │  • FPS: requestAnimationFrame loop                 │    │
│  │  • Memory: setInterval monitoring                  │    │
│  │  • Network: event listeners                       │    │
│  │  • Events: Custom event broadcasting              │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Global State                           │    │
│  │  window.__GUARDIAN_PERF__ = { fps, memory, ... }   │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  <NuxtPage />                       │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │   index.vue │  │performance  │  │  login.vue  │  │    │
│  │  │             │  │    .vue     │  │             │  │    │
│  │  │ Basic       │  │ Detailed    │  │ Auth0       │  │    │
│  │  │ Indicator   │  │ Dashboard   │  │ Handler     │  │    │
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
```

**Create `.env.example` file:**
```bash
# Community Configuration (Required)
COMMUNITY_NAME=demo

# Auth0 Configuration (Optional - set these to enable authentication)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id

# Note: AUTH0_REDIRECT_URI is not needed as we use /login automatically
```

## 🔧 Development

### Project Structure

```
gc-landing-experiment/
├── app.vue                    # Global performance monitoring
├── nuxt.config.ts            # Build configuration & service discovery
├── composables/
│   └── usePerformance.ts     # Performance monitoring composable
├── pages/
│   ├── index.vue             # Main landing page
│   ├── performance.vue       # Performance dashboard
│   └── login.vue             # Auth0 redirect handler
├── components/
│   └── GlobalPerformanceIndicator.vue
├── docs/
│   ├── service-discovery.md  # Service discovery documentation
│   └── performance-monitoring.md
└── public/
    └── services.json         # Generated service configuration
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

### Service Discovery

Service discovery runs automatically during build:

```bash
# Development
pnpm dev
# Service discovery runs automatically

# Production build
COMMUNITY_NAME=your-community pnpm generate
# Services checked and services.json generated
```

**Example Output:**
```bash
🔍 Discovering available services...
🔍 Checking services for community: demo
✅ Windmill is available (200)
❌ File Browser is not available (404)
✅ Superset is available (401)
✅ Explorer is available (200)
📊 Found 3/4 available services
💾 Services configuration saved to public/services.json
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

3. **Access Control**
   - Performance monitoring restricted to `@conservationmetrics.com` emails
   - Other users see standard interface without performance features

### Authentication Flow

1. User clicks "Sign In" → Redirected to Auth0
2. Auth0 authenticates user → Redirects to `/login`
3. `/login` handles auth code → Redirects to main page
4. User authenticated → Can access performance features (if authorized)

## 📊 Performance Monitoring

### Global Monitoring System

The app includes comprehensive performance monitoring:

- **FPS Tracking** - Real-time frame rate monitoring
- **Memory Usage** - JavaScript heap memory tracking
- **Network Status** - Connection state and type
- **Load Times** - Initial page load performance
- **Performance Timeline** - Detailed load phase breakdown

### Access Control

Performance features are restricted to authorized users:
- **Email Domain Check** - Only `@conservationmetrics.com` users see performance data
- **Conditional Rendering** - Performance indicators hidden from unauthorized users
- **Secure Access** - No performance data exposed to regular users

### Performance Dashboard

Access detailed performance metrics at `/performance`:
- Real-time metric displays with color-coded status
- Performance timeline visualization
- Memory breakdown details
- Auto-refresh toggle
- Metric clearing capabilities

## 🚀 Deployment

### Static Site Generation

```bash
# Build static site
COMMUNITY_NAME=your-community pnpm generate

# Deploy .output/public directory
# (works with any static hosting: Netlify, Vercel, S3, etc.)
```

### Docker Deployment

See [Dockerfile](./Dockerfile) for the complete configuration.

**Build and run:**
```bash
# Build with community name only
docker build --build-arg COMMUNITY_NAME=your-community -t guardian-connector .

# Build with full auth setup
docker build \
  --build-arg COMMUNITY_NAME=your-community \
  --build-arg AUTH0_DOMAIN=your-tenant.auth0.com \
  --build-arg AUTH0_CLIENT_ID=your-client-id \
  -t guardian-connector .

# Run the container on port 8080
docker run -p 8080:8080 guardian-connector
```

### Environment-Specific Builds

```bash
# Development
COMMUNITY_NAME=demo pnpm generate

# Staging
COMMUNITY_NAME=staging pnpm generate

# Production
COMMUNITY_NAME=production pnpm generate
```

## 🔍 Service Discovery Details

### How It Works

1. **Build Hook Execution** - Runs during `nuxt build` or `nuxt generate`
2. **Service Checking** - Parallel HEAD requests to all community services
3. **Status Code Logic** - Accepts 200-399 and 401/403, rejects 404 and 500+
4. **Output Generation** - Creates `public/services.json` with available services

### Service Status Handling

| Status | Meaning | Action |
|--------|---------|---------|
| **200-299** | Success | ✅ Include service |
| **300-399** | Redirect | ✅ Include service |
| **401/403** | Auth Required | ✅ Include service |
| **404** | Not Found | ❌ Exclude service |
| **500+** | Server Error | ❌ Exclude service |

### Multi-Tenant Support

Services are dynamically discovered based on community:

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

#### Service Discovery Fails
```bash
# Check network connectivity
curl -I https://superset.demo.guardianconnector.net

# Verify environment variables
echo $COMMUNITY_NAME

# Check build logs
pnpm generate 2>&1 | grep "Service discovery"
```

#### Performance Monitoring Not Working
```bash
# Check browser console
console.log(window.__GUARDIAN_PERF__)

# Verify user email domain
# Performance features only for @conservationmetrics.com
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

# Check generated services
cat public/services.json
```

## 📚 Documentation

- [Service Discovery Implementation](./docs/service-discovery.md) - Detailed service discovery guide
- [Performance Monitoring Guide](./docs/performance-monitoring.md) - Comprehensive performance monitoring documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Vue 3 Composition API patterns
- Use TypeScript for type safety
- Maintain performance monitoring standards
- Test service discovery with different communities
- Ensure authentication flows work correctly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](./docs/)
- Review [troubleshooting section](#troubleshooting)
- Open an issue on GitHub

---

**Built with ❤️ for Guardian Connector communities**
