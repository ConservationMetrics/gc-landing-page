<script lang="ts" setup>
import { ref, computed } from "vue";
import Avatar from "vue-boring-avatars";
import type { UserRole, UserManagementUser } from "~/types/types";

interface Props {
  user: UserManagementUser;
  availableRoles: UserRole[];
  saving: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [user: UserManagementUser, roles: string[], isApproved: boolean, callback: (_result: { success: boolean; error?: string }) => void];
}>();

const isOpen = ref(false);
const selectedRoles = ref<string[]>([]);
const isApproved = ref(false);
const imageError = ref(false);
const isSaving = ref(false);
const saveError = ref("");

// Computed properties
const selectedRoleNames = computed(() => {
  return selectedRoles.value.map(roleId => {
    const role = props.availableRoles.find(r => r.id === roleId);
    return role ? role.name : "Unknown";
  });
});

// Methods
const openModal = () => {
  selectedRoles.value = props.user.roles.map(role => role.id);
  isApproved.value = props.user.isApproved;
  imageError.value = false; // Reset image error state
  isSaving.value = false;
  saveError.value = "";
  isOpen.value = true;
};

const handleImageError = () => {
  imageError.value = true;
};

const closeModal = () => {
  if (!isSaving.value) {
    isOpen.value = false;
  }
};

const handleSave = async () => {
  isSaving.value = true;
  saveError.value = "";
  
  try {
    const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
      emit("update", props.user, selectedRoles.value, isApproved.value, resolve);
    });
    
    if (result.success) {
      isOpen.value = false;
    } else {
      saveError.value = result.error || "Failed to save user";
    }
  } catch (error) {
    saveError.value = "An unexpected error occurred";
    console.error("Save error:", error);
  } finally {
    isSaving.value = false;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleString();
};
</script>

<template>
  <div>
    <button
      @click="openModal"
      :disabled="saving"
      class="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Edit
    </button>

    <!-- Modal -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          @click="closeModal"
        ></div>

        <!-- Modal panel -->
        <div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                  Edit User: {{ user.email }}
                </h3>

                <!-- User Info -->
                <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div class="flex items-center mb-3">
                    <img
                      v-if="user.picture && !imageError"
                      :src="user.picture"
                      :alt="user.name || user.email"
                      class="h-12 w-12 rounded-full mr-3"
                      @error="handleImageError"
                    />
                    <Avatar
                      v-else
                      :size="48"
                      :name="user.name || user.email"
                      variant="marble"
                      class="rounded-full mr-3"
                    />
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.name || user.nickname || "Unknown" }}
                      </div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                  <div class="text-xs text-gray-500">
                    <div>Created: {{ formatDate(user.created_at) }}</div>
                    <div>Last Login: {{ formatDate(user.last_login) }}</div>
                    <div>Logins: {{ user.logins_count }}</div>
                  </div>
                </div>

                <!-- Approval Status -->
                <div class="mb-6">
                  <label class="flex items-center">
                    <input
                      v-model="isApproved"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span class="ml-2 text-sm text-gray-700">User is approved</span>
                  </label>
                  <p class="text-xs text-gray-500 mt-1">
                    Approved users can access the application with their assigned roles
                  </p>
                </div>

                <!-- Roles Selection -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    User Roles
                  </label>
                  <div class="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    <div
                      v-for="role in availableRoles"
                      :key="role.id"
                      class="flex items-start"
                    >
                      <input
                        :id="`role-${role.id}`"
                        v-model="selectedRoles"
                        :value="role.id"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                      />
                      <div class="ml-3">
                        <label :for="`role-${role.id}`" class="text-sm font-medium text-gray-700 cursor-pointer">
                          {{ role.name }}
                        </label>
                        <p v-if="role.description" class="text-xs text-gray-500">
                          {{ role.description }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 mt-2">
                    Selected roles: {{ selectedRoleNames.join(", ") || "None" }}
                  </p>
                </div>

                <!-- Error Display -->
                <div v-if="saveError" class="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-sm text-red-600">{{ saveError }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="handleSave"
              :disabled="isSaving"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSaving ? "Saving..." : "Save Changes" }}
            </button>
            <button
              @click="closeModal"
              :disabled="isSaving"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
