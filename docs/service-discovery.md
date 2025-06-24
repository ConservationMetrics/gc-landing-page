# Service Discovery Implementation

## Overview

This document details how we implement build-time service discovery in our Guardian Connector landing page using Nuxt.js build hooks. The system automatically detects available services for each community and generates a static configuration file used by the application.

## Architecture

### Build-Time vs Runtime Discovery

**Why Build-Time?**
- ✅ Zero runtime HTTP requests
- ✅ Faster user experience  
- ✅ Static deployment friendly
- ✅ Predictable service list
- ✅ Better error handling

**vs Runtime Discovery:**
- ❌ HTTP requests on every page load
- ❌ Loading states required
- ❌ Network dependency
- ❌ Potential timeout issues

## Implementation Details

### 1. Nuxt Build Hook Integration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  hooks: {
    "build:before": async () => {
      console.log("🔍 Discovering available services...")
      await discoverServices()
    },
  },
})
```

**Hook Execution Timeline:**
1. `nuxt build` or `nuxt generate` starts
2. `build:before` hook triggers
3. `discoverServices()` function runs
4. Services checked and results written to `public/services.json`
5. Static site generation continues with service data available

### 2. Service Discovery Function

```typescript
async function discoverServices() {
  const communityName = process.env.COMMUNITY_NAME || "demo"
  const services = [
    { name: "Superset", url: `https://superset.${communityName}.guardianconnector.net` },
    { name: "Windmill", url: `https://windmill.${communityName}.guardianconnector.net` },
    { name: "Explorer", url: `https://explorer.${communityName}.guardianconnector.net` },
    { name: "File Browser", url: `https://files.${communityName}.guardianconnector.net` },
  ]

  console.log(`🔍 Checking services for community: ${communityName}`)

  // Check services in parallel for better performance
  const serviceChecks = services.map(async (service) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

      const response = await fetch(service.url, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          'User-Agent': 'GuardianConnector-ServiceDiscovery/1.0'
        }
      })

      clearTimeout(timeoutId)

      // Consider service available if it responds with success, redirect, or auth required
      // 2xx = success, 3xx = redirects
      // 401/403 = auth required (service exists, just needs login)
      // 404 = not found (endpoint doesn't exist)
      // 5xx = server errors = not available
      const isAvailable = (response.status >= 200 && response.status < 400) || 
                         (response.status === 401 || response.status === 403)

      if (isAvailable) {
        console.log(`✅ ${service.name} is available (${response.status})`)
        return { ...service, status: response.status }
      } else {
        console.log(`❌ ${service.name} is not available (${response.status})`)
        return null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.log(`❌ ${service.name} is not available: ${errorMessage}`)
      return null
    }
  })
  
  const results = await Promise.all(serviceChecks)
  const availableServices = results.filter(Boolean)

  console.log(`📊 Found ${availableServices.length}/${services.length} available services`)

  // Write discovered services to a JSON file for the app to use
  try {
    const fs = await import("fs/promises")
    await fs.writeFile("./public/services.json", JSON.stringify(availableServices, null, 2))
    console.log("💾 Services configuration saved to public/services.json")
  } catch (error) {
    console.error("❌ Failed to write services.json:", error)
  }
}
```

### 3. Multi-Tenant URL Generation

```typescript
// Environment-based community detection
const communityName = process.env.COMMUNITY_NAME || "demo"

// Direct template literal usage in services array
const services = [
  { name: "Superset", url: `https://superset.${communityName}.guardianconnector.net` },
  { name: "Windmill", url: `https://windmill.${communityName}.guardianconnector.net` },
  { name: "Explorer", url: `https://explorer.${communityName}.guardianconnector.net` },
  { name: "File Browser", url: `https://files.${communityName}.guardianconnector.net` },
]

// Example outputs:
// COMMUNITY_NAME=demo     → https://superset.demo.guardianconnector.net
// COMMUNITY_NAME=acme     → https://superset.acme.guardianconnector.net
// COMMUNITY_NAME=nonprofit → https://superset.nonprofit.guardianconnector.net
```

### 4. Output Format

```json
// Generated public/services.json
[
  {
    "name": "Superset",
    "url": "https://superset.demo.guardianconnector.net",
    "status": 401
  },
  {
    "name": "Explorer",
    "url": "https://explorer.demo.guardianconnector.net",
    "status": 200
  }
]
```

## Status Code Handling

### Accepted Status Codes (Service Available)

| Code Range | Meaning | Action | Reasoning |
|------------|---------|---------|-----------|
| **200-299** | Success | ✅ Include service | Service is fully accessible |
| **300-399** | Redirection | ✅ Include service | Service is working, might redirect to login |
| **401** | Unauthorized | ✅ Include service | Service exists, just needs authentication |
| **403** | Forbidden | ✅ Include service | Service exists, might need different permissions |

### Rejected Status Codes (Service Unavailable)

| Code Range | Meaning | Action | Reasoning |
|------------|---------|---------|-----------|
| **404** | Not Found | ❌ Exclude service | Endpoint doesn't exist |
| **500-599** | Server Error | ❌ Exclude service | Service is broken or down |
| **Network Error** | DNS/Connection failure | ❌ Exclude service | Service is unreachable |
| **Timeout** | No response in 5s | ❌ Exclude service | Service is unresponsive |

### Why We Accept 401/403 but Reject 404

```typescript
// This is GOOD - service exists and is protected
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="superset"

// This is also GOOD - service exists but requires different permissions
HTTP/1.1 403 Forbidden
Content-Type: application/json
{"error": "Insufficient permissions"}

// vs This is BAD - service doesn't exist
HTTP/1.1 404 Not Found
Content-Type: text/html
<h1>404 - Page Not Found</h1>

// vs This is also BAD - service is broken
HTTP/1.1 500 Internal Server Error
Content-Type: text/html
<h1>500 - Internal Server Error</h1>
```

**Reasoning:**
- **401/403** mean the service is running and responding correctly
- Authentication will be handled by the service itself when users click the link
- We want to show available services, not necessarily accessible ones
- **404** means the endpoint truly doesn't exist - we don't want broken links
- **500+** means the service is having server issues

## Build Process Integration

### Development Workflow

```bash
# 1. Set environment variables
export COMMUNITY_NAME=demo

# 2. Run development server
npm run dev
# Service discovery runs automatically

# 3. Check generated services
cat public/services.json
```

### Production Build

```bash
# 1. Set production environment
export COMMUNITY_NAME=production-community
export NODE_ENV=production

# 2. Generate static site
npm run generate

# 3. Verify services discovered
ls -la .output/public/services.json

# 4. Deploy .output/public directory
```

### Docker Build Integration

```dockerfile
# Build arguments for environment variables
ARG COMMUNITY_NAME=demo
ARG AUTH0_DOMAIN=""
ARG AUTH0_CLIENT_ID=""

# Set environment variables for build
ENV COMMUNITY_NAME=$COMMUNITY_NAME
ENV AUTH0_DOMAIN=$AUTH0_DOMAIN
ENV AUTH0_CLIENT_ID=$AUTH0_CLIENT_ID

# Generate static site (service discovery runs here)
RUN npm run generate
```

## Error Handling & Resilience

### Timeout Protection

```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 5000)

try {
  const response = await fetch(url, { signal: controller.signal })
  clearTimeout(timeoutId)
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request timed out')
  }
}
```

### Graceful Degradation

```typescript
// If service discovery fails completely
try {
  await discoverServices()
} catch (error) {
  console.warn('Service discovery failed, creating empty services.json')
  const fs = await import("fs/promises")
  await fs.writeFile("./public/services.json", "[]")
}
```

### Build Failure Prevention

```typescript
// Never let service discovery break the build
export default defineNuxtConfig({
  hooks: {
    "build:before": async () => {
      try {
        await discoverServices()
      } catch (error) {
        console.error('Service discovery failed:', error)
        // Continue build with empty services
        const fs = await import("fs/promises")
        await fs.writeFile("./public/services.json", "[]")
      }
    },
  },
})
```

## Testing & Validation

### Manual Testing

```bash
# Test different community names
COMMUNITY_NAME=test npm run generate
cat .output/public/services.json

# Test with unreachable services
COMMUNITY_NAME=nonexistent npm run generate
# Should generate empty array: []
```

### Expected Build Output

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

## Performance Considerations

### Build Time Impact

- **Typical Discovery Time**: 2-10 seconds for 4 services
- **Parallel Requests**: Services checked concurrently
- **Timeout Protection**: Maximum 5 seconds per service
- **Total Max Time**: ~5 seconds (due to parallel execution)

### Network Efficiency

```typescript
// Minimal network usage
method: "HEAD"        // No response body
timeout: 5000        // Quick timeout
concurrent: true     // Parallel requests
```

### Caching Strategy

```typescript
// Results cached in static build
// No runtime network requests
// Perfect for CDN deployment
```

## Community-Aware Authentication

### Service Status Integration

The service discovery system is designed to work seamlessly with community-based authentication:

1. **Services returning 401/403** are marked as available
2. **Users can click these services** and will be redirected to login
3. **Authentication is handled per-service** by the individual applications
4. **No broken links** are shown to users

### Example Service States

```bash
# Community: demo
✅ Superset (401) - Available, requires login
✅ Windmill (200) - Available, no auth required
✅ Explorer (403) - Available, requires different permissions
❌ File Browser (404) - Not available, endpoint doesn't exist
```

## Monitoring & Debugging

### Build Logs

```bash
# Enable verbose logging
DEBUG=nuxt:* npm run generate

# Look for service discovery logs:
# 🔍 Discovering available services...
# ✅ Superset is available (401)
# ❌ File Browser is not available (404)
# ✅ Found 3 available services
```

### Service Validation

```bash
# Manually test service URLs
curl -I https://superset.demo.guardianconnector.net
# HTTP/1.1 401 Unauthorized ← This is GOOD!

curl -I https://nonexistent.demo.guardianconnector.net  
# curl: (6) Could not resolve host ← This is BAD
```

## Conclusion

This build-time service discovery approach provides:

1. **Zero Runtime Cost**: No HTTP requests during user sessions
2. **Community-Aware**: Dynamic URLs based on community name
3. **Auth-Friendly**: Properly handles 401/403 responses
4. **Reliable Results**: Services checked when network is stable
5. **Graceful Degradation**: Handles failures without breaking builds
6. **Developer Friendly**: Clear logging and debugging information

The implementation leverages Nuxt.js build hooks to create a robust, efficient service discovery system that perfectly fits our static deployment requirements and community-based architecture. 