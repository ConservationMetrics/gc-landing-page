<script setup lang="ts">
import { useI18n, useRuntimeConfig, useUserSession } from "#imports";
import { computed, ref } from "vue";
import { Role } from "~/types/types";
import GlobeLanguagePicker from "@/components/shared/GlobeLanguagePicker.vue";
import HeaderBrand from "@/components/shared/HeaderBrand.vue";
import ThemeToggle from "@/components/shared/ThemeToggle.vue";
import { translateRoleName } from "@/utils/roleTranslations";
import { useAuthActions } from "@/composables/useAuth";
import {
  BadgeCheck,
  Layers,
  LogOut,
  Menu,
  User as UserIcon,
  Users,
} from "lucide-vue-next";

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
    class="bg-gradient-to-r mb-2 from-violet-100 to-violet-50 dark:from-violet-950 dark:to-dusk-800 w-5/6 place-self-center mt-2 rounded-xl p-3"
  >
    <!-- Desktop Layout - show above 1000px -->
    <div class="flex max-[1000px]:hidden relative items-end justify-around">
      <!-- Left: Guardian Connector Logo -->
      <HeaderBrand />

      <!-- Tab with Community Name -->
      <div
        class="tab-container flex absolute left-[32%] min-[1109px]:left-[29%] min-[1230px]:left-[27%] -bottom-3 flex-col items-center t-[32%]"
      >
        <NuxtLink to="/" class="tab-trigger active">
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
        </NuxtLink>
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
          <div
            class="text-sm max-[1200px]:text-xs text-gray-700 dark:text-dusk-300"
          >
            {{ t("auth.welcome", { user: (user as User)?.auth0 || "User" }) }}
            <span
              v-if="(user as User)?.roles?.length"
              class="text-xs max-[1200px]:text-[10px] text-gray-500 dark:text-dusk-400"
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
            class="text-gray-600 hover:text-gray-900 dark:text-dusk-400 dark:hover:text-dusk-100 transition-colors text-sm max-[1200px]:text-xs"
          >
            {{ t("auth.signOut") }}
          </button>
        </div>

        <!-- User Management -->
        <div
          v-if="isAuth0Configured && loggedIn && isAdmin"
          class="relative group"
        >
          <NuxtLink
            to="/admin/users"
            class="w-10 h-10 rounded-full bg-white dark:bg-dusk-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dusk-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 dark:focus:ring-offset-dusk-800"
          >
            <Users class="w-5 h-5 text-gray-600 dark:text-dusk-300" />
          </NuxtLink>
          <!-- Tooltip -->
          <div
            class="absolute right-0 mt-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-dusk-600 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap"
          >
            {{ t("auth.userManagement") }}
          </div>
        </div>

        <!-- Theme Toggle -->
        <div class="relative group">
          <ThemeToggle theme="white" variant="icon" />
          <!-- Tooltip -->
          <div
            class="absolute right-0 mt-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-dusk-600 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap"
          >
            {{ t("header.themeToggle") }}
          </div>
        </div>

        <!-- Language Picker -->
        <div class="relative group">
          <GlobeLanguagePicker theme="white" variant="icon" />
          <!-- Tooltip -->
          <div
            class="absolute right-0 mt-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-dusk-600 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap"
          >
            {{ t("header.languagePicker") }}
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Layout - show below 1000px -->
    <div class="hidden max-[1000px]:flex items-center justify-between">
      <!-- Left: Guardian Connector Logo -->
      <HeaderBrand />

      <!-- Right: User Icon and Hamburger Menu -->
      <div class="flex items-center space-x-2">
        <!-- User Icon with Checkmark (if logged in) -->
        <div v-if="isAuth0Configured && loggedIn" class="relative">
          <div
            class="w-10 h-10 rounded-full bg-white dark:bg-dusk-700 border-2 border-green-500 flex items-center justify-center relative"
          >
            <UserIcon class="w-6 h-6 text-green-500" />
            <BadgeCheck
              class="absolute -top-1 -right-1 w-4 h-4 text-green-500 bg-white dark:bg-dusk-700 rounded-full"
            />
          </div>
        </div>

        <!-- Hamburger Menu Button -->
        <button
          @click="toggleMobileMenu"
          class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-violet-200 dark:hover:bg-dusk-600 transition-colors"
          aria-label="Menu"
        >
          <Menu class="w-6 h-6 text-gray-700 dark:text-dusk-200" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <div
      v-if="mobileMenuOpen && isAuth0Configured && loggedIn"
      class="hidden max-[1000px]:block mt-4 p-4 bg-white dark:bg-dusk-800 rounded-lg border border-violet-200 dark:border-dusk-700 shadow-lg"
    >
      <!-- Welcome Message -->
      <div class="mb-4 pb-4 border-b border-violet-200 dark:border-dusk-700">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 rounded-full bg-white dark:bg-dusk-700 border-2 border-green-500 flex items-center justify-center relative"
          >
            <UserIcon class="w-6 h-6 text-green-500" />
            <BadgeCheck
              class="absolute -top-1 -right-1 w-4 h-4 text-green-500 bg-white dark:bg-dusk-700 rounded-full"
            />
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-dusk-100">
              {{ t("auth.welcome", { user: (user as User)?.auth0 || "User" }) }}
            </p>
            <p
              v-if="(user as User)?.roles?.length"
              class="text-xs text-gray-500 dark:text-dusk-400"
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
        class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-violet-50 dark:hover:bg-dusk-700 transition-colors mb-2"
      >
        <Users class="w-5 h-5 text-gray-600 dark:text-dusk-300" />
        <span class="text-sm text-gray-700 dark:text-dusk-200">{{
          t("auth.userManagement")
        }}</span>
      </NuxtLink>

      <!-- Theme Toggle -->
      <ThemeToggle variant="mobile" />

      <!-- Language Picker -->
      <GlobeLanguagePicker variant="mobile" />

      <!-- Sign Out -->
      <button
        @click="
          logout();
          mobileMenuOpen = false;
        "
        class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left"
      >
        <LogOut class="w-5 h-5 text-red-600 dark:text-red-300" />
        <span class="text-sm text-red-600 dark:text-red-300 font-medium">{{
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
