<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { $fetch } from "ofetch";
import {
  navigateTo,
  refreshNuxtData,
  useI18n,
  useRuntimeConfig,
} from "#imports";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Home,
  LayoutGrid,
  Loader2,
  Plus,
  Trash2,
  XCircle,
} from "lucide-vue-next";
// @ts-expect-error - vue-tags-input does not have types
import { VueTagsInput } from "@vojtechlanka/vue-tags-input";
import type { CustomApp, CustomAppsResponse } from "~/types/types";
import {
  CUSTOM_APPS_MAX,
  CUSTOM_APP_DESCRIPTION_MAX,
  CUSTOM_APP_NAME_MAX,
  CUSTOM_APP_SUBDOMAIN_MAX,
  CUSTOM_APP_TAG_MAX_COUNT,
  CUSTOM_APP_TAG_MAX_LENGTH,
  buildCustomAppUrl,
  emptyCustomApps,
  slugifyCustomAppId,
  validateCustomAppsPayload,
} from "~/utils/customApps";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type Tag = { text: string };
type DraftApp = CustomApp & { clientKey: string; tagDraft: string };

const SAVED_FLASH_MS = 2000;
const API_PATH = "/api/custom_apps/custom-apps";

const { t } = useI18n();
const config = useRuntimeConfig();
const communityName = config.public.communityName as string;
const domain = config.public.domain as string;

const loading = ref(true);
const loadError = ref("");
const saveStatus = ref<SaveStatus>("idle");
const saveError = ref("");

const apps = ref<DraftApp[]>([]);
const savedSnapshot = ref("");

let savedFlashTimer: ReturnType<typeof setTimeout> | undefined;
let clientKeySeq = 0;

const nextClientKey = () => {
  clientKeySeq += 1;
  return `draft-${clientKeySeq}`;
};

const toDraft = (app: CustomApp): DraftApp => ({
  ...app,
  clientKey: nextClientKey(),
  tagDraft: "",
});

const serialize = (list: DraftApp[]) =>
  JSON.stringify(
    list.map(
      ({ clientKey: _clientKey, tagDraft: _tagDraft, ...app }, index) => ({
        ...app,
        sortOrder: index,
      }),
    ),
  );

const isDirty = computed(() => serialize(apps.value) !== savedSnapshot.value);

const canAdd = computed(() => apps.value.length < CUSTOM_APPS_MAX);

const flashSaved = () => {
  saveStatus.value = "saved";
  clearTimeout(savedFlashTimer);
  savedFlashTimer = setTimeout(() => {
    if (saveStatus.value === "saved") saveStatus.value = "idle";
  }, SAVED_FLASH_MS);
};

const getErrorMessage = (err: unknown) => {
  if (
    err &&
    typeof err === "object" &&
    "data" in err &&
    err.data &&
    typeof err.data === "object" &&
    "statusMessage" in err.data
  ) {
    return String((err.data as { statusMessage?: string }).statusMessage);
  }
  return t("customApps.failedToSave");
};

const tagsToObjects = (tags: string[]): Tag[] => tags.map((text) => ({ text }));

const onTagsChanged = (app: DraftApp, newTags: Tag[]) => {
  app.tags = newTags
    .map((tag) => tag.text.trim())
    .filter(Boolean)
    .slice(0, CUSTOM_APP_TAG_MAX_COUNT);
};

const previewUrl = (subdomain: string) => {
  const slug = subdomain.trim();
  if (!slug) return "";
  return buildCustomAppUrl(slug, communityName, domain);
};

const createEmptyApp = (): DraftApp => ({
  clientKey: nextClientKey(),
  id: "",
  name: "",
  description: "",
  iconUrl: "",
  tags: [],
  tagDraft: "",
  subdomain: "",
  enabled: true,
  sortOrder: apps.value.length,
});

const addApp = () => {
  if (!canAdd.value) return;
  apps.value.push(createEmptyApp());
};

const removeApp = (index: number) => {
  apps.value.splice(index, 1);
};

const moveApp = (index: number, delta: number) => {
  const target = index + delta;
  if (target < 0 || target >= apps.value.length) return;
  const copy = [...apps.value];
  const [item] = copy.splice(index, 1);
  copy.splice(target, 0, item);
  apps.value = copy;
};

const onSubdomainInput = (app: DraftApp, value: string) => {
  app.subdomain = value.trim().toLowerCase();
  app.id = slugifyCustomAppId(app.subdomain);
};

const toPayload = (): CustomApp[] =>
  apps.value.map((app, index) => ({
    id:
      app.id ||
      slugifyCustomAppId(app.subdomain) ||
      slugifyCustomAppId(app.name),
    name: app.name.trim(),
    description: app.description.trim(),
    iconUrl: app.iconUrl.trim(),
    tags: app.tags,
    subdomain: app.subdomain.trim().toLowerCase(),
    enabled: app.enabled,
    sortOrder: index,
  }));

const saveApps = async () => {
  if (!isDirty.value || saveStatus.value === "saving") return;

  const payload = toPayload();
  const validated = validateCustomAppsPayload(payload);
  if (!validated.ok) {
    saveStatus.value = "error";
    saveError.value = validated.errors
      .map((error) =>
        error.index >= 0
          ? t("customApps.validationItem", {
              n: error.index + 1,
              message: error.message,
            })
          : error.message,
      )
      .join("; ");
    return;
  }

  saveStatus.value = "saving";
  saveError.value = "";

  try {
    const response = await $fetch<CustomAppsResponse>(API_PATH, {
      method: "PUT",
      body: { apps: validated.apps },
    });

    if (!response.success) {
      saveStatus.value = "error";
      saveError.value = t("customApps.failedToSave");
      return;
    }

    apps.value = response.apps.map(toDraft);
    savedSnapshot.value = serialize(apps.value);
    flashSaved();
    void refreshNuxtData("gc-custom-apps");
  } catch (err: unknown) {
    console.error("Failed to save custom apps:", err);
    saveStatus.value = "error";
    saveError.value = getErrorMessage(err);
  }
};

const fetchApps = async () => {
  loading.value = true;
  loadError.value = "";

  try {
    const response = await $fetch<CustomAppsResponse>(`${API_PATH}?all=1`);
    if (response.success) {
      apps.value = (response.apps ?? emptyCustomApps()).map(toDraft);
      savedSnapshot.value = serialize(apps.value);
      saveStatus.value = "idle";
      saveError.value = "";
    } else {
      loadError.value = t("customApps.failedToLoad");
    }
  } catch (err) {
    console.error("Failed to load custom apps:", err);
    loadError.value = t("customApps.failedToLoad");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchApps);
onBeforeUnmount(() => clearTimeout(savedFlashTimer));
</script>

<template>
  <div class="max-w-7xl mx-auto p-3 sm:p-6">
    <div class="mb-6 sm:mb-8 hidden sm:block">
      <div class="flex justify-between items-start">
        <div>
          <h1
            class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dusk-100 mb-2"
          >
            {{ t("customApps.title") }}
          </h1>
          <p class="text-sm sm:text-base text-gray-600 dark:text-dusk-400">
            {{ t("customApps.subtitle") }}
          </p>
        </div>
        <div class="ml-4 flex items-center gap-3">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dusk-200 bg-white dark:bg-dusk-800 border border-gray-300 dark:border-dusk-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dusk-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-dusk-900 transition-colors cursor-pointer"
            @click="navigateTo('/')"
          >
            {{ t("customApps.returnToHomepage") }}
          </button>
        </div>
      </div>
    </div>

    <div class="mb-4 sm:hidden">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900 dark:text-dusk-100">
          {{ t("customApps.title") }}
        </h1>
        <button
          type="button"
          class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dusk-700 transition-colors"
          :aria-label="t('customApps.returnToHomepage')"
          @click="navigateTo('/')"
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
        <span class="text-sm">{{ t("customApps.loading") }}</span>
      </div>

      <div v-else class="space-y-6">
        <p class="text-sm text-gray-500 dark:text-dusk-400">
          {{ t("customApps.saveHint") }}
        </p>

        <div
          v-if="apps.length === 0"
          class="rounded-lg border border-dashed border-gray-300 dark:border-dusk-600 bg-gray-50 dark:bg-dusk-900/40 px-4 py-10 text-center"
        >
          <LayoutGrid
            class="mx-auto mb-3 h-10 w-10 text-gray-400 dark:text-dusk-500"
          />
          <p
            class="mb-1 text-base font-medium text-gray-900 dark:text-dusk-100"
          >
            {{ t("customApps.emptyTitle") }}
          </p>
          <p class="mb-4 text-sm text-gray-500 dark:text-dusk-400">
            {{ t("customApps.emptyDescription") }}
          </p>
          <button
            type="button"
            class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors cursor-pointer"
            @click="addApp"
          >
            <Plus class="h-4 w-4 mr-2" />
            {{ t("customApps.addApp") }}
          </button>
        </div>

        <div
          v-for="(app, index) in apps"
          :key="app.clientKey"
          class="rounded-lg border border-gray-200 dark:border-dusk-700 p-3 sm:p-4 space-y-4"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm font-semibold text-gray-900 dark:text-dusk-100">
              {{ t("customApps.appLabel", { n: index + 1 }) }}
            </p>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-dusk-700 text-gray-600 dark:text-dusk-300 hover:bg-gray-50 dark:hover:bg-dusk-700 disabled:opacity-40 disabled:cursor-not-allowed"
                :disabled="index === 0"
                :aria-label="t('customApps.moveUp')"
                @click="moveApp(index, -1)"
              >
                <ArrowUp class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-dusk-700 text-gray-600 dark:text-dusk-300 hover:bg-gray-50 dark:hover:bg-dusk-700 disabled:opacity-40 disabled:cursor-not-allowed"
                :disabled="index === apps.length - 1"
                :aria-label="t('customApps.moveDown')"
                @click="moveApp(index, 1)"
              >
                <ArrowDown class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40"
                :aria-label="t('customApps.removeApp')"
                @click="removeApp(index)"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <label
                :for="`custom-app-name-${app.clientKey}`"
                class="text-sm font-medium text-gray-900 dark:text-dusk-100"
              >
                {{ t("customApps.name") }}
              </label>
              <input
                :id="`custom-app-name-${app.clientKey}`"
                v-model="app.name"
                type="text"
                :maxlength="CUSTOM_APP_NAME_MAX"
                autocomplete="off"
                :placeholder="t('customApps.namePlaceholder')"
                class="w-full px-3 py-2 text-sm sm:text-base bg-white dark:bg-dusk-700 text-gray-900 dark:text-dusk-100 placeholder-gray-400 dark:placeholder-dusk-500 border border-gray-300 dark:border-dusk-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div class="space-y-2">
              <label
                :for="`custom-app-subdomain-${app.clientKey}`"
                class="text-sm font-medium text-gray-900 dark:text-dusk-100"
              >
                {{ t("customApps.subdomain") }}
              </label>
              <input
                :id="`custom-app-subdomain-${app.clientKey}`"
                :value="app.subdomain"
                type="text"
                :maxlength="CUSTOM_APP_SUBDOMAIN_MAX"
                autocomplete="off"
                :placeholder="t('customApps.subdomainPlaceholder')"
                class="w-full px-3 py-2 text-sm sm:text-base bg-white dark:bg-dusk-700 text-gray-900 dark:text-dusk-100 placeholder-gray-400 dark:placeholder-dusk-500 border border-gray-300 dark:border-dusk-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                @input="
                  onSubdomainInput(
                    app,
                    ($event.target as HTMLInputElement).value,
                  )
                "
              />
              <p class="text-xs text-gray-500 dark:text-dusk-400 break-all">
                {{ t("customApps.urlPreview") }}:
                {{
                  previewUrl(app.subdomain) || t("customApps.urlPreviewEmpty")
                }}
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <label
              :for="`custom-app-description-${app.clientKey}`"
              class="text-sm font-medium text-gray-900 dark:text-dusk-100"
            >
              {{ t("customApps.description") }}
            </label>
            <textarea
              :id="`custom-app-description-${app.clientKey}`"
              v-model="app.description"
              rows="2"
              :maxlength="CUSTOM_APP_DESCRIPTION_MAX"
              :placeholder="t('customApps.descriptionPlaceholder')"
              class="w-full px-3 py-2 text-sm sm:text-base bg-white dark:bg-dusk-700 text-gray-900 dark:text-dusk-100 placeholder-gray-400 dark:placeholder-dusk-500 border border-gray-300 dark:border-dusk-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            ></textarea>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <label
                :for="`custom-app-icon-${app.clientKey}`"
                class="text-sm font-medium text-gray-900 dark:text-dusk-100"
              >
                {{ t("customApps.iconUrl") }}
              </label>
              <input
                :id="`custom-app-icon-${app.clientKey}`"
                v-model="app.iconUrl"
                type="text"
                inputmode="url"
                autocomplete="off"
                :placeholder="t('customApps.iconUrlPlaceholder')"
                class="w-full px-3 py-2 text-sm sm:text-base bg-white dark:bg-dusk-700 text-gray-900 dark:text-dusk-100 placeholder-gray-400 dark:placeholder-dusk-500 border border-gray-300 dark:border-dusk-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <p class="text-xs text-gray-500 dark:text-dusk-400">
                {{ t("customApps.iconUrlHint") }}
              </p>
              <div
                v-if="app.iconUrl.trim()"
                class="rounded-lg border border-gray-200 dark:border-dusk-700 bg-gray-50 dark:bg-dusk-900/40 p-3"
              >
                <p
                  class="mb-2 text-xs font-medium text-gray-500 dark:text-dusk-400 uppercase tracking-wide"
                >
                  {{ t("customApps.preview") }}
                </p>
                <img
                  :key="app.iconUrl.trim()"
                  :src="app.iconUrl.trim()"
                  :alt="app.name || t('customApps.iconUrl')"
                  class="max-h-20 w-auto max-w-full object-contain rounded"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label
                :for="`custom-app-tags-${app.clientKey}`"
                class="text-sm font-medium text-gray-900 dark:text-dusk-100"
              >
                {{ t("customApps.tags") }}
              </label>
              <VueTagsInput
                :id="`custom-app-tags-${app.clientKey}`"
                v-model="app.tagDraft"
                class="tag-field"
                :tags="tagsToObjects(app.tags)"
                :placeholder="t('customApps.tagsPlaceholder')"
                :max-tags="CUSTOM_APP_TAG_MAX_COUNT"
                :maxlength="CUSTOM_APP_TAG_MAX_LENGTH"
                @tags-changed="(newTags: Tag[]) => onTagsChanged(app, newTags)"
              />
              <p class="text-xs text-gray-500 dark:text-dusk-400">
                {{ t("customApps.tagsHint") }}
              </p>

              <label
                class="mt-4 flex items-center gap-2 text-sm text-gray-900 dark:text-dusk-100 cursor-pointer"
              >
                <input
                  v-model="app.enabled"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 dark:border-dusk-600 text-violet-600 focus:ring-violet-500"
                />
                {{ t("customApps.enabled") }}
              </label>
              <p class="text-xs text-gray-500 dark:text-dusk-400">
                {{ t("customApps.enabledHint") }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="apps.length > 0 || isDirty"
          class="flex flex-wrap items-center gap-3 pt-2"
        >
          <button
            v-if="apps.length > 0 || canAdd"
            type="button"
            :disabled="!canAdd"
            class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-dusk-200 bg-white dark:bg-dusk-800 border border-gray-300 dark:border-dusk-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dusk-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            @click="addApp"
          >
            <Plus class="h-4 w-4 mr-2" />
            {{ t("customApps.addApp") }}
          </button>

          <button
            type="button"
            :disabled="!isDirty || saveStatus === 'saving'"
            class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-dusk-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            @click="saveApps"
          >
            <Loader2
              v-if="saveStatus === 'saving'"
              class="h-4 w-4 animate-spin mr-2"
            />
            {{ t("customApps.save") }}
          </button>

          <div
            class="flex items-center gap-1.5 text-xs min-h-[1.25rem]"
            aria-live="polite"
          >
            <template v-if="saveStatus === 'saving'">
              <span class="text-gray-500 dark:text-dusk-400">{{
                t("customApps.saving")
              }}</span>
            </template>
            <template v-else-if="saveStatus === 'saved'">
              <Check class="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              <span class="text-green-600 dark:text-green-400">{{
                t("customApps.saved")
              }}</span>
            </template>
            <template v-else-if="saveStatus === 'error'">
              <XCircle class="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
              <span class="text-red-600 dark:text-red-300">{{
                saveError || t("customApps.error")
              }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tag-field :deep(.ti-input) {
  @apply w-full min-h-[42px] px-3 py-2 text-sm sm:text-base bg-white dark:bg-dusk-700 text-gray-900 dark:text-dusk-100 border border-gray-300 dark:border-dusk-700 rounded-lg;
}

.tag-field :deep(.ti-new-tag-input) {
  @apply bg-transparent text-gray-900 dark:text-dusk-100 placeholder-gray-400 dark:placeholder-dusk-500;
}

.tag-field :deep(.ti-tag) {
  @apply bg-violet-100 dark:bg-violet-950/50 text-violet-800 dark:text-violet-200 border border-violet-200 dark:border-violet-900;
}
</style>
