<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
// Global performance tracking for the entire app
if (import.meta.client) {
  const globalPerf = {
    fps: 0,
    memory: 0,
    networkStatus: 'online',
    startTime: performance.now()
  }

  //  FPS monitoring
  let frameCount = 0
  let lastTime = performance.now()
  
  const measureGlobalFPS = () => {
    frameCount++
    const currentTime = performance.now()
    
    if (currentTime >= lastTime + 1000) {
      globalPerf.fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
      frameCount = 0
      lastTime = currentTime
      
      // Dispatch custom event for any component to listen
      window.dispatchEvent(new CustomEvent('performance-update', { 
        detail: globalPerf 
      }))
    }
    
    requestAnimationFrame(measureGlobalFPS)
  }
  measureGlobalFPS()

  //  memory monitoring
  setInterval(() => {
    if (performance.memory) {
      globalPerf.memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
    }
    globalPerf.networkStatus = navigator.onLine ? 'online' : 'offline'
    
    // Make global performance data available
    window.__GUARDIAN_PERF__ = globalPerf
  }, 1000)

  // Initial page load tracking
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0]
    globalPerf.loadTime = Math.round(perfData.loadEventEnd - perfData.fetchStart)
    
    console.log('📊 Initial Page Load Performance:', {
      domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
      loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
      totalTime: globalPerf.loadTime
    })
  })
}
</script>
