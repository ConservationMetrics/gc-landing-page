export const THEME_SETTING_KEYS = ["logo_url", "background_image"] as const;

export type ThemeSettingKey = (typeof THEME_SETTING_KEYS)[number];

export type ThemeSettingsMap = Record<ThemeSettingKey, string>;

export const isThemeSettingKey = (key: string): key is ThemeSettingKey =>
  (THEME_SETTING_KEYS as readonly string[]).includes(key);

/** Empty clears the setting; absolute http(s) URLs and root-relative paths are allowed. */
export const isValidThemeUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const emptyThemeSettings = (): ThemeSettingsMap =>
  Object.fromEntries(
    THEME_SETTING_KEYS.map((key) => [key, ""]),
  ) as ThemeSettingsMap;
