<script lang="ts" setup>
import { useRuntimeConfig } from "#imports";
import AppHeader from "@/components/shared/AppHeader.vue";
import HoverTooltip from "@/components/shared/HoverTooltip.vue";
import ServicesGrid from "@/components/homepage/ServicesGrid.vue";
import { Lock } from "lucide-vue-next";

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
  <div class="flex min-h-screen flex-col bg-white">
    <AppHeader />

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
          <h2 class="mb-4 text-4xl font-bold text-gray-900">
            {{ t("app.welcome") }}
          </h2>
          <p class="mx-auto max-w-3xl text-xl text-gray-600">
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

        <div
          v-if="props.isAuth0Configured && !props.loggedIn"
          class="py-16 text-center"
        >
          <div
            class="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
          >
            <div
              class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-violet-600"
            >
              <Lock class="h-8 w-8 text-white" />
            </div>
            <h3 class="mb-4 text-2xl font-bold text-gray-900">
              {{ t("auth.secureAccessRequired") }}
            </h3>
            <p class="mb-6 text-gray-600">
              {{ t("auth.pleaseSignInToAccess") }}
            </p>
            <button
              type="button"
              class="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-blue-700 hover:to-violet-700"
              @click="emit('login')"
            >
              {{ t("auth.signInWithAuth0") }}
            </button>
          </div>
        </div>

        <ServicesGrid v-if="props.shouldShowApp" />

        <div v-if="props.shouldShowApp" class="mb-8 mt-8 text-center">
          <p class="text-sm italic text-gray-600">
            {{ t("services.needHelp") }}
            <a
              href="https://docs.guardianconnector.net"
              target="_blank"
              rel="noopener noreferrer"
              class="text-violet-600 underline hover:text-violet-700"
            >
              {{ t("services.documentationWebsite") }} </a
            >.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
