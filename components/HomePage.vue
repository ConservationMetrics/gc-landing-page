<script lang="ts" setup>
import { useRuntimeConfig } from "#imports";
import HoverTooltip from "@/components/shared/HoverTooltip.vue";
import ServicesGrid from "@/components/homepage/ServicesGrid.vue";
import DataSourcesGrid from "@/components/homepage/DataSourcesGrid.vue";
import { Workflow } from "lucide-vue-next";

const props = defineProps<{
  isAuth0Configured: boolean;
  loggedIn: boolean;
  shouldShowApp: boolean;
}>();

const emit = defineEmits<{
  login: [];
}>();

const config = useRuntimeConfig();
const communityName = config.public.communityName;
const logoUrl = config.public.logoUrl as string | undefined;
const { t } = useI18n();
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white dark:bg-slate-900">
    <main class="mx-auto mt-10 max-w-7xl px-4 pb-12 pt-0 sm:px-6 lg:px-8">
      <div class="pt-0">
        <div v-if="logoUrl" class="mb-8 flex justify-center">
          <img
            :src="logoUrl"
            :alt="communityName + ' logo'"
            class="max-h-32 w-auto object-contain"
          />
        </div>

        <div class="mb-12 text-center">
          <h2 class="mb-4 text-4xl font-bold text-gray-900 dark:text-slate-100">
            {{ t("app.welcome") }}
          </h2>
          <p
            class="mx-auto max-w-3xl text-xl text-gray-600 dark:text-slate-400"
          >
            <i18n-t
              keypath="app.welcomeSubtitle"
              tag="span"
              :values="{ communityName }"
            >
              <template #gc>
                <HoverTooltip :content="t('app.guardianConnectorTooltip')">
                  Guardian Connector
                </HoverTooltip>
              </template>
            </i18n-t>
          </p>
        </div>

        <ServicesGrid v-if="props.shouldShowApp" />

        <div
          v-if="props.shouldShowApp"
          class="relative my-12"
          aria-hidden="true"
        >
          <div class="absolute inset-0 flex items-center">
            <div
              class="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-700 to-transparent"
            ></div>
          </div>
          <div class="relative flex justify-center">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-emerald-100 dark:from-violet-900/40 dark:to-emerald-900/40 ring-1 ring-gray-200 dark:ring-slate-700"
            >
              <Workflow class="h-5 w-5 text-gray-600 dark:text-slate-300" />
            </div>
          </div>
        </div>

        <DataSourcesGrid v-if="props.shouldShowApp" />

        <div v-if="props.shouldShowApp" class="mb-8 mt-8 text-center">
          <p class="text-sm italic text-gray-600 dark:text-slate-400">
            {{ t("services.needHelp") }}
            <a
              href="https://docs.guardianconnector.net"
              target="_blank"
              rel="noopener noreferrer"
              class="text-violet-600 dark:text-violet-300 underline hover:text-violet-700 dark:hover:text-violet-200"
            >
              {{ t("services.documentationWebsite") }} </a
            >.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
