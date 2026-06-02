<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import Avatar from "vue-boring-avatars";
import type {
  UserRole,
  UserManagementUser,
  UsersResponse,
  RolesResponse,
} from "~/types/types";
import UserEditModal from "@/components/userManagement/UserEditModal.vue";
import { translateRoleName } from "@/utils/roleTranslations";
import { navigateTo, useI18n } from "#imports";
import { $fetch } from "ofetch";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Home,
  Search,
  XCircle,
} from "lucide-vue-next";
const { t } = useI18n();

const users = ref<UserManagementUser[]>([]);
const roles = ref<UserRole[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const success = ref("");
const searchQuery = ref("");
const currentPage = ref(0);
const totalUsers = ref(0);
const perPage = ref(20);
const imageErrors = ref<Set<string>>(new Set());

// Computed properties
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  return users.value.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

const totalPages = computed(() => Math.ceil(totalUsers.value / perPage.value));

// Methods
const fetchRoles = async () => {
  try {
    const response = await $fetch<RolesResponse>("/api/roles");
    if (response.success) {
      roles.value = response.roles;
    }
  } catch (err) {
    console.error("Failed to fetch roles:", err);
    error.value = t("userManagement.failedToLoadRoles");
  }
};

const fetchUsers = async (page = 0) => {
  loading.value = true;
  error.value = "";

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.value.toString(),
    });

    if (searchQuery.value) {
      params.append("search", searchQuery.value);
    }

    const response = await $fetch<UsersResponse>(`/api/users?${params}`);

    if (response.success) {
      users.value = response.users;
      totalUsers.value = response.total;
      currentPage.value = response.page;
    }
  } catch (err) {
    console.error("Failed to fetch users:", err);
    error.value = t("userManagement.failedToLoadUsers");
  } finally {
    loading.value = false;
  }
};

const updateUser = async (
  user: UserManagementUser,
  newRoles: string[],
  isApproved: boolean,
  callback?: (_result: { success: boolean; error?: string }) => void,
) => {
  saving.value = true;
  error.value = "";
  success.value = "";

  try {
    const response = await $fetch<{ success: boolean }>(
      `/api/users/${user.id}`,
      {
        method: "PUT",
        body: {
          roles: newRoles,
          isApproved,
        },
      },
    );

    if (response.success) {
      // Update local user data
      const userIndex = users.value.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        users.value[userIndex].isApproved = isApproved;
        users.value[userIndex].roles = roles.value.filter((role) =>
          newRoles.includes(role.id),
        );
      }
      success.value = t("userManagement.userUpdatedSuccessfully", {
        email: user.email,
      });
      setTimeout(() => {
        success.value = "";
      }, 3000);

      // Call the callback with success result
      if (callback) {
        callback({ success: true });
      }
    } else {
      const errorMsg = t("userManagement.failedToUpdateUser", {
        email: user.email,
      });
      error.value = errorMsg;
      if (callback) {
        callback({ success: false, error: errorMsg });
      }
    }
  } catch (err) {
    console.error("Failed to update user:", err);
    const errorMsg = t("userManagement.failedToUpdateUser", {
      email: user.email,
    });
    error.value = errorMsg;
    if (callback) {
      callback({ success: false, error: errorMsg });
    }
  } finally {
    saving.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 0;
  fetchUsers(0);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchUsers(page);
};

/**
 * Returns a local-time timestamp formatted as `dd/MM/yyyy HH:mm`.
 * Falls back to the localized `"userManagement.never"` label when empty.
 */
const formatDate = (dateString: string) => {
  if (!dateString) return t("userManagement.never");
  const d = new Date(dateString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const handleImageError = (userId: string) => {
  imageErrors.value.add(userId);
};

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchRoles(), fetchUsers()]);
});
</script>

<template>
  <div class="max-w-7xl mx-auto p-3 sm:p-6">
    <!-- Desktop Header -->
    <div class="mb-6 sm:mb-8 hidden sm:block">
      <div class="flex justify-between items-start">
        <div>
          <h1
            class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dusk-100 mb-2"
          >
            {{ t("userManagement.title") }}
          </h1>
          <p class="text-sm sm:text-base text-gray-600 dark:text-dusk-400">
            {{ t("userManagement.subtitle") }}
          </p>
        </div>
        <div class="ml-4 flex items-center gap-3">
          <button
            @click="navigateTo('/')"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dusk-200 bg-white dark:bg-dusk-800 border border-gray-300 dark:border-dusk-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dusk-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-dusk-900 transition-colors cursor-pointer"
          >
            {{ t("userManagement.returnToHomepage") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Header -->
    <div class="mb-4 sm:hidden">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <h1 class="text-xl font-bold text-gray-900 dark:text-dusk-100">
            {{ t("userManagement.title") }}
          </h1>
        </div>
        <button
          type="button"
          @click="navigateTo('/')"
          class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dusk-700 transition-colors"
          :aria-label="t('userManagement.returnToHomepage')"
        >
          <Home class="w-6 h-6 text-gray-700 dark:text-dusk-200" />
        </button>
      </div>
    </div>

    <!-- Search and Controls -->
    <div
      class="bg-white dark:bg-dusk-800 rounded-lg shadow-sm border border-gray-200 dark:border-dusk-700 p-3 sm:p-6 mb-4 sm:mb-6"
    >
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div class="flex-1 max-w-md">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('userManagement.searchPlaceholder')"
              class="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base bg-white dark:bg-dusk-700 text-gray-900 dark:text-dusk-100 placeholder-gray-400 dark:placeholder-dusk-500 border border-gray-300 dark:border-dusk-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              @keyup.enter="handleSearch"
            />
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <Search
                class="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-dusk-500"
              />
            </div>
          </div>
        </div>
        <button
          @click="handleSearch"
          :disabled="loading"
          class="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-violet-600 text-white rounded-lg hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{
            loading ? t("userManagement.searching") : t("userManagement.search")
          }}
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div
      v-if="error"
      class="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg"
    >
      <div class="flex">
        <XCircle
          class="h-4 w-4 sm:h-5 sm:w-5 text-red-400 dark:text-red-300 flex-shrink-0 mt-0.5"
        />
        <div class="ml-2 sm:ml-3">
          <p class="text-xs sm:text-sm text-red-800 dark:text-red-200">
            {{ error }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="success"
      class="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-lg"
    >
      <div class="flex">
        <CheckCircle2
          class="h-4 w-4 sm:h-5 sm:w-5 text-green-400 dark:text-green-300 flex-shrink-0 mt-0.5"
        />
        <div class="ml-2 sm:ml-3">
          <p class="text-xs sm:text-sm text-green-800 dark:text-green-200">
            {{ success }}
          </p>
        </div>
      </div>
    </div>

    <!-- Users Table - Desktop -->
    <div
      class="bg-white dark:bg-dusk-800 rounded-lg shadow-sm border border-gray-200 dark:border-dusk-700 overflow-hidden hidden sm:block"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-dusk-700">
          <thead class="bg-gray-50 dark:bg-dusk-700">
            <tr>
              <th
                class="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-dusk-400 uppercase tracking-wider"
              >
                {{ t("userManagement.user") }}
              </th>
              <th
                class="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-dusk-400 uppercase tracking-wider"
              >
                {{ t("userManagement.status") }}
              </th>
              <th
                class="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-dusk-400 uppercase tracking-wider"
              >
                {{ t("userManagement.roles") }}
              </th>
              <th
                class="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-dusk-400 uppercase tracking-wider"
              >
                {{ t("userManagement.lastLogin") }}
              </th>
              <th
                class="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-dusk-400 uppercase tracking-wider"
              >
                {{ t("userManagement.actions") }}
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white dark:bg-dusk-800 divide-y divide-gray-200 dark:divide-dusk-700"
          >
            <tr v-if="loading" class="animate-pulse">
              <td
                colspan="5"
                class="px-4 sm:px-6 py-8 sm:py-12 text-center text-gray-500 dark:text-dusk-400 text-sm"
              >
                {{ t("userManagement.loadingUsers") }}
              </td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td
                colspan="5"
                class="px-4 sm:px-6 py-8 sm:py-12 text-center text-gray-500 dark:text-dusk-400 text-sm"
              >
                {{ t("userManagement.noUsersFound") }}
              </td>
            </tr>
            <tr
              v-else
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-gray-50 dark:hover:bg-dusk-700"
            >
              <td class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                    <img
                      v-if="user.picture && !imageErrors.has(user.id)"
                      :src="user.picture"
                      :alt="user.name || user.email"
                      class="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                      @error="handleImageError(user.id)"
                    />
                    <template v-else>
                      <Avatar
                        :size="32"
                        :name="user.name || user.email"
                        variant="marble"
                        class="rounded-full sm:hidden"
                      />
                      <Avatar
                        :size="40"
                        :name="user.name || user.email"
                        variant="marble"
                        class="rounded-full hidden sm:block"
                      />
                    </template>
                  </div>
                  <div class="ml-2 sm:ml-4">
                    <div
                      class="text-xs sm:text-sm font-medium text-gray-900 dark:text-dusk-100"
                    >
                      {{ user.name || user.nickname || "Unknown" }}
                    </div>
                    <div
                      class="text-xs sm:text-sm text-gray-500 dark:text-dusk-400"
                    >
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    user.isApproved
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200'
                      : 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-200',
                  ]"
                >
                  {{
                    user.isApproved
                      ? t("userManagement.approved")
                      : t("userManagement.pending")
                  }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-3 sm:py-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="role in user.roles"
                    :key="role.id"
                    class="inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 rounded-full"
                  >
                    {{ translateRoleName(role.name, t) }}
                  </span>
                  <span
                    v-if="user.roles.length === 0"
                    class="text-xs sm:text-sm text-gray-500 dark:text-dusk-400"
                  >
                    {{ t("userManagement.noRoles") }}
                  </span>
                </div>
              </td>
              <td
                class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-dusk-400"
              >
                {{ formatDate(user.last_login) }}
              </td>
              <td
                class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium"
              >
                <UserEditModal
                  :user="user"
                  :available-roles="roles"
                  :saving="saving"
                  @update="updateUser"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination - Desktop -->
      <div
        v-if="totalPages > 1"
        class="bg-white dark:bg-dusk-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-dusk-700 sm:px-6"
      >
        <div
          class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-xs sm:text-sm text-gray-700 dark:text-dusk-300">
              {{ t("userManagement.showing") }}
              <span class="font-medium">{{ currentPage * perPage + 1 }}</span>
              {{ t("userManagement.to") }}
              <span class="font-medium">{{
                Math.min((currentPage + 1) * perPage, totalUsers)
              }}</span>
              {{ t("userManagement.of") }}
              <span class="font-medium">{{ totalUsers }}</span>
              {{ t("userManagement.results") }}
            </p>
          </div>
          <div>
            <nav
              class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                @click="handlePageChange(currentPage - 1)"
                :disabled="currentPage === 0"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-dusk-700 bg-white dark:bg-dusk-800 text-sm font-medium text-gray-500 dark:text-dusk-400 hover:bg-gray-50 dark:hover:bg-dusk-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Previous</span>
                <ChevronLeft class="h-5 w-5" />
              </button>
              <button
                v-for="page in Math.min(5, totalPages)"
                :key="page - 1"
                @click="handlePageChange(page - 1)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer',
                  page - 1 === currentPage
                    ? 'z-10 bg-violet-50 dark:bg-violet-950/40 border-violet-500 text-violet-700 dark:text-violet-200'
                    : 'bg-white dark:bg-dusk-800 border-gray-300 dark:border-dusk-700 text-gray-500 dark:text-dusk-400 hover:bg-gray-50 dark:hover:bg-dusk-700',
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="handlePageChange(currentPage + 1)"
                :disabled="currentPage >= totalPages - 1"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-dusk-700 bg-white dark:bg-dusk-800 text-sm font-medium text-gray-500 dark:text-dusk-400 hover:bg-gray-50 dark:hover:bg-dusk-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Next</span>
                <ChevronRight class="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Cards - Mobile -->
    <div class="sm:hidden space-y-3">
      <div
        v-if="loading"
        class="text-center py-8 text-sm text-gray-500 dark:text-dusk-400"
      >
        {{ t("userManagement.loadingUsers") }}
      </div>
      <div
        v-else-if="filteredUsers.length === 0"
        class="text-center py-8 text-sm text-gray-500 dark:text-dusk-400"
      >
        {{ t("userManagement.noUsersFound") }}
      </div>
      <div
        v-else
        v-for="user in filteredUsers"
        :key="user.id"
        class="bg-white dark:bg-dusk-800 rounded-lg shadow-sm border border-gray-200 dark:border-dusk-700 p-3"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center flex-1 min-w-0">
            <div class="flex-shrink-0 h-8 w-8 mr-2">
              <img
                v-if="user.picture && !imageErrors.has(user.id)"
                :src="user.picture"
                :alt="user.name || user.email"
                class="h-8 w-8 rounded-full"
                @error="handleImageError(user.id)"
              />
              <Avatar
                v-else
                :size="32"
                :name="user.name || user.email"
                variant="marble"
                class="rounded-full"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div
                class="text-xs font-medium text-gray-900 dark:text-dusk-100 truncate"
              >
                {{ user.name || user.nickname || "Unknown" }}
              </div>
              <div class="text-xs text-gray-500 dark:text-dusk-400 truncate">
                {{ user.email }}
              </div>
            </div>
          </div>
          <div class="ml-2">
            <UserEditModal
              :user="user"
              :available-roles="roles"
              :saving="saving"
              @update="updateUser"
            />
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 mt-2">
          <span
            :class="[
              'inline-flex px-2 py-0.5 text-xs font-semibold rounded-full',
              user.isApproved
                ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200'
                : 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-200',
            ]"
          >
            {{
              user.isApproved
                ? t("userManagement.approved")
                : t("userManagement.pending")
            }}
          </span>
          <span
            v-for="role in user.roles"
            :key="role.id"
            class="inline-flex px-2 py-0.5 text-xs font-medium bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 rounded-full"
          >
            {{ translateRoleName(role.name, t) }}
          </span>
          <span
            v-if="user.roles.length === 0"
            class="text-xs text-gray-500 dark:text-dusk-400"
          >
            {{ t("userManagement.noRoles") }}
          </span>
        </div>
        <div class="mt-2 text-xs text-gray-500 dark:text-dusk-400">
          {{ t("userManagement.lastLogin") }}: {{ formatDate(user.last_login) }}
        </div>
      </div>

      <!-- Pagination - Mobile -->
      <div v-if="totalPages > 1" class="flex justify-between pt-3">
        <button
          @click="handlePageChange(currentPage - 1)"
          :disabled="currentPage === 0"
          class="relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-dusk-700 text-xs font-medium rounded-md text-gray-700 dark:text-dusk-200 bg-white dark:bg-dusk-800 hover:bg-gray-50 dark:hover:bg-dusk-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ t("userManagement.previous") }}
        </button>
        <button
          @click="handlePageChange(currentPage + 1)"
          :disabled="currentPage >= totalPages - 1"
          class="relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-dusk-700 text-xs font-medium rounded-md text-gray-700 dark:text-dusk-200 bg-white dark:bg-dusk-800 hover:bg-gray-50 dark:hover:bg-dusk-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ t("userManagement.next") }}
        </button>
      </div>
    </div>
  </div>
</template>
