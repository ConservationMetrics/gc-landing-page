import {
  defineNuxtRouteMiddleware,
  navigateTo,
  useRuntimeConfig,
} from "#imports";
import type { User } from "~/types/types";
import { Role } from "~/types/types";
import { createError } from "h3";
// Following example: https://github.com/atinux/atidone/blob/main/app/middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, user } = useUserSession();
  const {
    public: { authStrategy },
  } = useRuntimeConfig();
  const router = useRouter();

  // Legacy logout query: prefer /api/auth/logout (clears Auth0 SSO too)
  if (to.query.logout === "true") {
    return navigateTo("/api/auth/logout", { external: true });
  }

  if (authStrategy === "none") {
    if (to.path === "/login") return router.push("/");
    return;
  }

  // Preserve post-login destination across silent Auth0 redirect and LoginScreen.
  if (import.meta.client && !loggedIn.value && to.path !== "/login") {
    sessionStorage.setItem("redirect_url", to.fullPath);
  } else if (import.meta.client && to.path.includes("/login")) {
    const back = window.history.state.back;
    const current = window.history.state.current;

    if (!current.includes("/login") && !back) {
      sessionStorage.setItem("redirect_url", current);
    }
  }

  // Silent SSO: reuse Auth0 tenant session without showing LoginScreen first.
  // On login_required, Auth0 redirects to /login and LoginScreen is shown.
  if (authStrategy === "auth0" && !loggedIn.value && to.path !== "/login") {
    return navigateTo("/api/auth/auth0?silent=1", { external: true });
  }

  if (loggedIn.value && to.path === "/login") {
    if (import.meta.client) {
      const redirectUrl = sessionStorage.getItem("redirect_url");
      if (redirectUrl) {
        sessionStorage.removeItem("redirect_url");
        return navigateTo(redirectUrl);
      }
    }
    return router.push("/");
  }

  // Admin route protection
  if (
    authStrategy === "auth0" &&
    loggedIn.value &&
    to.path.startsWith("/admin")
  ) {
    const userRole = (user.value as User)?.userRole;

    if (!userRole || userRole < Role.Admin) {
      throw createError({
        statusCode: 403,
        statusMessage: "Access denied. Admin privileges required.",
      });
    }
  }
});
