<script lang="ts" setup>
import { useI18n } from "#imports";

const { t } = useI18n();

interface DataSource {
  name: string;
  url: string;
  logo: string;
  descriptionKey: string;
  tags: string[];
}

const dataSources: DataSource[] = [
  {
    name: "CoMapeo",
    url: "https://comapeo.app/",
    logo: "/comapeo.png",
    descriptionKey: "comapeoDescription",
    tags: ["offlineFirst", "fieldMapping", "threatMonitoring", "mobile"],
  },
  {
    name: "KoboToolbox",
    url: "https://www.kobotoolbox.org/",
    logo: "/kobotoolbox.png",
    descriptionKey: "kobotoolboxDescription",
    tags: ["forms", "surveys", "onlineAndOffline", "mobile"],
  },
  {
    name: "ODK",
    url: "https://getodk.org/",
    logo: "/odk.svg",
    descriptionKey: "odkDescription",
    tags: ["forms", "surveys", "onlineAndOffline", "mobile"],
  },
  {
    name: "Timelapse",
    url: "https://timelapse.ucalgary.ca/",
    logo: "/timelapse.png",
    descriptionKey: "timelapseDescription",
    tags: ["biodiversityMonitoring", "cameraTraps", "imageAnnotation"],
  },
];

const otherIntegrations = [
  "ArcGIS Survey123",
  "Locus Map",
  "Global Forest Watch",
  "SMART",
];
</script>

<template>
  <section>
    <div class="mb-8 text-center">
      <h2 class="mb-3 text-3xl font-bold text-gray-900 dark:text-slate-100">
        {{ t("dataSources.heading") }}
      </h2>
      <p class="mx-auto max-w-2xl text-base text-gray-600 dark:text-slate-400">
        {{ t("dataSources.subheading") }}
      </p>
    </div>

    <div class="flex flex-wrap justify-center gap-6">
      <a
        v-for="source in dataSources"
        :key="source.name"
        :href="source.url"
        target="_blank"
        rel="noopener noreferrer"
        class="flex w-full max-w-sm cursor-pointer flex-col rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/40 p-6 transition-all duration-200 hover:shadow-lg md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
      >
        <div class="mb-4 flex h-[80px] items-center justify-center">
          <img
            :src="source.logo"
            :alt="source.name"
            class="max-h-[80px] w-auto object-contain"
          />
        </div>

        <h3
          class="mb-3 text-center text-xl font-bold text-gray-900 dark:text-slate-100"
        >
          {{ source.name }}
        </h3>

        <p
          class="mb-4 min-h-[3rem] text-center text-sm text-gray-600 dark:text-slate-400"
        >
          {{ t(`dataSources.${source.descriptionKey}`) }}
        </p>

        <div class="mt-auto flex flex-wrap justify-center gap-2">
          <span
            v-for="tag in source.tags"
            :key="tag"
            class="rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-medium text-gray-700 dark:text-slate-300"
          >
            {{ t(`dataSources.tags.${tag}`) }}
          </span>
        </div>
      </a>

      <div
        class="flex w-full max-w-sm cursor-default flex-col rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/40 p-6 md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
      >
        <div class="mb-4 flex h-[80px] items-center justify-center">
          <span
            class="select-none font-mono text-6xl font-bold leading-none text-emerald-700 dark:text-emerald-200"
            aria-hidden="true"
          >
            {&nbsp;}
          </span>
        </div>

        <h3
          class="mb-3 text-center text-xl font-bold text-gray-900 dark:text-slate-100"
        >
          {{ t("dataSources.otherHeading") }}
        </h3>

        <p
          class="mb-4 min-h-[3rem] text-center text-sm text-gray-600 dark:text-slate-400"
        >
          {{ t("dataSources.otherDescription") }}
        </p>

        <div class="mt-auto flex flex-wrap justify-center gap-2">
          <span
            v-for="example in otherIntegrations"
            :key="example"
            class="rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-medium text-gray-700 dark:text-slate-300"
          >
            {{ example }}
          </span>
          <span
            class="rounded-full bg-emerald-200 dark:bg-emerald-900 px-3 py-1 text-xs font-medium italic text-emerald-900 dark:text-emerald-200"
          >
            {{ t("dataSources.andMore") }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
