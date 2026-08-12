import { computed } from "vue";
import { useFetch, useUserSession } from "#imports";
import {
  Role,
  type CustomAppsResponse,
  type User,
} from "~/types/types";
import { CUSTOM_APP_MIN_ROLE, emptyCustomApps } from "~/utils/customApps";

/**
 * Fetches enabled custom apps for the homepage grid.
 * Skips the request below CUSTOM_APP_MIN_ROLE (Member); that gate is hardcoded
 * for now and may become configurable later.
 */
export const useCustomApps = () => {
  const { user } = useUserSession();

  const userRole = computed(
    () => (user.value as User | undefined)?.userRole ?? Role.SignedIn,
  );

  const canViewCustomApps = computed(
    () => userRole.value >= CUSTOM_APP_MIN_ROLE,
  );

  const { data, pending, error, refresh } = useFetch<CustomAppsResponse>(
    () => (canViewCustomApps.value ? "/api/custom_apps/custom-apps" : null),
    {
      key: "gc-custom-apps",
      default: () => ({ success: true, apps: emptyCustomApps() }),
    },
  );

  const apps = computed(() =>
    canViewCustomApps.value ? (data.value?.apps ?? emptyCustomApps()) : [],
  );

  return { apps, pending, error, refresh, canViewCustomApps };
};
