<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { SupportedLocale } from "~/types/types";
import { ChevronDown, Globe } from "lucide-vue-next";

const { locale, locales, setLocale } = useI18n();
const { t } = useI18n();

interface Props {
  theme?: "purple" | "white" | "dark" | "hero";
  variant?: "icon" | "mobile";
}

const props = withDefaults(defineProps<Props>(), {
  theme: "white",
  variant: "icon",
});

// Populate available locales from i18n plugin
const availableLocales = computed(() => locales.value);
const currentLocaleName = computed(() => {
  const currentLocale = locales.value.find(
    (lang) => lang.code === locale.value,
  );
  return currentLocale?.name || "";
});

const dropdownOpen = ref(false);
const languagePickerOpen = ref(false);

// Close dropdown when clicking outside (for desktop)
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".language-picker-container")) {
    dropdownOpen.value = false;
  }
};

// Load locale from session storage on mount and set up click outside handler
onMounted(() => {
  const savedLocale = sessionStorage.getItem("locale");
  if (savedLocale && locales.value.some((lang) => lang.code === savedLocale)) {
    setLocale(savedLocale as SupportedLocale);
  }
  if (props.variant !== "mobile") {
    document.addEventListener("click", handleClickOutside);
  }
});

onUnmounted(() => {
  if (props.variant !== "mobile") {
    document.removeEventListener("click", handleClickOutside);
  }
});

const changeLocale = (localeCode: string): void => {
  setLocale(localeCode as SupportedLocale);
  sessionStorage.setItem("locale", localeCode);
  dropdownOpen.value = false;
  languagePickerOpen.value = false;
};

const toggleLanguagePicker = () => {
  languagePickerOpen.value = !languagePickerOpen.value;
};

const dropdownClasses = computed(() => {
  switch (props.theme) {
    case "hero":
      return "origin-top-right absolute right-0 z-50 mt-2 w-56 rounded-xl border border-white/25 bg-stone-900/90 py-1 shadow-xl shadow-stone-950/40 ring-1 ring-white/10 backdrop-blur-xl";
    case "white":
      return "origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50";
    case "dark":
      return "origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-gray-600 z-50";
    case "purple":
    default:
      return "origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-gray-200 z-50";
  }
});

const itemClasses = computed(() => {
  switch (props.theme) {
    case "hero":
      return "block px-4 py-2 text-sm text-stone-100 transition-colors hover:bg-white/15";
    case "white":
      return "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors";
    case "dark":
      return "block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors";
    case "purple":
    default:
      return "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors";
  }
});

// Mobile item classes
const mobileItemClasses = computed(() => {
  return (langCode: string) => [
    "w-full text-left px-4 py-2 rounded-lg text-sm transition-colors",
    locale.value === langCode
      ? "bg-purple-100 text-purple-700 font-medium"
      : "text-gray-700 hover:bg-purple-50",
  ];
});
</script>

<template>
  <!-- Desktop Icon Variant -->
  <div
    v-if="variant === 'icon'"
    class="relative inline-block text-left language-picker-container"
  >
    <div>
      <button
        type="button"
        :class="[
          'relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus:outline-none',
          theme === 'hero'
            ? 'border border-white/40 bg-white/15 shadow-sm backdrop-blur-md hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/50'
            : 'bg-white hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
        ]"
        @click.stop="dropdownOpen = !dropdownOpen"
      >
        <Globe
          :class="[
            'h-5 w-5',
            theme === 'hero' ? 'text-white' : 'text-gray-600',
          ]"
        />
      </button>
    </div>
    <div v-if="dropdownOpen" :class="dropdownClasses" @click.stop>
      <div class="py-1">
        <a
          v-for="lang in availableLocales"
          :key="lang.code"
          href="#"
          :class="itemClasses"
          @click="
            ($event.preventDefault(),
            $event.stopPropagation(),
            changeLocale(lang.code))
          "
        >
          {{ lang.name }}
        </a>
      </div>
    </div>
  </div>

  <!-- Mobile Variant -->
  <div v-else-if="variant === 'mobile'" class="px-4 py-3 mb-2">
    <button
      @click="toggleLanguagePicker"
      class="w-full flex items-center justify-between space-x-3 hover:bg-purple-50 rounded-lg px-2 py-2 transition-colors"
    >
      <div class="flex items-center space-x-3">
        <Globe class="w-5 h-5 text-gray-600" />
        <span class="text-sm text-gray-700 font-medium">{{
          t("header.languagePicker")
        }}</span>
      </div>
      <ChevronDown
        class="w-4 h-4 text-gray-600 transition-transform"
        :class="{ 'rotate-180': languagePickerOpen }"
      />
    </button>
    <div v-if="languagePickerOpen" class="mt-2 space-y-1">
      <button
        v-for="lang in availableLocales"
        :key="lang.code"
        @click="changeLocale(lang.code)"
        :class="mobileItemClasses(lang.code)"
      >
        {{ lang.name }}
      </button>
    </div>
  </div>
</template>
