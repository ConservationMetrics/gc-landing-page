# Performance Monitoring Implementation Guide

## Overview

This document explains how we implement lightweight, **app-wide** real-time performance monitoring in our Guardian Connector landing page. Our approach uses native browser APIs to measure actual user experience across the entire application with minimal overhead, while providing role-based access control for performance features.

## Table of Contents

1. [Performance Metrics](#performance-metrics)
2. [App-Wide Architecture](#app-wide-architecture)
3. [Implementation Architecture](#implementation-architecture)
4. [Service Discovery at Build Time](#service-discovery-at-build-time)
5. [Monitoring Components](#monitoring-components)
6. [Data Collection Methods](#data-collection-methods)
7. [Performance Thresholds](#performance-thresholds)
8. [Global Performance System](#global-performance-system)
9. [Role-Based Access Control](#role-based-access-control)
10. [Troubleshooting Guide](#troubleshooting-guide)

## Performance Metrics

### 1. Frames Per Second (FPS)

**What it measures:** How smoothly the user interface renders and responds to interactions **across the entire app**.

**Implementation:**
```javascript
// Global FPS monitoring in app.vue
let frameCount = 0
let lastTime = performance.now()

const measureGlobalFPS = () => {
  frameCount++
  const currentTime = performance.now()
  
  if (currentTime >= lastTime + 1000) {
    const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
    frameCount = 0
    lastTime = currentTime
    
    // Broadcast to entire app
    window.dispatchEvent(new CustomEvent('performance-update', { 
      detail: { fps, memory, networkStatus } 
    }))
  }
  
  requestAnimationFrame(measureGlobalFPS) // Continuous monitoring
}
```

**Why it matters:**
- **User Experience**: Directly correlates to perceived smoothness across all pages
- **Performance Bottlenecks**: Low FPS indicates main thread blocking anywhere in the app
- **Resource Efficiency**: High FPS with low CPU usage = optimized code throughout

**Thresholds:**
- ✅ **Excellent**: 50-60 FPS
- ⚠️ **Acceptable**: 30-49 FPS  
- ❌ **Poor**: <30 FPS

### 2. Memory Usage

**What it measures:** JavaScript heap memory consumption in real-time **for the entire application**.

**Implementation:**
```javascript
// Global memory monitoring
setInterval(() => {
  if (performance.memory) {
    const memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
    
    // Make available globally
    window.__GUARDIAN_PERF__.memory = memoryUsage
    
    // Detailed breakdown for performance page
    const memoryBreakdown = {
      usedJSHeapSize: performance.memory.usedJSHeapSize,    // Actually used
      totalJSHeapSize: performance.memory.totalJSHeapSize,  // Total allocated
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit   // Maximum available
    }
  }
}, 1000)
```

**Why it matters:**
- **Memory Leaks**: Steadily increasing memory indicates leaks across the app
- **Garbage Collection**: High memory triggers GC pauses affecting all interactions
- **Mobile Performance**: Critical on resource-constrained devices

**Thresholds:**
- ✅ **Excellent**: <25MB (ultra-lightweight)
- ⚠️ **Good**: 25-75MB (acceptable for SPA)
- ❌ **Concerning**: >75MB (investigate leaks)

### 3. Network Status & Connection Quality

**What it measures:** User's connectivity state and connection speed **throughout app usage**.

**Implementation:**
```javascript
// Global network monitoring
const updateNetworkStatus = () => {
  const networkStatus = navigator.onLine ? 'online' : 'offline'
  const connectionType = navigator.connection?.effectiveType || 'unknown'
  
  window.__GUARDIAN_PERF__.networkStatus = networkStatus
  window.__GUARDIAN_PERF__.connectionType = connectionType
}

// Monitor network changes globally
window.addEventListener('online', updateNetworkStatus)
window.addEventListener('offline', updateNetworkStatus)
```

**Why it matters:**
- **Adaptive Loading**: Adjust features based on connection speed across all pages
- **Error Handling**: Graceful degradation for offline users
- **Performance Context**: Slow connections affect perceived performance everywhere

### 4. Page Load Performance Timeline

**What it measures:** Detailed breakdown of initial page loading phases (SPA loads once).

**Implementation:**
```javascript
// Initial load tracking (runs once for SPA)
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0]
  const loadTime = Math.round(perfData.loadEventEnd - perfData.fetchStart)
  
  window.__GUARDIAN_PERF__.loadTime = loadTime
  
  console.log('📊 Initial Page Load Performance:', {
    domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
    loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
    totalTime: loadTime
  })
})
```

**Phase Breakdown:**
- **DNS Lookup**: Domain name resolution time
- **TCP Connect**: Time to establish connection
- **Request**: Time waiting for server to start responding
- **Response**: Time to download the response
- **DOM Processing**: Time to parse and process HTML/CSS/JS
- **Load Complete**: Time for all resources to finish loading

**Thresholds:**
- **DNS Lookup**: <100ms (good), >500ms (investigate DNS)
- **TCP Connect**: <100ms (good), >300ms (network issues)
- **Request**: <200ms (good), >1000ms (server performance)
- **Response**: <500ms (good), >2000ms (large payload)
- **DOM Processing**: <1000ms (good), >3000ms (optimize rendering)
- **Total Load**: <2000ms (excellent), >5000ms (needs optimization)

## App-Wide Architecture

### Global Performance Monitoring System

Our performance monitoring system operates at the **application level**, not just on individual pages:

```
┌─────────────────────────────────────────────────────────────┐
│                        app.vue                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Global Performance Monitor                │    │
│  │                                                     │    │
│  │  • FPS: requestAnimationFrame loop                 │    │
│  │  • Memory: setInterval monitoring                  │    │
│  │  • Network: event listeners                       │    │
│  │  • Events: Custom event broadcasting              │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Global State                           │    │
│  │                                                     │    │
│  │  window.__GUARDIAN_PERF__ = {                      │    │
│  │    fps: 60,                                        │    │
│  │    memory: 45,                                     │    │
│  │    networkStatus: 'online',                       │    │
│  │    loadTime: 1250                                 │    │
│  │  }                                                 │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  <NuxtPage />                       │    │
│  │                                                     │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │   index.vue │  │performance  │  │  any-page   │  │    │
│  │  │             │  │    .vue     │  │    .vue     │  │    │
│  │  │ Basic       │  │ Detailed    │  │ Custom      │  │    │
│  │  │ Indicator   │  │ Dashboard   │  │ Display     │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Key Benefits of App-Wide Monitoring

1. **Consistent Metrics**: Same performance data across all pages and components
2. **Continuous Tracking**: Monitors performance during navigation, interactions, and idle time
3. **Single Source of Truth**: One monitoring system for the entire application
4. **Minimal Overhead**: Single monitoring loop instead of multiple per-page monitors
5. **Real User Monitoring**: Tracks actual user experience across the complete app lifecycle

## Implementation Architecture

### Component Structure

```
app.vue                          # Global performance monitoring
├── Global FPS monitoring
├── Global memory tracking  
├── Global network monitoring
├── Custom event broadcasting
└── Global state management

composables/
└── usePerformance.ts           # Reactive composable for any component

pages/
├── performance.vue             # Detailed performance dashboard
├── index.vue                  # Main landing page with basic metrics
└── [any-page].vue            # Can use usePerformance() composable

components/
└── GlobalPerformanceIndicator.vue  # Reusable floating indicator
```

### Global Performance State Management

```typescript
// app.vue - Global monitoring setup
if (process.client) {
  // Initialize global performance state
  const globalPerf = {
    fps: 0,
    memory: 0,
    networkStatus: 'online',
    connectionType: 'unknown',
    loadTime: 0,
    startTime: performance.now()
  }

  // Make globally accessible
  window.__GUARDIAN_PERF__ = globalPerf

  // Start global monitoring
  startGlobalFPSMonitoring()
  startGlobalMemoryMonitoring()
  startGlobalNetworkMonitoring()
}
```

### Composable Integration

```typescript
// composables/usePerformance.ts
export const usePerformance = () => {
  const fps = ref(0)
  const memory = ref(0)
  const networkStatus = ref("online")
  const loadTime = ref(0)

  const startMonitoring = () => {
    // Listen to global performance updates
    const handlePerformanceUpdate = (event: CustomEvent) => {
      const perf = event.detail
      fps.value = perf.fps
      memory.value = perf.memory
      networkStatus.value = perf.networkStatus
      loadTime.value = perf.loadTime || 0
    }

    window.addEventListener("performance-update", handlePerformanceUpdate)

    // Get initial values from global state
    if (window.__GUARDIAN_PERF__) {
      const perf = window.__GUARDIAN_PERF__
      fps.value = perf.fps
      memory.value = perf.memory
      networkStatus.value = perf.networkStatus
      loadTime.value = perf.loadTime || 0
    }

    return () => {
      window.removeEventListener("performance-update", handlePerformanceUpdate)
    }
  }

  return {
    fps: readonly(fps),
    memory: readonly(memory),
    networkStatus: readonly(networkStatus),
    loadTime: readonly(loadTime),
    startMonitoring,
  }
}
```

### Data Flow Architecture

1. **Global Monitoring** (app.vue):
   - Continuous FPS measurement via `requestAnimationFrame`
   - Memory tracking via `setInterval` every 1000ms
   - Network status via event listeners
   - Initial load time calculation

2. **Event Broadcasting**:
   - Custom `performance-update` events dispatched globally
   - Components can listen for real-time updates
   - Global state available via `window.__GUARDIAN_PERF__`

3. **Component Integration**:
   - Any component can use `usePerformance()` composable
   - Reactive updates when performance metrics change
   - Consistent data across all components

4. **Display Flexibility**:
   - Basic indicators on main pages
   - Detailed dashboard on performance page
   - Custom displays on any page

## Service Discovery at Build Time

### Overview

We implement build-time service discovery to determine which community services are available before the app is deployed. This eliminates runtime checks and provides a better user experience.

### Implementation in nuxt.config.ts

```typescript
export default defineNuxtConfig({
  hooks: {
    // Build-time service discovery
    "build:before": async () => {
      console.log("🔍 Discovering available services...")
      await discoverServices()
    },
  },
})

async function discoverServices() {
  const communityName = process.env.COMMUNITY_NAME || "demo"
  
  // Define services to check
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

### How Service Discovery Works

#### 1. **Build Hook Execution**
- Runs during `nuxt build` or `nuxt generate`
- Executes before static site generation
- Has access to Node.js APIs and environment variables

#### 2. **Service Checking Strategy**
```typescript
// Use HEAD request for minimal overhead
const response = await fetch(service.url, {
  method: "HEAD",                    // No response body
  signal: controller.signal,         // Timeout control
})

// Accept any response < 400 OR 401/403 (auth required)
const isAvailable = (response.status >= 200 && response.status < 400) || 
                   (response.status === 401 || response.status === 403)
```

#### 3. **Timeout Handling**
```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 5000)

// This prevents hanging builds if services are unreachable
```

#### 4. **Status Code Logic**
- **200-299**: Service is fully accessible ✅
- **300-399**: Service exists but redirecting ✅
- **401**: Service exists, just needs authentication ✅
- **403**: Service exists, might need different permissions ✅
- **404**: Endpoint doesn't exist ❌
- **500-599**: Service has server errors ❌
- **Network Error**: Service doesn't exist or unreachable ❌

#### 5. **Output Generation**
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

### Benefits of Build-Time Discovery

1. **Performance**: No runtime HTTP requests
2. **User Experience**: Instant service list display
3. **Reliability**: Services checked when network is stable
4. **Caching**: Results baked into static build
5. **Debugging**: Clear build logs show service availability

### Multi-Tenant Support

```typescript
// Environment-based community detection
const communityName = process.env.COMMUNITY_NAME || "demo"

// Dynamic URL generation
const services = [
  { name: "Superset", url: `https://superset.${communityName}.guardianconnector.net` },
  // ... other services
]
```

**Deployment Examples:**
```bash
# Community A
COMMUNITY_NAME=community-a npm run generate
# Checks: superset.community-a.guardianconnector.net

# Community B  
COMMUNITY_NAME=community-b npm run generate
# Checks: superset.community-b.guardianconnector.net
```

## Monitoring Components

### 1. Global Performance Monitor (app.vue)

**Purpose**: Provides app-wide performance monitoring foundation

**Features:**
- Continuous FPS monitoring via `requestAnimationFrame`
- Memory usage tracking every 1000ms
- Network status monitoring with event listeners
- Initial page load time calculation
- Custom event broadcasting for component updates
- Global state management via `window.__GUARDIAN_PERF__`

**Key Implementation:**
```javascript
// Global FPS monitoring
const measureGlobalFPS = () => {
  frameCount++
  const currentTime = performance.now()
  
  if (currentTime >= lastTime + 1000) {
    globalPerf.fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
    frameCount = 0
    lastTime = currentTime
    
    // Broadcast to entire app
    window.dispatchEvent(new CustomEvent('performance-update', { 
      detail: globalPerf 
    }))
  }
  
  requestAnimationFrame(measureGlobalFPS)
}
```

### 2. Performance Dashboard (`pages/performance.vue`)

**Purpose**: Detailed performance analysis and monitoring interface

**Features:**
- Real-time metric display with color-coded status indicators
- Performance timeline visualization
- Memory breakdown details
- Recent performance entries
- Auto-refresh toggle functionality
- Metric clearing capabilities
- Educational explanations for team members

**Key Sections:**
1. **Real-time Metrics Grid**: FPS, Memory, Network, Load Time
2. **Performance Timeline**: Detailed load phase breakdown
3. **Resource Usage**: Memory breakdown and recent entries
4. **Explanation Section**: Documentation for team members

**Data Source**: Uses global performance data via `usePerformance()` composable

### 3. Main Page Integration (`pages/index.vue`)

**Purpose**: Non-intrusive performance monitoring on main landing page

**Features:**
- Lightweight performance indicator in header (role-based access)
- Basic metrics display (load time, FPS, memory)
- Link to detailed performance page (role-based access)
- Minimal UI impact

**Implementation:**
```vue
<!-- Performance indicator (only for authorized users) -->
<div v-if="hasPerformanceAccess" class="fixed top-4 right-4 z-50">
  <div class="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-white/70 space-y-1">
    <div>{{ loadTime }}ms load</div>
    <div>{{ fps }} FPS</div>
    <div>{{ memory }}MB</div>
  </div>
</div>

<!-- Navigation link (only for authorized users) -->
<NuxtLink 
  v-if="hasPerformanceAccess"
  to="/performance" 
  class="text-gray-400 hover:text-white transition-colors text-sm"
>
  Performance
</NuxtLink>
```

### 4. Performance Composable (`composables/usePerformance.ts`)

**Purpose**: Reactive interface to global performance data

**Features:**
- Reactive refs for all performance metrics
- Automatic event listener setup/cleanup
- Initial state synchronization with global data
- Read-only access to prevent accidental mutations
- Lifecycle management

**Usage Example:**
```vue
<script setup>
const { fps, memory, networkStatus, loadTime } = usePerformance()
</script>

<template>
  <div>
    <p>FPS: {{ fps }}</p>
    <p>Memory: {{ memory }}MB</p>
    <p>Network: {{ networkStatus }}</p>
    <p>Load Time: {{ loadTime }}ms</p>
  </div>
</template>
```

### 5. Global Performance Indicator (`components/GlobalPerformanceIndicator.vue`)

**Purpose**: Reusable floating performance indicator for any page

**Features:**
- Floating indicator with color-coded status dots
- Toggle visibility functionality
- Minimal screen real estate usage
- Can be added to any page/component

**Implementation:**
```vue
<template>
  <div 
    v-if="showIndicator"
    class="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-xs text-white z-50 space-y-1"
  >
    <div class="flex items-center space-x-2">
      <div :class="[
        'w-2 h-2 rounded-full',
        fps >= 50 ? 'bg-green-500' : fps >= 30 ? 'bg-yellow-500' : 'bg-red-500'
      ]"></div>
      <span>{{ fps }} FPS</span>
    </div>
    <!-- ... other metrics -->
  </div>
</template>
```

## Data Collection Methods

### 1. **Navigation Timing API**
```javascript
// Get detailed page load timing (runs once for SPA)
const perfData = performance.getEntriesByType('navigation')[0]
const loadTime = perfData.loadEventEnd - perfData.fetchStart
```

### 2. **Memory API** (Chrome only)
```javascript
// Monitor JavaScript heap usage continuously
if (performance.memory) {
  const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024
  const memoryBreakdown = {
    usedJSHeapSize: performance.memory.usedJSHeapSize,
    totalJSHeapSize: performance.memory.totalJSHeapSize,
    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
  }
}
```

### 3. **RequestAnimationFrame Loop**
```javascript
// Measure actual rendering performance continuously
const measureFPS = () => {
  frameCount++
  // Calculate FPS every second
  requestAnimationFrame(measureFPS)
}
```

### 4. **Network Information API**
```javascript
// Monitor connection quality and status changes
if (navigator.connection) {
  const connectionType = navigator.connection.effectiveType
}

// Listen for network changes
window.addEventListener('online', updateNetworkStatus)
window.addEventListener('offline', updateNetworkStatus)
```

### 5. **Custom Event System**
```javascript
// Broadcast performance updates to all components
window.dispatchEvent(new CustomEvent('performance-update', { 
  detail: { fps, memory, networkStatus, loadTime } 
}))

// Components listen for updates
window.addEventListener('performance-update', handlePerformanceUpdate)
```

### 6. **Performance Observer** (Advanced)
```javascript
// Monitor specific performance entries
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Process performance entries
  }
})
observer.observe({ entryTypes: ['measure', 'navigation'] })
```

## Performance Thresholds

### Application-Specific Targets

Given our lightweight static SPA requirements:

| Metric | Excellent | Good | Needs Attention |
|--------|-----------|------|-----------------|
| **FPS** | 50-60 | 30-49 | <30 |
| **Memory** | <25MB | 25-75MB | >75MB |
| **Load Time** | <1s | 1-3s | >3s |
| **Bundle Size** | <500KB | 500KB-1MB | >1MB |

### Network-Specific Targets

| Connection | Load Time Target | Acceptable Range |
|------------|------------------|------------------|
| **4G** | <1s | <2s |
| **3G** | <2s | <4s |
| **Slow 2G** | <5s | <8s |

### Real-Time Monitoring Thresholds

| Metric | Green (Good) | Yellow (Warning) | Red (Critical) |
|--------|--------------|------------------|----------------|
| **FPS** | ≥50 | 30-49 | <30 |
| **Memory** | <50MB | 50-100MB | >100MB |
| **Network** | Online | - | Offline |
| **Load Time** | <1000ms | 1000-3000ms | >3000ms |

## Global Performance System

### Architecture Overview

The global performance system operates as a **single source of truth** for performance metrics across the entire application:

```typescript
// Global Performance State Structure
window.__GUARDIAN_PERF__ = {
  // Core Metrics
  fps: 60,                    // Current frames per second
  memory: 45,                 // Memory usage in MB
  networkStatus: 'online',    // Network connectivity status
  connectionType: '4g',       // Connection type if available
  loadTime: 1250,            // Initial page load time in ms
  
  // Timestamps
  startTime: 1640995200000,   // App start timestamp
  lastUpdate: 1640995201000,  // Last metrics update
  
  // Detailed Memory (for performance page)
  memoryBreakdown: {
    usedJSHeapSize: 47185920,
    totalJSHeapSize: 52428800,
    jsHeapSizeLimit: 2172649472
  },
  
  // Performance Timeline (initial load)
  timeline: {
    dnsLookup: 45,
    tcpConnect: 23,
    request: 156,
    response: 234,
    domProcessing: 445,
    loadComplete: 123
  }
}
```

### Event-Driven Updates

```typescript
// Global event broadcasting system
const broadcastPerformanceUpdate = () => {
  const event = new CustomEvent('performance-update', {
    detail: window.__GUARDIAN_PERF__
  })
  window.dispatchEvent(event)
}

// Components listen for updates
const handlePerformanceUpdate = (event) => {
  const { fps, memory, networkStatus, loadTime } = event.detail
  // Update component state reactively
}
```

### Lifecycle Management

```typescript
// App-wide monitoring lifecycle
export default defineNuxtConfig({
  // ... other config
})

// app.vue implementation
if (process.client) {
  // 1. Initialize global state
  window.__GUARDIAN_PERF__ = createInitialState()
  
  // 2. Start monitoring systems
  startGlobalFPSMonitoring()      // Continuous FPS tracking
  startGlobalMemoryMonitoring()   // Memory usage tracking
  startGlobalNetworkMonitoring()  // Network status tracking
  
  // 3. Handle initial page load
  window.addEventListener('load', calculateInitialMetrics)
  
  // 4. Cleanup on app unload
  window.addEventListener('beforeunload', cleanupMonitoring)
}
```

### Component Integration Patterns

#### Pattern 1: Basic Metrics Display
```vue
<template>
  <div class="performance-indicator">
    <span>{{ fps }} FPS</span>
    <span>{{ memory }}MB</span>
  </div>
</template>

<script setup>
const { fps, memory } = usePerformance()
</script>
```

#### Pattern 2: Conditional Rendering Based on Performance
```vue
<template>
  <div>
    <!-- Show simplified UI if performance is poor -->
    <SimpleComponent v-if="fps < 30" />
    <FullFeaturedComponent v-else />
  </div>
</template>

<script setup>
const { fps } = usePerformance()
</script>
```

#### Pattern 3: Performance-Aware Features
```vue
<template>
  <div>
    <!-- Disable animations if FPS is low -->
    <div :class="{ 'no-animations': fps < 30 }">
      <AnimatedComponent />
    </div>
  </div>
</template>

<script setup>
const { fps } = usePerformance()
</script>
```

### Benefits of Global System

1. **Single Source of Truth**: All components get consistent performance data
2. **Minimal Overhead**: One monitoring system instead of multiple per-component monitors
3. **Real-Time Updates**: Components automatically update when performance changes
4. **Flexible Display**: Any component can show performance data in any format
5. **Performance-Aware Features**: Components can adapt behavior based on performance
6. **Debugging**: Global state accessible in browser console for debugging
7. **Consistent Thresholds**: Same performance standards across entire app

## Role-Based Access Control

### Performance Feature Access Control

Our performance monitoring system includes role-based access control to ensure that sensitive performance data is only visible to authorized users.

### Implementation

```typescript
// pages/index.vue - Access control logic
const hasPerformanceAccess = computed(() => {
  if (!authEnabled || !isAuthenticated.value || !user.value?.email) {
    return false
  }
  return user.value.email.includes('conservationmetrics.com')
})
```

### Access Control Features

1. **Performance Indicator**: Only visible to authorized users
2. **Performance Navigation Link**: Only shown to authorized users
3. **Performance Dashboard**: Accessible only to authorized users
4. **Footer Indicator**: Shows access status for authorized users

### User Experience

- **Authorized Users** (`@conservationmetrics.com`):
  - See performance indicator in top-right corner
  - Have "Performance" link in navigation
  - Can access detailed performance dashboard
  - See "Performance Access" in footer

- **Unauthorized Users**:
  - No performance indicators visible
  - No performance navigation link
  - Cannot access performance dashboard
  - Clean, uncluttered interface

### Security Benefits

1. **Data Protection**: Performance metrics only visible to team members
2. **Clean Interface**: Regular users see simplified interface
3. **Role-Based**: Easy to extend to other email domains or Auth0 roles
4. **Audit Trail**: Clear indication of who has access

### Future Extensibility

```typescript
// Easy to extend for different access patterns
const hasPerformanceAccess = computed(() => {
  if (!authEnabled || !isAuthenticated.value || !user.value?.email) {
    return false
  }
  
  // Multiple authorized domains
  const authorizedDomains = [
    'conservationmetrics.com',
    'guardianconnector.net',
    'admin.example.com'
  ]
  
  return authorizedDomains.some(domain => 
    user.value.email.includes(domain)
  )
  
  // Or use Auth0 roles (future)
  // return user.value['https://app.example.com/roles']?.includes('performance-admin')
})
```

## Troubleshooting Guide

### Common Performance Issues

#### 1. **Low FPS (<30) App-Wide**
**Symptoms:** Stuttering animations, laggy interactions across all pages
**Causes:**
- JavaScript blocking main thread globally
- Heavy DOM manipulations
- CSS animations triggering layout
- Memory pressure causing garbage collection pauses

**Debugging Steps:**
```javascript
// Check global performance state
console.log('Global Performance:', window.__GUARDIAN_PERF__)

// Monitor FPS over time
setInterval(() => {
  console.log('Current FPS:', window.__GUARDIAN_PERF__.fps)
}, 5000)
```

**Solutions:**
```javascript
// Use requestAnimationFrame for smooth animations
const animate = () => {
  // Animation logic
  requestAnimationFrame(animate)
}

// Debounce expensive operations
const debouncedHandler = debounce(expensiveFunction, 100)

// Check for main thread blocking
performance.mark('expensive-operation-start')
expensiveOperation()
performance.mark('expensive-operation-end')
performance.measure('expensive-operation', 'expensive-operation-start', 'expensive-operation-end')
```

#### 2. **High Memory Usage (>75MB) Across App**
**Symptoms:** Increasing memory over time, browser slowdown, potential crashes
**Causes:**
- Event listeners not removed during navigation
- Circular references preventing garbage collection
- Large objects retained in memory
- Memory leaks in global monitoring system

**Debugging Steps:**
```javascript
// Monitor memory trends
const memoryHistory = []
setInterval(() => {
  const current = window.__GUARDIAN_PERF__.memory
  memoryHistory.push({ time: Date.now(), memory: current })
  
  // Check for memory leaks (steadily increasing)
  if (memoryHistory.length > 10) {
    const trend = memoryHistory.slice(-10)
    const increasing = trend.every((point, i) => 
      i === 0 || point.memory >= trend[i-1].memory
    )
    if (increasing) {
      console.warn('Potential memory leak detected!')
    }
  }
}, 10000)
```

**Solutions:**
```javascript
// Cleanup in Vue components
onUnmounted(() => {
  clearInterval(intervalId)
  removeEventListener('scroll', handler)
  // Clear any global references
})

// Force garbage collection (development only)
if (window.gc && process.env.NODE_ENV === 'development') {
  window.gc()
}

// Monitor for memory leaks in global system
const cleanupGlobalMonitoring = () => {
  // Clear all intervals
  clearInterval(memoryMonitorInterval)
  clearInterval(networkMonitorInterval)
  
  // Remove event listeners
  window.removeEventListener('online', networkHandler)
  window.removeEventListener('offline', networkHandler)
  
  // Clear global state
  delete window.__GUARDIAN_PERF__
}
```

#### 3. **Slow Load Times (>3s)**
**Symptoms:** Long time to interactive, poor user experience
**Causes:**
- Large bundle size
- Unoptimized images
- Blocking resources
- Slow service discovery at build time

**Debugging Steps:**
```javascript
// Analyze load performance
const navEntries = performance.getEntriesByType('navigation')[0]
console.log('Load Performance Breakdown:', {
  dnsLookup: navEntries.domainLookupEnd - navEntries.domainLookupStart,
  tcpConnect: navEntries.connectEnd - navEntries.connectStart,
  request: navEntries.responseStart - navEntries.requestStart,
  response: navEntries.responseEnd - navEntries.responseStart,
  domProcessing: navEntries.domContentLoadedEventEnd - navEntries.domContentLoadedEventStart,
  loadComplete: navEntries.loadEventEnd - navEntries.loadEventStart
})
```

**Solutions:**
```javascript
// Code splitting
const LazyComponent = defineAsyncComponent(() => import('./Heavy.vue'))

// Image optimization
<img src="/image.webp" loading="lazy" />

// Resource hints
<link rel="preload" href="/critical.css" as="style">

// Optimize service discovery
// Reduce timeout in nuxt.config.ts
const timeoutId = setTimeout(() => controller.abort(), 3000) // Reduced from 5000
```

#### 4. **Performance Monitoring System Issues**

**Symptoms:** Missing performance data, inconsistent metrics, monitoring not working
**Causes:**
- Global monitoring not initialized
- Event listeners not properly set up
- Browser compatibility issues
- Composable not properly connected

**Debugging Steps:**
```javascript
// Check if global monitoring is running
console.log('Global Performance Available:', !!window.__GUARDIAN_PERF__)
console.log('Performance Memory API:', !!performance.memory)
console.log('Network Connection API:', !!navigator.connection)

// Test event system
window.addEventListener('performance-update', (event) => {
  console.log('Performance Update Received:', event.detail)
})

// Check composable connection
const { fps, memory } = usePerformance()
console.log('Composable Values:', { fps: fps.value, memory: memory.value })
```

**Solutions:**
```javascript
// Ensure proper initialization order
// app.vue
onMounted(() => {
  if (process.client && !window.__GUARDIAN_PERF__) {
    initializeGlobalPerformanceMonitoring()
  }
})

// Add fallbacks for unsupported browsers
const getMemoryUsage = () => {
  if (performance.memory) {
    return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
  }
  return 0 // Fallback for browsers without memory API
}

// Ensure event cleanup
const cleanup = () => {
  window.removeEventListener('performance-update', handler)
}
onUnmounted(cleanup)
```

#### 5. **Auth0 Integration Issues**

**Symptoms:** Performance features not visible, access control not working
**Causes:**
- Auth0 not properly configured
- User email not available
- Access control logic errors
- Redirect URI issues

**Debugging Steps:**
```javascript
// Check auth state
console.log('Auth Enabled:', config.public.authEnabled)
console.log('Is Authenticated:', isAuthenticated.value)
console.log('User:', user.value)
console.log('User Email:', user.value?.email)

// Check access control
console.log('Has Performance Access:', hasPerformanceAccess.value)
```

**Solutions:**
```javascript
// Ensure Auth0 is properly configured
const config = useRuntimeConfig()
const authEnabled = config.public.authEnabled

// Proper access control logic
const hasPerformanceAccess = computed(() => {
  if (!authEnabled || !isAuthenticated.value || !user.value?.email) {
    return false
  }
  return user.value.email.includes('conservationmetrics.com')
})

// Debug access control
console.log('Access Check:', {
  authEnabled,
  isAuthenticated: isAuthenticated.value,
  userEmail: user.value?.email,
  hasAccess: hasPerformanceAccess.value
})
```

### Debugging Workflow

1. **Identify the Problem**
   - Check performance dashboard (`/performance`)
   - Look for red/yellow indicators
   - Note specific metrics that are poor
   - Check browser console for global performance state

2. **Isolate the Cause**
   - Use browser DevTools Performance tab
   - Check Network tab for slow requests
   - Monitor Memory tab for leaks
   - Analyze global performance trends

3. **Implement Solution**
   - Apply appropriate optimization
   - Test in development with performance monitoring
   - Verify with global performance indicators

4. **Validate Fix**
   - Deploy to staging
   - Monitor metrics for improvement using global system
   - Ensure no regressions in other areas
   - Check performance across all pages

### Performance Testing Checklist

- [ ] Global FPS monitoring active and reporting >30 FPS
- [ ] Memory usage stable over time (<75MB for lightweight app)
- [ ] Load time <3s on 3G connection
- [ ] No JavaScript errors in console
- [ ] Global performance state (`window.__GUARDIAN_PERF__`) populated
- [ ] All services discovered correctly at build time
- [ ] Performance dashboard accessible and functional
- [ ] Metrics update in real-time across all components
- [ ] `usePerformance()` composable working in all components
- [ ] Auto-refresh toggle works on performance page
- [ ] Clear metrics function works
- [ ] Performance indicators visible on main page (for authorized users)
- [ ] Global performance events broadcasting correctly
- [ ] Memory breakdown available on performance page
- [ ] Network status monitoring functional
- [ ] Auth0 integration working properly
- [ ] Role-based access control functioning
- [ ] Performance features hidden from unauthorized users

### Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| **performance.memory** | ✅ | ❌ | ❌ | ✅ |
| **navigator.connection** | ✅ | ❌ | ❌ | ✅ |
| **Performance Observer** | ✅ | ✅ | ✅ | ✅ |
| **Navigation Timing** | ✅ | ✅ | ✅ | ✅ |
| **requestAnimationFrame** | ✅ | ✅ | ✅ | ✅ |

**Fallback Strategy:**
```javascript
// Graceful degradation for unsupported features
const getMemoryUsage = () => {
  return performance.memory 
    ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
    : 0 // Fallback value
}

const getConnectionType = () => {
  return navigator.connection?.effectiveType || 'unknown'
}
```

## Conclusion

This **app-wide** performance monitoring implementation provides:

1. **Global Performance Tracking**: Monitors the entire application, not just individual pages
2. **Real User Monitoring**: Actual user experience data across all interactions
3. **Minimal Overhead**: Single monitoring system with <1KB of code
4. **Actionable Insights**: Clear correlation between metrics and user experience
5. **Build-Time Optimization**: Service discovery without runtime cost
6. **Developer-Friendly**: Easy to understand, debug, and extend
7. **Flexible Integration**: Any component can access performance data
8. **Consistent Standards**: Same performance thresholds across entire app
9. **Role-Based Security**: Performance features protected by access control
10. **Auth0 Integration**: Seamless authentication with performance access control

The combination of **global performance monitoring**, build-time service discovery, reactive component integration, and role-based access control gives us a complete picture of application health while maintaining our lightweight architecture goals and security requirements. The system scales from basic indicators on the main page to detailed analysis on the performance dashboard, all powered by the same global monitoring foundation.

### Key Advantages of App-Wide Approach

- **Single Source of Truth**: All components get consistent performance data
- **Continuous Monitoring**: Tracks performance during navigation, interactions, and idle time  
- **Performance-Aware Features**: Components can adapt behavior based on real-time performance
- **Comprehensive Debugging**: Global state accessible for troubleshooting
- **Scalable Architecture**: Easy to add new metrics or components without duplicating monitoring logic
- **Secure Access**: Performance data protected by role-based access control
- **Community-Aware**: Multi-tenant support with per-community service discovery

This approach ensures that performance monitoring is not an afterthought but an integral part of the application architecture, providing valuable insights for optimization and ensuring the best possible user experience across the entire Guardian Connector platform while maintaining appropriate security boundaries. 