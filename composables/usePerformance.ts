import { ref, readonly, onMounted } from "vue"

declare global {
    interface Window {
        __GUARDIAN_PERF__?: {
            fps: number
            memory: number
            networkStatus: string
            loadTime?: number
        }
    }
}

export const usePerformance = () => {
    const fps = ref(0)
    const memory = ref(0)
    const networkStatus = ref("online")
    const loadTime = ref(0)
    const isMonitoring = ref(false)

    const startMonitoring = () => {
        if (!process.client || isMonitoring.value) return

        isMonitoring.value = true

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
            isMonitoring.value = false
        }
    }

    const stopMonitoring = () => {
        isMonitoring.value = false
    }

    // Auto-start monitoring when composable is used
    onMounted(() => {
        startMonitoring()
    })

    return {
        fps: readonly(fps),
        memory: readonly(memory),
        networkStatus: readonly(networkStatus),
        loadTime: readonly(loadTime),
        isMonitoring: readonly(isMonitoring),
        startMonitoring,
        stopMonitoring,
    }
}
