<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <!-- Performance indicator -->
      <div class="fixed top-4 right-4 z-50">
        <div class="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-white/70 space-y-1">
          <div>{{ loadTime }}ms load</div>
          <div>{{ fps }} FPS</div>
          <div>{{ memory }}MB</div>
        </div>
      </div>
  
      <!-- Header -->
      <header class="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div class="flex items-center space-x-4">
              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
              <div>
                <h1 class="text-xl font-bold text-white">Guardian Connector</h1>
                <p class="text-sm text-gray-400">{{ communityName }} Community</p>
              </div>
            </div>
            
            <!-- Navigation -->
            <div class="flex items-center space-x-4">
              <NuxtLink 
                to="/performance" 
                class="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Performance
              </NuxtLink>
              
              <!-- Auth controls (only show if auth is enabled) -->
              <div v-if="authEnabled && !isAuthenticated">
                <button
                  @click="login"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </button>
              </div>
              
              <div v-else-if="authEnabled && isAuthenticated" class="flex items-center space-x-4">
                <div class="text-sm text-gray-300">
                  Welcome, {{ user?.name || user?.email }}
                </div>
                <button
                  @click="logout"
                  class="text-gray-400 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
  
              <!-- Show auth status when disabled -->
              <div v-else-if="!authEnabled" class="text-xs text-gray-500">
                Auth Disabled
              </div>
            </div>
          </div>
        </div>
      </header>
  
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Welcome Section -->
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-white mb-4">
            Welcome to {{ communityName }} Community
          </h2>
          <p class="text-xl text-gray-300 max-w-2xl mx-auto">
            Access your community tools and resources in one place
          </p>
          <div v-if="!authEnabled" class="mt-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Open Access Mode
            </span>
          </div>
        </div>
  
        <!-- Authentication Gate (only show if auth is enabled and user not authenticated) -->
        <div v-if="authEnabled && !isAuthenticated" class="text-center py-16">
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Secure Access Required</h3>
            <p class="text-gray-400 mb-6">Please sign in to access your community tools</p>
            <button
              @click="login"
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Sign In with Auth0
            </button>
          </div>
        </div>
  
        <!-- Services Grid (show when authenticated OR when auth is disabled) -->
        <div v-else-if="availableServices.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="service in availableServices"
            :key="service.name"
            class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
            @click="openService(service.url)"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">{{ service.name }}</h3>
            <p class="text-gray-400 text-sm">{{ getServiceDescription(service.name) }}</p>
          </div>
        </div>
  
        <!-- No Services Available -->
        <div v-else class="text-center py-16">
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
            <div class="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.881-6.08 2.33"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">No Services Available</h3>
            <p class="text-gray-400">No community services are currently deployed or accessible.</p>
          </div>
        </div>
      </main>
  
      <!-- Footer -->
      <footer class="border-t border-white/10 bg-black/20 backdrop-blur-sm mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="text-center text-gray-400">
            <p>&copy; 2025 Guardian Connector.</p>
            <p class="text-sm mt-2">
              Community: {{ communityName }} | 
              Services: {{ availableServices.length }} | 
              Auth: {{ authEnabled ? 'Enabled' : 'Disabled' }}
            </p>
          </div>
        </div>
      </footer>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { usePerformance } from '@/composables/usePerformance'
  import type { Auth0Client, User } from '@auth0/auth0-spa-js'

  const config = useRuntimeConfig()
  const { fps, memory, networkStatus, loadTime } = usePerformance()

  interface Service {
    name: string
    url: string
  }

  const communityName = config.public.communityName
  const authEnabled = config.public.authEnabled
  
  // Auth state
  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)
  const availableServices = ref<Array<Service>>([])
  
  
  
  // Remove local performance tracking and use global composable
  
  
  // Remove this local implementation:
  // const performanceScore = ref(0)
  // ... local performance calculation code
  
  // Replace performanceScore with loadTime from composable
  // Change template from {{ performanceScore }}ms to {{ loadTime }}ms
  
  // Performance tracking
  // const performanceScore = ref(0)
  
  // Auth0 client (will be initialized on client-side if auth is enabled)
  let auth0Client: Auth0Client | null = null
  
  onMounted(async () => {
    // Initialize Auth0 only if auth is enabled
    if (import.meta.client && authEnabled) {
      const { createAuth0Client } = await import('@auth0/auth0-spa-js')
        
      auth0Client = await createAuth0Client({
        domain: config.public.auth0Domain as string,
        clientId: config.public.auth0ClientId as string,
        authorizationParams: {
          redirect_uri: config.public.auth0RedirectUri as string
        }
      })
  
      isAuthenticated.value = await auth0Client.isAuthenticated()
      
      if (isAuthenticated.value) {
        user.value = (await auth0Client.getUser()) || null
      }
  
      if (window.location.search.includes('code=')) {
        await auth0Client.handleRedirectCallback()
        isAuthenticated.value = await auth0Client.isAuthenticated()
        if (isAuthenticated.value) {
          user.value = (await auth0Client.getUser()) || null
        }
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    } else if (!authEnabled) {
      // If auth is disabled, consider user as "authenticated"
      isAuthenticated.value = true
    }
  
    try {
      const response = await fetch('/services.json')
      availableServices.value = await response.json()
    } catch (error) {
      console.log('No services.json found, using empty array')
    }
  
    // Calculate performance score
    // if (process.client) {
    //   setTimeout(() => {
    //     const perfData = performance.getEntriesByType('navigation')[0]
    //     performanceScore.value = Math.round(perfData.loadEventEnd - perfData.fetchStart)
    //   }, 100)
    // }
  })
  
  const login = async () => {
    if (auth0Client) {
      await auth0Client.loginWithRedirect()
    }
  }
  
  const logout = async () => {
    if (auth0Client) {
      await auth0Client.logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      })
    }
  }
  
  const openService = (url: string) => {
    window.open(url, '_blank')
  }
  
  const getServiceDescription = (serviceName:  string) => {
    const descriptions = {
      'Superset': 'Business intelligence and data visualization platform',
      'Windmill': 'Workflow automation and script execution platform',
      'Explorer': 'Data exploration and analysis tools',
      'File Browser': 'Secure file management and sharing'
    }
    return descriptions[serviceName as keyof typeof descriptions] || 'Community service'
  }
  </script>
  