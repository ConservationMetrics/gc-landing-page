import type { H3Event } from "h3";
import { Role } from "~/types/types";
import type { User } from "~/types/types";

/**
 * Enforces that the current request is made by an authenticated admin user.
 *
 * @param {H3Event} event - Nuxt server event.
 * @returns {Promise<User>} The authenticated user from session.
 * @throws {Error} 401 when no session user exists.
 * @throws {Error} 403 when user is authenticated but not an admin.
 */
export const requireAdminSession = async (event: H3Event): Promise<User> => {
  const session = await getUserSession(event);

  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const user = session.user as User;
  const userRole = user.userRole ?? Role.SignedIn;

  if (userRole < Role.Admin) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  return user;
};
