<script setup lang="ts">
import { useUserSession, useRuntimeConfig, useHead } from "#imports";
import { computed } from "vue";
import { Role } from "~/types/types";
import AppHeader from "@/components/shared/AppHeader.vue";
import { useAuthActions } from "@/composables/useAuth";

interface User {
  auth0: string;
  roles?: Array<{ id: string; name: string; description: string }>;
  userRole?: Role;
}

const config = useRuntimeConfig();
const communityName = config.public.communityName;
const logoUrl = config.public.logoUrl as string | undefined;
const { t } = useI18n();

// Auth state using nuxt-auth-utils
const { loggedIn, user } = useUserSession();

const isAuth0Configured = config.public.auth0Enabled;

// Check if user should see the app (either authenticated or auth is disabled)
const shouldShowApp = computed(() => {
  return isAuth0Configured ? loggedIn.value : true;
});

const { login } = useAuthActions();

// Generate services list based on environment variables and user roles
const availableServices = computed(() => {
  const services = [];
  const typedUser = user.value as User;
  const userRole = typedUser?.userRole ?? Role.SignedIn;

  // Explorer: SignedIn and higher (SignedIn, Guest, Member, Admin)
  if (config.public.explorerEnabled && userRole >= Role.SignedIn) {
    services.push({
      name: "Explorer",
      url: `https://explorer.${communityName}.guardianconnector.net`,
      icon: "explorer",
      tags: [
        "Maps",
        "Alerts Dashboard",
        "Wildlife Explorer",
        "Media Galleries",
      ],
    });
  }

  // Superset: Guest and higher (Guest, Member, Admin)
  if (config.public.supersetEnabled && userRole >= Role.Guest) {
    services.push({
      name: "Superset",
      url: `https://superset.${communityName}.guardianconnector.net`,
      icon: "superset",
      tags: ["Charts", "Analysis", "Visualizations", "Dashboards"],
    });
  }

  // Windmill: Admin only
  if (config.public.windmillEnabled && userRole >= Role.Admin) {
    services.push({
      name: "Windmill",
      url: `https://windmill.${communityName}.guardianconnector.net`,
      icon: "windmill",
      tags: ["Data Flows", "Scheduled Jobs", "Data Apps"],
    });
  }

  // Filebrowser: Member and higher (Member, Admin)
  if (config.public.filebrowserEnabled && userRole >= Role.Member) {
    services.push({
      name: "Filebrowser",
      url: `https://files.${communityName}.guardianconnector.net`,
      icon: "filebrowser",
      tags: ["Files", "Raw Data", "Archives"],
    });
  }

  return services;
});

const openService = (url: string) => {
  // If it's an internal link (starts with /), navigate to it
  if (url.startsWith("/")) {
    window.location.href = url;
  } else {
    // External links open in new tab
    window.open(url, "_blank");
  }
};

const getServiceDescription = (serviceName: string) => {
  const descriptions = {
    Superset: t("services.supersetDescription"),
    Windmill: t("services.windmillDescription"),
    Explorer: t("services.explorerDescription"),
    Filebrowser: t("services.filebrowserDescription"),
  };
  return (
    descriptions[serviceName as keyof typeof descriptions] ||
    t("services.communityService")
  );
};

const translateTag = (tag: string) => {
  const tagMap: Record<string, string> = {
    Maps: t("services.tags.maps"),
    "Alerts Dashboard": t("services.tags.alertsDashboard"),
    "Wildlife Explorer": t("services.tags.wildlifeExplorer"),
    "Media Galleries": t("services.tags.mediaGalleries"),
    Charts: t("services.tags.charts"),
    Analysis: t("services.tags.analysis"),
    Visualizations: t("services.tags.visualizations"),
    Dashboards: t("services.tags.dashboards"),
    "Data Flows": t("services.tags.dataFlows"),
    "Scheduled Jobs": t("services.tags.scheduledJobs"),
    "Data Apps": t("services.tags.dataApps"),
    Files: t("services.tags.files"),
    "Raw Data": t("services.tags.rawData"),
    Archives: t("services.tags.archives"),
  };
  return tagMap[tag] || tag;
};

useHead({
  title: t("app.title"),
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <AppHeader />

    <main class="max-w-7xl mt-10 mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-12">
      <div class="pt-0">
        <!-- Community Logo -->
        <div v-if="logoUrl" class="flex justify-center mb-8">
          <img
            :src="logoUrl"
            :alt="communityName + ' logo'"
            class="max-h-32 w-auto object-contain"
          />
        </div>

        <!-- Welcome Section -->
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">
            {{ t("app.welcome") }}
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            {{ t("app.welcomeSubtitle") }}
          </p>
        </div>

        <!-- Authentication Gate (only show if auth is enabled and user not authenticated) -->
        <div v-if="isAuth0Configured && !loggedIn" class="text-center py-16">
          <div
            class="bg-white border border-gray-200 rounded-2xl p-8 max-w-md mx-auto shadow-sm"
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
            <h3 class="text-2xl font-bold text-gray-900 mb-4">
              {{ t("auth.secureAccessRequired") }}
            </h3>
            <p class="text-gray-600 mb-6">
              {{ t("auth.pleaseSignInToAccess") }}
            </p>
            <button
              @click="login"
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              {{ t("auth.signInWithAuth0") }}
            </button>
          </div>
        </div>

        <!-- Services Grid (show when authenticated OR when auth is disabled) -->
        <div
          v-if="shouldShowApp && availableServices.length > 0"
          class="flex flex-wrap justify-center gap-6"
        >
          <div
            v-for="service in availableServices"
            :key="service.name"
            class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border border-purple-200 w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-sm flex flex-col"
            @click="openService(service.url)"
          >
            <div class="mb-4 flex justify-center">
              <!-- Explorer: Offical GC Explorer logo -->
              <div
                v-if="service.icon === 'explorer'"
                class="w-[67px] h-[67px] flex items-center justify-center"
              >
                <img
                  src="/gcexplorer.png"
                  :alt="service.name"
                  class="w-[67px] h-[67px] object-contain"
                />
              </div>
              <!-- Superset: Official Apache Superset logo -->
              <div
                v-else-if="service.icon === 'superset'"
                class="w-[83px] h-[83px] flex items-center justify-center"
              >
                <img
                  src="/superset.png"
                  :alt="service.name"
                  class="w-[83px] h-[83px] max-w-24 object-contain"
                />
              </div>
              <!-- Windmill: Official Windmill logo -->
              <div
                v-else-if="service.icon === 'windmill'"
                class="w-[67px] h-[67px] flex items-center justify-center"
              >
                <img
                  src="/windmill.svg"
                  :alt="service.name"
                  class="w-[67px] h-[67px] object-contain"
                />
              </div>
              <!-- Filebrowser: Official Filebrowser logo -->
              <div
                v-else-if="service.icon === 'filebrowser'"
                class="w-[67px] h-[67px] flex items-center justify-center"
              >
                <img
                  src="/filebrowser.png"
                  :alt="service.name"
                  class="w-[67px] h-[67px] object-contain"
                />
              </div>
            </div>

            <!-- Service Title -->
            <h3 class="text-xl font-bold text-gray-900 mb-3 text-center">
              {{ service.name }}
            </h3>

            <!-- Service Description -->
            <p class="text-gray-600 text-sm mb-4 text-center min-h-[3rem]">
              {{ getServiceDescription(service.name) }}
            </p>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2 justify-center">
              <span
                v-for="tag in service.tags"
                :key="tag"
                class="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200"
              >
                {{ translateTag(tag) }}
              </span>
            </div>
          </div>
        </div>

        <!-- No Services Available -->
        <div
          v-if="shouldShowApp && availableServices.length === 0"
          class="text-center py-16"
        >
          <div
            class="bg-white border border-gray-200 rounded-2xl p-8 max-w-md mx-auto shadow-sm"
          >
            <div
              class="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-6 flex items-center justify-center"
            >
              <svg
                class="w-8 h-8 text-gray-500"
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
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              {{ t("services.noServicesAvailable") }}
            </h3>
            <p class="text-gray-600 mb-4">
              {{ t("services.noServicesDescription") }}
            </p>
          </div>
        </div>

        <!-- Help Paragraph (always shown, centered) -->
        <div v-if="shouldShowApp" class="text-center mt-8 mb-8">
          <p class="text-gray-600 italic text-sm">
            {{ t("services.needHelp") }}
            <a
              href="https://docs.guardianconnector.net"
              target="_blank"
              rel="noopener noreferrer"
              class="text-purple-600 hover:text-purple-700 underline"
            >
              {{ t("services.documentationWebsite") }} </a
            >.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
