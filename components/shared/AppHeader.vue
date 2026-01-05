<script setup lang="ts">
import { useUserSession, useRuntimeConfig } from "#imports";
import { computed, ref } from "vue";
import { Role } from "~/types/types";
import GlobeLanguagePicker from "@/components/shared/GlobeLanguagePicker.vue";
import { translateRoleName } from "@/utils/roleTranslations";
import { useAuthActions } from "@/composables/useAuth";

interface User {
  auth0: string;
  roles?: Array<{ id: string; name: string; description: string }>;
  userRole?: Role;
}

const config = useRuntimeConfig();
const communityName = config.public.communityName;
const { t } = useI18n();

// Auth state using nuxt-auth-utils
const { loggedIn, user } = useUserSession();

const isAuth0Configured = config.public.auth0Enabled;

const isAdmin = computed(() => {
  const typedUser = user.value as User;
  return typedUser?.userRole && typedUser.userRole >= Role.Admin;
});

const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const { login, logout } = useAuthActions();
</script>

<template>
  <header
    class="bg-gradient-to-r mb-2 from-purple-100 to-purple-50 w-5/6 place-self-center mt-2 rounded-xl p-3"
  >
    <!-- Desktop Layout - show above 1000px -->
    <div class="flex max-[1000px]:hidden relative items-end justify-around">
      <!-- Left: Guardian Connector Logo -->
      <div class="flex items-center">
        <div
          class="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center"
        >
          <!-- Guardian Connector logo (X symbol) -->
          <svg
            class="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div class="rounded-lg px-4 py-2">
          <h1 class="text-lg max-[1200px]:text-xs font-bold">
            Guardian Connector
          </h1>
        </div>
      </div>

      <!-- Tab with Community Name -->
      <div
        class="tab-container flex absolute left-[28%] min-[1109px]:left-[26%] min-[1230px]:left-[25%] -bottom-3 flex-col items-center t-[32%]"
      >
        <button class="tab-trigger active">
          <svg
            class="left-curve"
            xmlns="http://www.w3.org/2000/svg"
            xml:space="preserve"
            style="
              fill-rule: evenodd;
              clip-rule: evenodd;
              stroke-linejoin: round;
              stroke-miterlimit: 2;
            "
            viewBox="0 0 608 647"
          >
            <path
              d="M1347.436 2760H740v-646.902s200.986 16.142 313.006 311.678c104.814 276.525 231.346 327.558 294.43 335.224Z"
              style="fill: currentColor"
              transform="translate(-740 -2113.0982)"
            />
          </svg>
          <span class="text-lg font-bold">{{ communityName }}</span>
          <svg
            class="right-curve"
            xmlns="http://www.w3.org/2000/svg"
            xml:space="preserve"
            style="
              fill-rule: evenodd;
              clip-rule: evenodd;
              stroke-linejoin: round;
              stroke-miterlimit: 2;
            "
            viewBox="0 0 608 647"
          >
            <path
              d="M1347.436 2760H740v-646.902s200.986 16.142 313.006 311.678c104.814 276.525 231.346 327.558 294.43 335.224Z"
              style="fill: currentColor"
              transform="translate(-740 -2113.0982)"
            />
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
            {{ t("auth.signIn") }}
          </button>
        </div>

        <!-- User info and controls -->
        <div
          v-if="isAuth0Configured && loggedIn"
          class="flex items-center space-x-3"
        >
          <div class="text-sm max-[1200px]:text-xs text-gray-700">
            {{ t("auth.welcome", { user: (user as User)?.auth0 || "User" }) }}
            <span
              v-if="(user as User)?.roles?.length"
              class="text-xs max-[1200px]:text-[10px] text-gray-500"
            >
              ({{
                (user as User)?.roles
                  ?.map((role) => translateRoleName(role.name, t))
                  .join(", ")
              }})
            </span>
          </div>
          <button
            @click="logout"
            class="text-gray-600 hover:text-gray-900 transition-colors text-sm max-[1200px]:text-xs"
          >
            {{ t("auth.signOut") }}
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
          <div
            class="absolute right-0 mt-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap"
          >
            {{ t("auth.userManagement") }}
          </div>
        </div>

        <!-- Language Picker (Globe Icon) -->
        <div class="relative group">
          <GlobeLanguagePicker theme="white" variant="icon" />
          <!-- Tooltip -->
          <div
            class="absolute right-0 mt-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap"
          >
            {{ t("header.languagePicker") }}
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Layout - show below 1000px -->
    <div class="hidden max-[1000px]:flex items-center justify-between">
      <!-- Left: Guardian Connector Logo -->
      <div class="flex items-center">
        <div
          class="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center"
        >
          <svg
            class="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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
          <div
            class="w-10 h-10 rounded-full bg-white border-2 border-green-500 flex items-center justify-center relative"
          >
            <svg
              class="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <svg
              class="absolute -top-1 -right-1 w-4 h-4 text-green-500 bg-white rounded-full"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>

        <!-- Hamburger Menu Button -->
        <button
          @click="toggleMobileMenu"
          class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-purple-200 transition-colors"
          aria-label="Menu"
        >
          <svg
            class="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
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
          <div
            class="w-10 h-10 rounded-full bg-white border-2 border-green-500 flex items-center justify-center relative"
          >
            <svg
              class="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <svg
              class="absolute -top-1 -right-1 w-4 h-4 text-green-500 bg-white rounded-full"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">
              {{ t("auth.welcome", { user: (user as User)?.auth0 || "User" }) }}
            </p>
            <p
              v-if="(user as User)?.roles?.length"
              class="text-xs text-gray-500"
            >
              {{
                (user as User)?.roles
                  ?.map((role) => translateRoleName(role.name, t))
                  .join(", ")
              }}
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
        <svg
          class="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
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
        <span class="text-sm text-gray-700">{{
          t("auth.userManagement")
        }}</span>
      </NuxtLink>

      <!-- Language Picker -->
      <GlobeLanguagePicker variant="mobile" />

      <!-- Sign Out -->
      <button
        @click="
          logout();
          mobileMenuOpen = false;
        "
        class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-left"
      >
        <svg
          class="w-5 h-5 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span class="text-sm text-red-600 font-medium">{{
          t("auth.signOut")
        }}</span>
      </button>
    </div>

    <!-- Mobile Sign In Button (if not logged in) -->
    <div
      v-if="isAuth0Configured && !loggedIn"
      class="hidden max-[1000px]:block mt-4"
    >
      <button
        @click="login"
        class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
      >
        {{ t("auth.signIn") }}
      </button>
    </div>
  </header>
</template>
