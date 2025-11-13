<script setup lang="ts">
import { useUserSession, useRuntimeConfig, useHead } from "#imports";
import { computed, ref } from "vue";
import { Role } from "~/types/types";
import GlobeLanguagePicker from "@/components/shared/GlobeLanguagePicker.vue";
import { translateRoleName } from "@/utils/roleTranslations";

interface User {
  auth0: string;
  roles?: Array<{ id: string; name: string; description: string }>;
  userRole?: Role;
}

const config = useRuntimeConfig();
const communityName = config.public.communityName;
const { t, locale, locales, setLocale } = useI18n();

// Auth state using nuxt-auth-utils
const { loggedIn, user } = useUserSession();

const isAuth0Configured = config.public.auth0Enabled;

// Check if user should see the app (either authenticated or auth is disabled)
const shouldShowApp = computed(() => {
  return isAuth0Configured ? loggedIn.value : true;
});

// Generate services list based on environment variables and user roles
const availableServices = computed(() => {
  const services = [];
  const typedUser = user.value as User;
  const userRole = typedUser?.userRole ?? Role.SignedIn;

  // Superset: Guest and higher (Guest, Member, Admin)
  if (config.public.supersetEnabled && userRole >= Role.Guest) {
    services.push({
      name: "Superset",
      url: `https://superset.${communityName}.guardianconnector.net`,
      icon: "superset",
      tags: ["Charts", "Visualization"],
    });
  }

  // Windmill: Admin only
  if (config.public.windmillEnabled && userRole >= Role.Admin) {
    services.push({
      name: "Windmill",
      url: `https://windmill.${communityName}.guardianconnector.net`,
      icon: "windmill",
      tags: ["Data Flows", "Scheduled Jobs"],
    });
  }

  // Explorer: SignedIn and higher (SignedIn, Guest, Member, Admin)
  if (config.public.explorerEnabled && userRole >= Role.SignedIn) {
    services.push({
      name: "Explorer",
      url: `https://explorer.${communityName}.guardianconnector.net`,
      icon: "explorer",
      tags: ["Maps", "Alerts", "Wildlife", "Dashboard"],
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

const login = () => {
  window.location.href = "/api/auth/auth0";
};

const logout = () => {
  window.location.href = "/?logout=true";
};

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
    Superset: t('services.supersetDescription'),
    Windmill: t('services.windmillDescription'),
    "Explorer": t('services.explorerDescription'),
    Explorer: t('services.explorerDescription'),
    Filebrowser: t('services.filebrowserDescription'),
  };
  return (
    descriptions[serviceName as keyof typeof descriptions] ||
    t('services.communityService')
  );
};

const isAdmin = computed(() => {
  const typedUser = user.value as User;
  return typedUser?.userRole && typedUser.userRole >= Role.Admin;
});

const mobileMenuOpen = ref(false);
const languagePickerOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const toggleLanguagePicker = () => {
  languagePickerOpen.value = !languagePickerOpen.value;
};

useHead({
  title: t('app.title'),
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Header with tab design -->
    <header class="bg-gradient-to-r mb-2 from-purple-100 to-purple-50 w-5/6 place-self-center mt-2 rounded-xl p-3">

        <!-- Desktop Layout - show above 1000px -->
        <div class="flex max-[1000px]:hidden relative items-end justify-around">
          <!-- Left: Guardian Connector Logo -->
          <div class="flex items-center">
            <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center">
              <!-- Guardian Connector logo (X symbol) -->
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div class="rounded-lg px-4 py-2">
              <h1 class="text-lg max-[1200px]:text-xs font-bold">Guardian Connector</h1>
            </div>
          </div>
        
          <!-- Tab with Community Name -->
          <div class="flex absolute left-[25%] -bottom-3 flex-col items-center t-[32%] ">
            <button class="tab-trigger active">
              <svg class="left-curve" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2" viewBox="0 0 608 647">
                <path d="M1347.436 2760H740v-646.902s200.986 16.142 313.006 311.678c104.814 276.525 231.346 327.558 294.43 335.224Z" style="fill:currentColor" transform="translate(-740 -2113.0982)"/>
              </svg>
              <span class="text-lg font-bold">{{ communityName }}</span>
              <svg class="right-curve" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2" viewBox="0 0 608 647">
                <path d="M1347.436 2760H740v-646.902s200.986 16.142 313.006 311.678c104.814 276.525 231.346 327.558 294.43 335.224Z" style="fill:currentColor" transform="translate(-740 -2113.0982)"/>
              </svg>
            </button>
          </div>
          <!-- Right: Action buttons -->
          <div class="flex items-center space-x-3 ml-auto mr-2">
            <!-- Auth controls -->
            <div v-if="isAuth0Configured && !loggedIn">
              <button
                @click="login"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                {{ t('auth.signIn') }}
              </button>
            </div>

            <!-- User info and controls -->
            <div v-if="isAuth0Configured && loggedIn" class="flex items-center space-x-3">
              <div class="text-sm max-[1200px]:text-xs text-gray-700">
                {{ t('auth.welcome', { user: (user as User)?.auth0 || 'User' }) }}
                <span v-if="(user as User)?.roles?.length" class="text-xs max-[1200px]:text-[10px] text-gray-500">
                  ({{ (user as User)?.roles?.map(role => translateRoleName(role.name, t)).join(', ') }})
                </span>
              </div>
              <button
                @click="logout"
                class="text-gray-600 hover:text-gray-900 transition-colors text-sm max-[1200px]:text-xs"
              >
                {{ t('auth.signOut') }}
              </button>
            </div>

            <!-- User Management (Gear Icon) -->
            <div
              v-if="isAuth0Configured && loggedIn && isAdmin"
              class="relative group"
            >
              <NuxtLink
                to="/admin/users"
                class="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <svg
                  class="w-5 h-5 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </NuxtLink>
              <!-- Tooltip -->
              <div class="absolute right-0 mt-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                {{ t('auth.userManagement') }}
              </div>
            </div>

            <!-- Language Picker (Globe Icon) -->
            <div class="relative group">
              <GlobeLanguagePicker theme="white" />
              <!-- Tooltip -->
              <div class="absolute right-0 mt-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                {{ t('header.languagePicker') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Layout - show below 1000px -->
        <div class="hidden max-[1000px]:flex items-center justify-between">
          <!-- Left: Guardian Connector Logo -->
          <div class="flex items-center">
            <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div class="rounded-lg px-2">
              <h1 class="text-sm font-bold">Guardian Connector</h1>
            </div>
          </div>

          <!-- Right: User Icon and Hamburger Menu -->
          <div class="flex items-center space-x-2">
            <!-- User Icon with Checkmark (if logged in) -->
            <div v-if="isAuth0Configured && loggedIn" class="relative">
              <div class="w-10 h-10 rounded-full bg-white border-2 border-green-500 flex items-center justify-center relative">
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <svg class="absolute -top-1 -right-1 w-4 h-4 text-green-500 bg-white rounded-full" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- Hamburger Menu Button -->
            <button
              @click="toggleMobileMenu"
              class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-purple-200 transition-colors"
              aria-label="Menu"
            >
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu Dropdown -->
        <div
          v-if="mobileMenuOpen && isAuth0Configured && loggedIn"
          class="hidden max-[1000px]:block mt-4 p-4 bg-white rounded-lg border border-purple-200 shadow-lg"
        >
          <!-- Welcome Message -->
          <div class="mb-4 pb-4 border-b border-purple-200">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-white border-2 border-green-500 flex items-center justify-center relative">
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <svg class="absolute -top-1 -right-1 w-4 h-4 text-green-500 bg-white rounded-full" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ t('auth.welcome', { user: (user as User)?.auth0 || 'User' }) }}</p>
                <p v-if="(user as User)?.roles?.length" class="text-xs text-gray-500">
                  {{ (user as User)?.roles?.map(role => translateRoleName(role.name, t)).join(', ') }}
                </p>
              </div>
            </div>
          </div>

          <!-- User Management (if admin) -->
          <NuxtLink
            v-if="isAdmin"
            to="/admin/users"
            @click="mobileMenuOpen = false"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors mb-2"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-sm text-gray-700">{{ t('auth.userManagement') }}</span>
          </NuxtLink>

          <!-- Language Picker -->
          <div class="px-4 py-3 mb-2">
            <button
              @click="toggleLanguagePicker"
              class="w-full flex items-center justify-between space-x-3 hover:bg-purple-50 rounded-lg px-2 py-2 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm text-gray-700 font-medium">{{ t('header.languagePicker') }}</span>
              </div>
              <svg
                class="w-4 h-4 text-gray-600 transition-transform"
                :class="{ 'rotate-180': languagePickerOpen }"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-if="languagePickerOpen" class="mt-2 space-y-1">
              <button
                v-for="lang in locales"
                :key="lang.code"
                @click="setLocale(lang.code); sessionStorage.setItem('locale', lang.code); languagePickerOpen = false"
                :class="[
                  'w-full text-left px-4 py-2 rounded-lg text-sm transition-colors',
                  locale === lang.code
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-700 hover:bg-purple-50'
                ]"
              >
                {{ lang.name }}
              </button>
            </div>
          </div>

          <!-- Sign Out -->
          <button
            @click="logout(); mobileMenuOpen = false"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-left"
          >
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="text-sm text-red-600 font-medium">{{ t('auth.signOut') }}</span>
          </button>
        </div>

        <!-- Mobile Sign In Button (if not logged in) -->
        <div v-if="isAuth0Configured && !loggedIn" class="hidden max-[1000px]:block mt-4">
          <button
            @click="login"
            class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            {{ t('auth.signIn') }}
          </button>
        </div>
    </header>

    <main class="max-w-7xl mt-10 mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-12">
      <div class="pt-0">
      <!-- Welcome Section -->
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">
          {{ t('app.welcome', { communityName }) }}
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ t('app.welcomeSubtitle', { communityName }) }}
        </p>
      </div>

      <!-- Authentication Gate (only show if auth is enabled and user not authenticated) -->
      <div
        v-if="isAuth0Configured && !loggedIn"
        class="text-center py-16"
      >
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
            {{ t('auth.secureAccessRequired') }}
          </h3>
          <p class="text-gray-600 mb-6">
            {{ t('auth.pleaseSignInToAccess') }}
          </p>
          <button
            @click="login"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            {{ t('auth.signInWithAuth0') }}
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
            <!-- Explorer: Use actual logo (compass-style) -->
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
                src="/apache.png"
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
                src="https://www.windmill.dev/img/windmill.svg"
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
                src="https://filebrowser.org/static/logo.png"
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
              {{ tag }}
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
            {{ t('services.noServicesAvailable') }}
          </h3>
          <p class="text-gray-600">
            {{ t('services.noServicesDescription') }}
          </p>
        </div>
      </div>
      </div>
    </main>

  
  </div>
</template>