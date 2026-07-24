import { inArray } from "drizzle-orm";
import { configDb, schema } from "~/server/database/dbConnection";
import {
  THEME_SETTING_KEYS,
  emptyThemeSettings,
  isThemeSettingKey,
  type ThemeSettingsMap,
} from "~/utils/themeSettings";

export {
  THEME_SETTING_KEYS,
  emptyThemeSettings,
  isThemeSettingKey,
  isValidThemeUrl,
  type ThemeSettingKey,
  type ThemeSettingsMap,
} from "~/utils/themeSettings";

export const getThemeSettings = async (): Promise<ThemeSettingsMap> => {
  const settings = emptyThemeSettings();
  const rows = await configDb
    .select()
    .from(schema.gcSettings)
    .where(inArray(schema.gcSettings.key, [...THEME_SETTING_KEYS]));

  for (const row of rows) {
    if (isThemeSettingKey(row.key)) {
      settings[row.key] = row.value;
    }
  }

  return settings;
};
