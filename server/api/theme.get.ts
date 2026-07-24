import { getThemeSettings } from "~/server/utils/themeSettings";

/** Public: logo and background are site branding, not secrets. */
export default defineEventHandler(async () => {
  try {
    const settings = await getThemeSettings();
    return { success: true, settings };
  } catch (error) {
    console.error("Error fetching theme settings:", error);
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
