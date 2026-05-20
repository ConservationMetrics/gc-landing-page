import { computed } from "vue";
import { useCookie } from "#imports";

export type ColorMode = "light" | "dark";

export const useTheme = () => {
  const theme = useCookie<ColorMode>("color-mode", {
    default: () => "light",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  const isDark = computed(() => theme.value === "dark");

  const setTheme = (next: ColorMode) => {
    theme.value = next;
  };

  const toggleTheme = () => {
    theme.value = isDark.value ? "light" : "dark";
  };

  return { theme, isDark, setTheme, toggleTheme };
};
