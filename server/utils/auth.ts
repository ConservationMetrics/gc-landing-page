import type { H3Event } from "h3";
import { Role } from "~/types/types";
import type { User } from "~/types/types";

/**
 * Enforces that the current request is made by an authenticated user at or above
 * the given role.
 *
 * @param {H3Event} event - Nuxt server event.
 * @param {Role} minRole - Minimum required role.
 * @returns {Promise<User>} The authenticated user from session.
 * @throws {Error} 401 when no session user exists (skipped when authStrategy is "none").
 * @throws {Error} 403 when user is authenticated but below minRole.
 */
const requireMinRoleSession = async (
  event: H3Event,
  minRole: Role,
): Promise<User> => {
  const {
    public: { authStrategy },
  } = useRuntimeConfig();
  const session = await getUserSession(event);

  if (authStrategy === "none") {
    return session.user as User;
  }

  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const user = session.user as User;
  const userRole = user.userRole ?? Role.SignedIn;

  if (userRole < minRole) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  return user;
};

export const requireMemberSession = (event: H3Event): Promise<User> =>
  requireMinRoleSession(event, Role.Member);

export const requireAdminSession = (event: H3Event): Promise<User> =>
  requireMinRoleSession(event, Role.Admin);
