<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "#imports";
import { Moon, Sun } from "lucide-vue-next";
import { useTheme } from "@/composables/useTheme";

interface Props {
  theme?: "violet" | "white" | "hero";
  variant?: "icon" | "mobile";
}

const props = withDefaults(defineProps<Props>(), {
  theme: "white",
  variant: "icon",
});

const { t } = useI18n();
const { isDark, toggleTheme } = useTheme();

const ariaLabel = computed(() =>
  isDark.value ? t("theme.switchToLight") : t("theme.switchToDark"),
);
</script>

<template>
  <!-- Desktop Icon Variant -->
  <button
    v-if="variant === 'icon'"
    type="button"
    :aria-label="ariaLabel"
    :class="[
      'relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus:outline-none',
      props.theme === 'hero'
        ? 'border border-white/40 bg-white/15 shadow-sm backdrop-blur-md hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/50'
        : 'bg-white hover:bg-gray-50 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:bg-slate-700 dark:hover:bg-slate-600 dark:focus:ring-offset-slate-800',
    ]"
    @click="toggleTheme"
  >
    <Sun
      v-if="isDark"
      :class="[
        'h-5 w-5',
        props.theme === 'hero' ? 'text-white' : 'text-slate-300',
      ]"
    />
    <Moon
      v-else
      :class="[
        'h-5 w-5',
        props.theme === 'hero' ? 'text-white' : 'text-gray-600',
      ]"
    />
  </button>

  <!-- Mobile Variant -->
  <div v-else-if="variant === 'mobile'" class="px-4 py-3 mb-2">
    <button
      @click="toggleTheme"
      class="w-full flex items-center justify-between space-x-3 hover:bg-violet-50 dark:hover:bg-slate-700 rounded-lg px-2 py-2 transition-colors"
    >
      <div class="flex items-center space-x-3">
        <component
          :is="isDark ? Sun : Moon"
          class="w-5 h-5 text-gray-600 dark:text-slate-300"
        />
        <span class="text-sm text-gray-700 dark:text-slate-200 font-medium">
          {{ t("header.themeToggle") }}
        </span>
      </div>
      <span class="text-xs text-gray-500 dark:text-slate-400">
        {{ isDark ? t("theme.dark") : t("theme.light") }}
      </span>
    </button>
  </div>
</template>
