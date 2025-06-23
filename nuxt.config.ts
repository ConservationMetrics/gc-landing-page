// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss()
    ]
  },
  runtimeConfig: {
    // Server-side (build-time) config
    communityName: process.env.COMMUNITY_NAME || "demo",
    auth0Domain: process.env.AUTH0_DOMAIN || "",
    auth0ClientId: process.env.AUTH0_CLIENT_ID || "",

    // Public config (client-side)
    public: {
      communityName: process.env.COMMUNITY_NAME || "demo",
      auth0Domain: process.env.AUTH0_DOMAIN || "",
      auth0ClientId: process.env.AUTH0_CLIENT_ID || "",
      auth0RedirectUri: process.env.AUTH0_REDIRECT_URI || "",
      authEnabled: !!(process.env.AUTH0_DOMAIN && process.env.AUTH0_CLIENT_ID),
    },
  },
  hooks: {
    // build-time service discovery 
    "build:before": async () => {
      console.log("🔍 Discovering available services...")
      await discoverServices()
    },
  }
})
// Service discovery function
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
        // Add headers to avoid some potential issues
        headers: {
          'User-Agent': 'GuardianConnector-ServiceDiscovery/1.0'
        }
      })

      clearTimeout(timeoutId)

      // Consider service available if it responds (even with auth errors)
      // 2xx = success, 3xx = redirects, 4xx = client errors (including 401/403), 5xx = server errors
      const isAvailable = response.status < 500

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