<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full mx-4">
      <div class="text-center">
        <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        
        <div v-if="isLoading" class="space-y-4">
          <h3 class="text-2xl font-bold text-white">Authenticating...</h3>
          <p class="text-gray-400">Please wait while we complete your sign-in</p>
          <div class="flex justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
        
        <div v-else-if="error" class="space-y-4">
          <h3 class="text-2xl font-bold text-white">Authentication Error</h3>
          <p class="text-red-400">{{ error }}</p>
          <button
            @click="goHome"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
        
        <div v-else class="space-y-4">
          <h3 class="text-2xl font-bold text-white">Redirecting...</h3>
          <p class="text-gray-400">Taking you back to the dashboard</p>
          <div class="flex justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Auth0Client } from '@auth0/auth0-spa-js'

const config = useRuntimeConfig()
const router = useRouter()

const isLoading = ref(true)
const error = ref('')

onMounted(async () => {
  try {


    // Initialize Auth0 client
    const { createAuth0Client } = await import('@auth0/auth0-spa-js')
    
    const auth0Client: Auth0Client = await createAuth0Client({
      domain: config.public.auth0Domain as string,
      clientId: config.public.auth0ClientId as string,
      authorizationParams: {
        redirect_uri: `${window.location.origin}/login`
      }
    })

    // Check if we're handling a redirect from Auth0
    if (window.location.search.includes('code=')) {
      try {
        // Handle the redirect callback
        await auth0Client.handleRedirectCallback()
        
        // Check if authentication was successful
        const isAuthenticated = await auth0Client.isAuthenticated()
        
        if (isAuthenticated) {
          // Success! Redirect to home page
          isLoading.value = false
          setTimeout(() => {
            router.push('/')
          }, 1000)
        } else {
          error.value = 'Authentication failed. Please try again.'
        }
      } catch (authError) {
        console.error('Auth0 callback error:', authError)
        error.value = 'Authentication error occurred. Please try again.'
      }
    } else {
      // No auth code, redirect to home
      router.push('/')
    }
  } catch (err) {
    console.error('Login page error:', err)
    error.value = 'Failed to initialize authentication. Please try again.'
  } finally {
    isLoading.value = false
  }
})

const goHome = () => {
  router.push('/')
}
</script> 