import { computed } from "vue";
import { useFetch } from "#imports";
import type { ThemeSettingsMap } from "~/utils/themeSettings";

interface ThemeSettingsResponse {
  success: boolean;
  settings: ThemeSettingsMap;
}

const DEFAULT_BACKGROUND = "/background.jpg";

export const useThemeSettings = () => {
  const { data, pending, error, refresh } = useFetch<ThemeSettingsResponse>(
    "/api/theme",
    { key: "gc-theme-settings" },
  );

  const logoUrl = computed(() => data.value?.settings?.logo_url?.trim() || "");

  const backgroundImage = computed(() => {
    const url = data.value?.settings?.background_image?.trim() || "";
    return url || DEFAULT_BACKGROUND;
  });

  return { logoUrl, backgroundImage, pending, error, refresh };
};
