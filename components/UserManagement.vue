<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import Avatar from "vue-boring-avatars";
import type { UserRole, UserManagementUser, UsersResponse, RolesResponse } from "~/types/types";
import LanguagePicker from "@/components/shared/LanguagePicker.vue";
import { translateRoleName } from "@/utils/roleTranslations";
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
  return users.value.filter(user => 
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
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
    error.value = t('userManagement.failedToLoadRoles');
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
      console.log("Response users:", response.users);
      users.value = response.users;
      totalUsers.value = response.total;
      currentPage.value = response.page;
    }
  } catch (err) {
    console.error("Failed to fetch users:", err);
    error.value = t('userManagement.failedToLoadUsers');
  } finally {
    loading.value = false;
  }
};

const updateUser = async (user: UserManagementUser, newRoles: string[], isApproved: boolean, callback?: (_result: { success: boolean; error?: string }) => void) => {
  saving.value = true;
  error.value = "";
  success.value = "";
  
  try {
    const response = await $fetch<{ success: boolean }>(`/api/users/${user.id}`, {
      method: "PUT",
      body: {
        roles: newRoles,
        isApproved,
      },
    });
    
    if (response.success) {
      // Update local user data
      const userIndex = users.value.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users.value[userIndex].isApproved = isApproved;
        users.value[userIndex].roles = roles.value.filter(role => 
          newRoles.includes(role.id)
        );
      }
      success.value = t('userManagement.userUpdatedSuccessfully', { email: user.email });
      setTimeout(() => { success.value = ""; }, 3000);
      
      // Call the callback with success result
      if (callback) {
        callback({ success: true });
      }
    } else {
      const errorMsg = t('userManagement.failedToUpdateUser', { email: user.email });
      error.value = errorMsg;
      if (callback) {
        callback({ success: false, error: errorMsg });
      }
    }
  } catch (err) {
    console.error("Failed to update user:", err);
    const errorMsg = t('userManagement.failedToUpdateUser', { email: user.email });
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

const formatDate = (dateString: string) => {
  if (!dateString) return t('userManagement.never');
  return new Date(dateString).toLocaleDateString();
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
  <div class="max-w-7xl mx-auto p-6">
    <div class="mb-8">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('userManagement.title') }}</h1>
          <p class="text-gray-600">{{ t('userManagement.subtitle') }}</p>
        </div>
        <div class="ml-4 flex items-center gap-3">
          <button
            @click="navigateTo('/')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {{ t("userManagement.returnToHomepage") }}
          </button>
          <LanguagePicker theme="white" />
        </div>
      </div>
    </div>

    <!-- Search and Controls -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div class="flex-1 max-w-md">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('userManagement.searchPlaceholder')"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keyup.enter="handleSearch"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <button
          @click="handleSearch"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? t('userManagement.searching') : t('userManagement.search') }}
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-if="success" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex">
        <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <div class="ml-3">
          <p class="text-sm text-green-800">{{ success }}</p>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('userManagement.user') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('userManagement.status') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('userManagement.roles') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('userManagement.lastLogin') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('userManagement.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                {{ t('userManagement.loadingUsers') }}
              </td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                {{ t('userManagement.noUsersFound') }}
              </td>
            </tr>
            <tr v-else v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      v-if="user.picture && !imageErrors.has(user.id)"
                      :src="user.picture"
                      :alt="user.name || user.email"
                      class="h-10 w-10 rounded-full"
                      @error="handleImageError(user.id)"
                    />
                    <Avatar
                      v-else
                      :size="40"
                      :name="user.name || user.email"
                      variant="marble"
                      class="rounded-full"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.name || user.nickname || "Unknown" }}
                    </div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    user.isApproved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ user.isApproved ? t('userManagement.approved') : t('userManagement.pending') }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="role in user.roles"
                    :key="role.id"
                    class="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {{ translateRoleName(role.name, t) }}
                  </span>
                  <span v-if="user.roles.length === 0" class="text-sm text-gray-500">
                    {{ t('userManagement.noRoles') }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.last_login) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
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

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="handlePageChange(currentPage - 1)"
            :disabled="currentPage === 0"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('userManagement.previous') }}
          </button>
          <button
            @click="handlePageChange(currentPage + 1)"
            :disabled="currentPage >= totalPages - 1"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('userManagement.next') }}
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              {{ t('userManagement.showing') }}
              <span class="font-medium">{{ currentPage * perPage + 1 }}</span>
              {{ t('userManagement.to') }}
              <span class="font-medium">{{ Math.min((currentPage + 1) * perPage, totalUsers) }}</span>
              {{ t('userManagement.of') }}
              <span class="font-medium">{{ totalUsers }}</span>
              {{ t('userManagement.results') }}
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="handlePageChange(currentPage - 1)"
                :disabled="currentPage === 0"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Previous</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <button
                v-for="page in Math.min(5, totalPages)"
                :key="page - 1"
                @click="handlePageChange(page - 1)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page - 1 === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="handlePageChange(currentPage + 1)"
                :disabled="currentPage >= totalPages - 1"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Next</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
