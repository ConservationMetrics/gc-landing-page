<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { $fetch } from "ofetch";
import { navigateTo, refreshNuxtData, useI18n } from "#imports";
import {
  Check,
  Home,
  Image,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-vue-next";

type ThemeKey = "logo_url" | "background_image";
type FieldStatus = "idle" | "saving" | "saved" | "error";

interface ThemeSettingsResponse {
  success: boolean;
  settings: Record<ThemeKey, string>;
}

interface ThemeSaveResponse {
  success: boolean;
  key: ThemeKey;
  value: string;
}

const DEBOUNCE_MS = 700;
const SAVED_FLASH_MS = 2000;

const { t } = useI18n();

const loading = ref(true);
const loadError = ref("");

const fields = reactive<Record<ThemeKey, string>>({
  logo_url: "",
  background_image: "",
});

const saved = reactive<Record<ThemeKey, string>>({
  logo_url: "",
  background_image: "",
});

const status = reactive<Record<ThemeKey, FieldStatus>>({
  logo_url: "idle",
  background_image: "idle",
});

const fieldErrors = reactive<Record<ThemeKey, string>>({
  logo_url: "",
  background_image: "",
});

const debounceTimers: Partial<Record<ThemeKey, ReturnType<typeof setTimeout>>> =
  {};
const savedFlashTimers: Partial<
  Record<ThemeKey, ReturnType<typeof setTimeout>>
> = {};
const inFlight = new Map<ThemeKey, number>();

const fieldDefs = computed(() => [
  {
    key: "logo_url" as const,
    label: t("themeSettings.logoUrl"),
    hint: t("themeSettings.logoUrlHint"),
    placeholder: t("themeSettings.logoUrlPlaceholder"),
    icon: Sparkles,
  },
  {
    key: "background_image" as const,
    label: t("themeSettings.backgroundImage"),
    hint: t("themeSettings.backgroundImageHint"),
    placeholder: t("themeSettings.backgroundImagePlaceholder"),
    icon: Image,
  },
]);

const clearTimers = () => {
  for (const key of Object.keys(debounceTimers) as ThemeKey[]) {
    clearTimeout(debounceTimers[key]);
  }
  for (const key of Object.keys(savedFlashTimers) as ThemeKey[]) {
    clearTimeout(savedFlashTimers[key]);
  }
};

const flashSaved = (key: ThemeKey) => {
  status[key] = "saved";
  clearTimeout(savedFlashTimers[key]);
  savedFlashTimers[key] = setTimeout(() => {
    if (status[key] === "saved") status[key] = "idle";
  }, SAVED_FLASH_MS);
};

const saveField = async (key: ThemeKey) => {
  const value = fields[key].trim();
  if (value === saved[key]) {
    fieldErrors[key] = "";
    if (status[key] !== "saving") status[key] = "idle";
    return;
  }

  const requestId = (inFlight.get(key) ?? 0) + 1;
  inFlight.set(key, requestId);
  status[key] = "saving";
  fieldErrors[key] = "";

  try {
    const response = await $fetch<ThemeSaveResponse>("/api/theme", {
      method: "POST",
      body: { key, value },
    });

    if (inFlight.get(key) !== requestId) return;

    if (response.success) {
      saved[key] = response.value;
      fields[key] = response.value;
      flashSaved(key);
      void refreshNuxtData("gc-theme-settings");
    } else {
      status[key] = "error";
      fieldErrors[key] = t("themeSettings.failedToSave");
    }
  } catch (err: unknown) {
    if (inFlight.get(key) !== requestId) return;
    console.error(`Failed to save theme setting ${key}:`, err);
    status[key] = "error";
    const statusMessage =
      err &&
      typeof err === "object" &&
      "data" in err &&
      err.data &&
      typeof err.data === "object" &&
      "statusMessage" in err.data
        ? String((err.data as { statusMessage?: string }).statusMessage)
        : null;
    fieldErrors[key] = statusMessage || t("themeSettings.failedToSave");
  }
};

const scheduleSave = (key: ThemeKey) => {
  clearTimeout(debounceTimers[key]);
  debounceTimers[key] = setTimeout(() => {
    void saveField(key);
  }, DEBOUNCE_MS);
};

const onInput = (key: ThemeKey) => {
  if (status[key] === "saved") status[key] = "idle";
  scheduleSave(key);
};

const onBlur = (key: ThemeKey) => {
  clearTimeout(debounceTimers[key]);
  void saveField(key);
};

const fetchSettings = async () => {
  loading.value = true;
  loadError.value = "";

  try {
    const response = await $fetch<ThemeSettingsResponse>("/api/theme");
    if (response.success) {
      for (const key of Object.keys(fields) as ThemeKey[]) {
        const value = response.settings[key] ?? "";
        fields[key] = value;
        saved[key] = value;
        status[key] = "idle";
        fieldErrors[key] = "";
      }
    } else {
      loadError.value = t("themeSettings.failedToLoad");
    }
  } catch (err) {
    console.error("Failed to load theme settings:", err);
    loadError.value = t("themeSettings.failedToLoad");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchSettings);
onBeforeUnmount(clearTimers);
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
            {{ t("themeSettings.title") }}
          </h1>
          <p class="text-sm sm:text-base text-gray-600 dark:text-dusk-400">
            {{ t("themeSettings.subtitle") }}
          </p>
        </div>
        <div class="ml-4 flex items-center gap-3">
          <button
            @click="navigateTo('/')"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dusk-200 bg-white dark:bg-dusk-800 border border-gray-300 dark:border-dusk-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dusk-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-dusk-900 transition-colors cursor-pointer"
          >
            {{ t("themeSettings.returnToHomepage") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Header -->
    <div class="mb-4 sm:hidden">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900 dark:text-dusk-100">
          {{ t("themeSettings.title") }}
        </h1>
        <button
          type="button"
          @click="navigateTo('/')"
          class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dusk-700 transition-colors"
          :aria-label="t('themeSettings.returnToHomepage')"
        >
          <Home class="w-6 h-6 text-gray-700 dark:text-dusk-200" />
        </button>
      </div>
    </div>

    <div
      v-if="loadError"
      class="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg"
    >
      <div class="flex">
        <XCircle class="h-5 w-5 text-red-400 dark:text-red-300" />
        <div class="ml-3">
          <p class="text-sm text-red-800 dark:text-red-200">{{ loadError }}</p>
        </div>
      </div>
    </div>

    <div
      class="bg-white dark:bg-dusk-800 rounded-lg shadow-sm border border-gray-200 dark:border-dusk-700 p-3 sm:p-6"
    >
      <div
        v-if="loading"
        class="flex items-center justify-center py-12 text-gray-500 dark:text-dusk-400"
      >
        <Loader2 class="h-6 w-6 animate-spin mr-2" />
        <span class="text-sm">{{ t("themeSettings.loading") }}</span>
      </div>

      <div v-else class="space-y-6">
        <p class="text-sm text-gray-500 dark:text-dusk-400">
          {{ t("themeSettings.autosaveHint") }}
        </p>

        <div v-for="field in fieldDefs" :key="field.key" class="space-y-2">
          <div class="flex items-center justify-between gap-3">
            <label
              :for="`theme-${field.key}`"
              class="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-dusk-100"
            >
              <component
                :is="field.icon"
                class="h-4 w-4 text-violet-600 dark:text-violet-300"
              />
              {{ field.label }}
            </label>

            <div
              class="flex items-center gap-1.5 text-xs min-h-[1.25rem]"
              aria-live="polite"
            >
              <template v-if="status[field.key] === 'saving'">
                <Loader2
                  class="h-3.5 w-3.5 animate-spin text-violet-600 dark:text-violet-300"
                />
                <span class="text-gray-500 dark:text-dusk-400">{{
                  t("themeSettings.saving")
                }}</span>
              </template>
              <template v-else-if="status[field.key] === 'saved'">
                <Check class="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                <span class="text-green-600 dark:text-green-400">{{
                  t("themeSettings.saved")
                }}</span>
              </template>
              <template v-else-if="status[field.key] === 'error'">
                <XCircle class="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                <span class="text-red-600 dark:text-red-300">{{
                  t("themeSettings.error")
                }}</span>
              </template>
            </div>
          </div>

          <input
            :id="`theme-${field.key}`"
            v-model="fields[field.key]"
            type="text"
            inputmode="url"
            autocomplete="off"
            :placeholder="field.placeholder"
            class="w-full px-3 py-2 text-sm sm:text-base bg-white dark:bg-dusk-700 text-gray-900 dark:text-dusk-100 placeholder-gray-400 dark:placeholder-dusk-500 border border-gray-300 dark:border-dusk-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            @input="onInput(field.key)"
            @blur="onBlur(field.key)"
          />

          <p class="text-xs text-gray-500 dark:text-dusk-400">
            {{ field.hint }}
          </p>
          <p
            v-if="fieldErrors[field.key]"
            class="text-xs text-red-600 dark:text-red-300"
          >
            {{ fieldErrors[field.key] }}
          </p>

          <div
            v-if="fields[field.key].trim()"
            class="mt-2 rounded-lg border border-gray-200 dark:border-dusk-700 bg-gray-50 dark:bg-dusk-900/40 p-3"
          >
            <p
              class="mb-2 text-xs font-medium text-gray-500 dark:text-dusk-400 uppercase tracking-wide"
            >
              {{ t("themeSettings.preview") }}
            </p>
            <img
              :key="fields[field.key].trim()"
              :src="fields[field.key].trim()"
              :alt="field.label"
              class="max-h-28 w-auto max-w-full object-contain rounded"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
