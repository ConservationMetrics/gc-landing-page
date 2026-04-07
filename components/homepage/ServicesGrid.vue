<script lang="ts" setup>
import { computed } from "vue";
import { useI18n, useRuntimeConfig, useUserSession } from "#imports";
import { Smile } from "lucide-vue-next";
import { Role, type User } from "~/types/types";

const config = useRuntimeConfig();
const communityName = config.public.communityName;
const domain = config.public.domain;
const { t } = useI18n();
const { user } = useUserSession();

const availableServices = computed(() => {
  const services: Array<{
    name: string;
    url: string;
    icon: string;
    tags: string[];
  }> = [];
  const typedUser = user.value as User | undefined;
  const userRole = typedUser?.userRole ?? Role.SignedIn;

  if (config.public.explorerEnabled && userRole >= Role.SignedIn) {
    services.push({
      name: "Explorer",
      url: `https://explorer.${communityName}.${domain}`,
      icon: "explorer",
      tags: [
        "Maps",
        "Alerts Dashboard",
        "Wildlife Explorer",
        "Media Galleries",
      ],
    });
  }

  if (config.public.supersetEnabled && userRole >= Role.Guest) {
    services.push({
      name: "Superset",
      url: `https://superset.${communityName}.${domain}`,
      icon: "superset",
      tags: ["Charts", "Analysis", "Visualizations", "Dashboards"],
    });
  }

  if (config.public.windmillEnabled && userRole >= Role.Admin) {
    services.push({
      name: "Windmill",
      url: `https://windmill.${communityName}.${domain}`,
      icon: "windmill",
      tags: ["Data Flows", "Scheduled Jobs", "Data Apps"],
    });
  }

  if (config.public.filebrowserEnabled && userRole >= Role.Member) {
    services.push({
      name: "Filebrowser",
      url: `https://files.${communityName}.${domain}`,
      icon: "filebrowser",
      tags: ["Files", "Raw Data", "Archives"],
    });
  }

  return services;
});

const openService = (url: string) => {
  if (url.startsWith("/")) {
    window.location.href = url;
  } else {
    window.open(url, "_blank");
  }
};

const getServiceDescription = (serviceName: string) => {
  const descriptions = {
    Superset: t("services.supersetDescription"),
    Windmill: t("services.windmillDescription"),
    Explorer: t("services.explorerDescription"),
    Filebrowser: t("services.filebrowserDescription"),
  };
  return (
    descriptions[serviceName as keyof typeof descriptions] ||
    t("services.communityService")
  );
};

const translateTag = (tag: string) => {
  const tagMap: Record<string, string> = {
    Maps: t("services.tags.maps"),
    "Alerts Dashboard": t("services.tags.alertsDashboard"),
    "Wildlife Explorer": t("services.tags.wildlifeExplorer"),
    "Media Galleries": t("services.tags.mediaGalleries"),
    Charts: t("services.tags.charts"),
    Analysis: t("services.tags.analysis"),
    Visualizations: t("services.tags.visualizations"),
    Dashboards: t("services.tags.dashboards"),
    "Data Flows": t("services.tags.dataFlows"),
    "Scheduled Jobs": t("services.tags.scheduledJobs"),
    "Data Apps": t("services.tags.dataApps"),
    Files: t("services.tags.files"),
    "Raw Data": t("services.tags.rawData"),
    Archives: t("services.tags.archives"),
  };
  return tagMap[tag] || tag;
};
</script>

<template>
  <div>
    <div
      v-if="availableServices.length > 0"
      class="flex flex-wrap justify-center gap-6"
    >
      <div
        v-for="service in availableServices"
        :key="service.name"
        class="flex w-full max-w-sm cursor-pointer flex-col rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100 p-6 transition-all duration-200 hover:shadow-lg md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
        @click="openService(service.url)"
      >
        <div class="mb-4 flex justify-center">
          <div
            v-if="service.icon === 'explorer'"
            class="flex h-[67px] w-[67px] items-center justify-center"
          >
            <img
              src="/gcexplorer.png"
              :alt="service.name"
              class="h-[67px] w-[67px] object-contain"
            />
          </div>
          <div
            v-else-if="service.icon === 'superset'"
            class="flex h-[83px] w-[83px] items-center justify-center"
          >
            <img
              src="/superset.png"
              :alt="service.name"
              class="h-[83px] max-w-24 w-[83px] object-contain"
            />
          </div>
          <div
            v-else-if="service.icon === 'windmill'"
            class="flex h-[67px] w-[67px] items-center justify-center"
          >
            <img
              src="/windmill.svg"
              :alt="service.name"
              class="h-[67px] w-[67px] object-contain"
            />
          </div>
          <div
            v-else-if="service.icon === 'filebrowser'"
            class="flex h-[67px] w-[67px] items-center justify-center"
          >
            <img
              src="/filebrowser.png"
              :alt="service.name"
              class="h-[67px] w-[67px] object-contain"
            />
          </div>
        </div>

        <h3 class="mb-3 text-center text-xl font-bold text-gray-900">
          {{ service.name }}
        </h3>

        <p class="mb-4 min-h-[3rem] text-center text-sm text-gray-600">
          {{ getServiceDescription(service.name) }}
        </p>

        <div class="flex flex-wrap justify-center gap-2">
          <span
            v-for="tag in service.tags"
            :key="tag"
            class="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700"
          >
            {{ translateTag(tag) }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="py-16 text-center">
      <div
        class="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <div
          class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-300"
        >
          <Smile class="h-8 w-8 text-gray-500" />
        </div>
        <h3 class="mb-2 text-xl font-semibold text-gray-900">
          {{ t("services.noServicesAvailable") }}
        </h3>
        <p class="mb-4 text-gray-600">
          {{ t("services.noServicesDescription") }}
        </p>
      </div>
    </div>
  </div>
</template>
