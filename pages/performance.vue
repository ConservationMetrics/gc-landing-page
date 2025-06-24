<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <!-- Header -->
      <header class="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px:8">
          <div class="flex justify-between items-center py-6">
            <div class="flex items-center space-x-4">
              <NuxtLink to="/" class="text-gray-400 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </NuxtLink>
              <div>
                <h1 class="text-xl font-bold text-white">Performance Monitor</h1>
                <p class="text-sm text-gray-400">Real-time application metrics</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <button
                @click="toggleAutoRefresh"
                :class="[
                  'px-3 py-1 rounded text-sm transition-colors',
                  autoRefresh 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                ]"
              >
                {{ autoRefresh ? 'Auto: ON' : 'Auto: OFF' }}
              </button>
              <button
                @click="clearMetrics"
                class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </header>
  
      <!-- Performance Dashboard -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Real-time Metrics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- FPS Counter -->
          <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-400">Frames Per Second</h3>
              <div :class="[
                'w-3 h-3 rounded-full',
                fps.value >= 50 ? 'bg-green-500' : fps.value >= 30 ? 'bg-yellow-500' : 'bg-red-500'
              ]"></div>
            </div>
            <div class="text-3xl font-bold text-white">{{ fps.value }}</div>
            <div class="text-xs text-gray-500 mt-1">
              {{ fps.value >= 50 ? 'Excellent' : fps.value >= 30 ? 'Good' : 'Poor' }}
            </div>
          </div>
  
          <!-- Memory Usage -->
          <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-400">Memory Usage</h3>
              <div :class="[
                'w-3 h-3 rounded-full',
                memory.value < 50 ? 'bg-green-500' : memory.value < 100 ? 'bg-yellow-500' : 'bg-red-500'
              ]"></div>
            </div>
            <div class="text-3xl font-bold text-white">{{ memory.value }}</div>
            <div class="text-xs text-gray-500 mt-1">MB used</div>
          </div>
  
          <!-- Network Status -->
          <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-400">Network</h3>
              <div :class="[
                'w-3 h-3 rounded-full',
                networkStatus.value === 'online' ? 'bg-green-500' : 'bg-red-500'
              ]"></div>
            </div>
            <div class="text-3xl font-bold text-white capitalize">{{ networkStatus.value }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ connectionType }}</div>
          </div>
  
          <!-- Page Load Time -->
          <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-400">Load Time</h3>
              <div :class="[
                'w-3 h-3 rounded-full',
                loadTime.value < 1000 ? 'bg-green-500' : loadTime.value < 3000 ? 'bg-yellow-500' : 'bg-red-500'
              ]"></div>
            </div>
            <div class="text-3xl font-bold text-white">{{ loadTime.value }}</div>
            <div class="text-xs text-gray-500 mt-1">milliseconds</div>
          </div>
        </div>
  
        <!-- Detailed Performance Metrics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Performance Timeline -->
          <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Performance Timeline</h3>
            <div class="space-y-3">
              <div v-for="metric in performanceTimeline" :key="metric.name" class="flex justify-between items-center">
                <span class="text-gray-400 text-sm">{{ metric.name }}</span>
                <div class="flex items-center space-x-2">
                  <div class="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${Math.min(100, (metric.value / metric.max) * 100)}%` }"
                    ></div>
                  </div>
                  <span class="text-white text-sm font-mono w-16 text-right">{{ metric.value }}ms</span>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Resource Usage -->
          <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Resource Usage</h3>
            <div class="space-y-4">
              <!-- Memory Breakdown -->
              <div v-if="memoryBreakdown">
                <h4 class="text-sm font-medium text-gray-400 mb-2">Memory Breakdown</h4>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Used Heap</span>
                    <span class="text-white">{{ Math.round(memoryBreakdown.usedJSHeapSize / 1024 / 1024) }}MB</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Total Heap</span>
                    <span class="text-white">{{ Math.round(memoryBreakdown.totalJSHeapSize / 1024 / 1024) }}MB</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Heap Limit</span>
                    <span class="text-white">{{ Math.round(memoryBreakdown.jsHeapSizeLimit / 1024 / 1024) }}MB</span>
                  </div>
                </div>
              </div>
  
              <!-- Performance Entries -->
              <div>
                <h4 class="text-sm font-medium text-gray-400 mb-2">Recent Performance Entries</h4>
                <div class="space-y-1 max-h-32 overflow-y-auto">
                  <div 
                    v-for="entry in recentEntries" 
                    :key="entry.name"
                    class="flex justify-between text-xs"
                  >
                    <span class="text-gray-500 truncate">{{ entry.name }}</span>
                    <span class="text-gray-300">{{ Math.round(entry.duration) }}ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Performance Explanation -->
        <div class="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4">📊 Performance Monitoring Explained</h3>
          <div class="prose prose-invert max-w-none">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 class="text-white font-semibold mb-2">🎯 What We're Measuring</h4>
                <ul class="space-y-1 text-gray-300">
                  <li><strong>FPS (Frames Per Second):</strong> How smoothly the UI renders</li>
                  <li><strong>Memory Usage:</strong> JavaScript heap memory consumption</li>
                  <li><strong>Network Status:</strong> Connection state and type</li>
                  <li><strong>Load Time:</strong> Initial page load performance</li>
                </ul>
              </div>
              <div>
                <h4 class="text-white font-semibold mb-2">⚡ Why This Matters</h4>
                <ul class="space-y-1 text-gray-300">
                  <li><strong>User Experience:</strong> Faster = better UX</li>
                  <li><strong>Resource Efficiency:</strong> Lower memory = more efficient</li>
                  <li><strong>Debugging:</strong> Identify performance bottlenecks</li>
                  <li><strong>Optimization:</strong> Data-driven improvements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { usePerformance } from '@/composables/usePerformance'
  
  // Type definitions for browser APIs
  interface PerformanceMemory {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
  
  interface NavigatorConnection {
    effectiveType?: string
  }
  
  interface PerformanceNavigationTiming extends PerformanceEntry {
    domainLookupStart: number
    domainLookupEnd: number
    connectStart: number
    connectEnd: number
    requestStart: number
    responseStart: number
    responseEnd: number
    domContentLoadedEventStart: number
    domContentLoadedEventEnd: number
    loadEventStart: number
    loadEventEnd: number
  }
  
  // Extend global interfaces
  declare global {
    interface Performance {
      memory?: PerformanceMemory
    }
    
    interface Navigator {
      connection?: NavigatorConnection
    }
    
    interface Window {
      gc?: () => void
    }
  }
  
  const { 
    fps, 
    memory, 
    networkStatus, 
    loadTime 
  }: {
    fps: { readonly value: number }
    memory: { readonly value: number }
    networkStatus: { readonly value: string }
    loadTime: { readonly value: number }
  } = usePerformance()
  
  // Keep the detailed monitoring for the performance page
  const memoryBreakdown = ref<PerformanceMemory | null>(null)
  const recentEntries = ref<Array<{ name: string; duration: number }>>([])
  const autoRefresh = ref(true)
  const connectionType = ref('unknown')
  
  // Performance timeline data
  const performanceTimeline = ref([
    { name: 'DNS Lookup', value: 0, max: 1000 },
    { name: 'TCP Connect', value: 0, max: 1000 },
    { name: 'Request', value: 0, max: 2000 },
    { name: 'Response', value: 0, max: 2000 },
    { name: 'DOM Processing', value: 0, max: 3000 },
    { name: 'Load Complete', value: 0, max: 5000 }
  ])
  
  // Monitoring intervals
  let monitorInterval: NodeJS.Timeout | null = null
  
  onMounted(() => {
    startMonitoring()
    calculateInitialMetrics()
  })
  
  onUnmounted(() => {
    stopMonitoring()
  })
  
  const startMonitoring = () => {
    // Other metrics monitoring
    if (autoRefresh.value) {
      monitorInterval = setInterval(() => {
  
        // Memory usage monitoring
        if (performance.memory) {
          memoryBreakdown.value = {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          }
        }
  
        // Connection type (if available)
        if (navigator.connection) {
          connectionType.value = navigator.connection.effectiveType || 'unknown'
        }
  
        // Recent performance entries
        const entries = performance.getEntriesByType('measure')
          .concat(performance.getEntriesByType('navigation'))
          .slice(-10)
          .map(entry => ({
            name: entry.name,
            duration: entry.duration || 0
          }))
        recentEntries.value = entries
  
      }, 1000)
    }
  }
  
  const stopMonitoring = () => {
    if (monitorInterval) {
      clearInterval(monitorInterval)
      monitorInterval = null;
    }
  }
  
  const calculateInitialMetrics = () => {
    // Calculate initial load time and performance timeline
    const navEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    
    if (navEntries) {
      // Update performance timeline with real data
      performanceTimeline.value = [
        { 
          name: 'DNS Lookup', 
          value: Math.round(navEntries.domainLookupEnd - navEntries.domainLookupStart), 
          max: 1000 
        },
        { 
          name: 'TCP Connect', 
          value: Math.round(navEntries.connectEnd - navEntries.connectStart), 
          max: 1000 
        },
        { 
          name: 'Request', 
          value: Math.round(navEntries.responseStart - navEntries.requestStart), 
          max: 2000 
        },
        { 
          name: 'Response', 
          value: Math.round(navEntries.responseEnd - navEntries.responseStart), 
          max: 2000 
        },
        { 
          name: 'DOM Processing', 
          value: Math.round(navEntries.domContentLoadedEventEnd - navEntries.domContentLoadedEventStart), 
          max: 3000 
        },
        { 
          name: 'Load Complete', 
          value: Math.round(navEntries.loadEventEnd - navEntries.loadEventStart), 
          max: 5000 
        }
      ]
    }
  }
  
  const toggleAutoRefresh = () => {
    autoRefresh.value = !autoRefresh.value
    if (autoRefresh.value) {
      startMonitoring()
    } else {
      stopMonitoring()
    }
  }
  
  const clearMetrics = () => {
    // Clear performance entries
    if (performance.clearMarks) {
      performance.clearMarks()
    }
    if (performance.clearMeasures) {
      performance.clearMeasures()
    }
    
    // Reset metrics
    recentEntries.value = []
    
    // Force garbage collection if available (Chrome DevTools)
    if (window.gc) {
      window.gc()
    }
  }
  </script>
  