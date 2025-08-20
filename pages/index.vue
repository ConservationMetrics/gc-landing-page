<script setup lang="ts">
import { useUserSession } from "#imports";
import { computed } from "vue";

interface User {
  auth0: string;
  roles?: Array<{ id: string; name: string; description: string }>;
}

const config = useRuntimeConfig();
const communityName = config.public.communityName;

// Auth state using nuxt-auth-utils
const { loggedIn, user } = useUserSession();

// Check if Auth0 is enabled
const isAuth0Configured = config.public.auth0Enabled;

// Check if user should see the app (either authenticated or auth is disabled)
const shouldShowApp = computed(() => {
  return isAuth0Configured ? loggedIn.value : true;
});

// Generate services list based on environment variables and user roles
const availableServices = computed(() => {
  const services = [];

  if (config.public.supersetEnabled) {
    services.push({
      name: "Superset",
      url: `https://superset.${communityName}.guardianconnector.net`,
    });
  }

  // Only show Windmill if user has Admin role
  if (config.public.windmillEnabled) {
    const typedUser = user.value as User;
    const userRoles = typedUser?.roles || [];
    const hasAdminRole = userRoles.some(
      (role: { name: string }) => role.name === "Admin",
    );

    if (hasAdminRole) {
      services.push({
        name: "Windmill",
        url: `https://windmill.${communityName}.guardianconnector.net`,
      });
    }
  }

  if (config.public.explorerEnabled) {
    services.push({
      name: "Explorer",
      url: `https://explorer.${communityName}.guardianconnector.net`,
    });
  }

  if (config.public.filebrowserEnabled) {
    services.push({
      name: "Filebrowser",
      url: `https://files.${communityName}.guardianconnector.net`,
    });
  }

  return services;
});

const login = () => {
  window.location.href = "/api/auth/auth0";
};

const logout = () => {
  window.location.href = "/?logout=true";
};

const openService = (url: string) => {
  window.open(url, "_blank");
};

const getServiceDescription = (serviceName: string) => {
  const descriptions = {
    Superset: "Business intelligence and data visualization platform",
    Windmill: "Workflow automation and script execution platform",
    Explorer: "Data exploration and analysis tools",
    Filebrowser: "Secure file management and sharing",
  };
  return (
    descriptions[serviceName as keyof typeof descriptions] ||
    "Community service"
  );
};

useHead({
  title: "Guardian Connector Landing Page",
});
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
  >
    <!-- Header -->
    <header class="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center space-x-4">
            <div
              class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"
            ></div>
            <div>
              <h1 class="text-xl font-bold text-white">Guardian Connector</h1>
              <p class="text-sm text-gray-400">{{ communityName }} Community</p>
            </div>
          </div>

          <!-- Navigation -->
          <div class="flex items-center space-x-4">
            <!-- Auth controls (only show if auth is enabled) -->
            <div v-if="isAuth0Configured && !loggedIn">
              <button
                @click="login"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </div>

            <div
              v-if="isAuth0Configured && loggedIn"
              class="flex items-center space-x-4"
            >
              <div class="text-sm text-gray-300">
                Welcome, {{ (user as User)?.auth0 || 'User' }}
                <span v-if="(user as User)?.roles?.length" class="text-xs text-gray-400">
                  ({{ (user as User)?.roles?.map(role => role.name).join(', ') }})
                </span>
              </div>
              <button
                @click="logout"
                class="text-gray-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
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
      </div>

      <!-- Authentication Gate (only show if auth is enabled and user not authenticated) -->
      <div
        v-if="isAuth0Configured && !loggedIn"
        class="text-center py-16"
      >
        <div
          class="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto"
        >
          <div
            class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">
            Secure Access Required
          </h3>
          <p class="text-gray-400 mb-6">
            Please sign in to access your community tools
          </p>
          <button
            @click="login"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Sign In with Auth0
          </button>
        </div>
      </div>

      <!-- Services Grid (show when authenticated OR when auth is disabled) -->
      <div
        v-if="shouldShowApp && availableServices.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="service in availableServices"
          :key="service.name"
          class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
          @click="openService(service.url)"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                class="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">
            {{ service.name }}
          </h3>
          <p class="text-gray-400 text-sm">
            {{ getServiceDescription(service.name) }}
          </p>
        </div>
      </div>

      <!-- No Services Available -->
      <div
        v-if="shouldShowApp && availableServices.length === 0"
        class="text-center py-16"
      >
        <div
          class="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto"
        >
          <div
            class="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.881-6.08 2.33"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">
            No Services Available
          </h3>
          <p class="text-gray-400">
            No community services are currently deployed or accessible.
          </p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-white/10 bg-black/20 backdrop-blur-sm mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-gray-400">
          <p>&copy; 2025 Guardian Connector.</p>
          <p class="text-sm mt-2">
            Community: {{ communityName }} | Services:
            {{ availableServices.length }} |
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
