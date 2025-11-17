import { useRuntimeConfig } from "#imports";
import {
  getManagementApiToken,
  fetchUserRoles,
} from "~/server/utils/auth0Management";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const { oauth } = config;

    if (!oauth?.auth0?.domain) {
      throw createError({
        statusCode: 500,
        statusMessage: "Auth0 configuration missing",
      });
    }

    const accessToken = await getManagementApiToken();
    if (!accessToken) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to get Management API access token",
      });
    }

    // Get query parameters for pagination
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 0;
    const perPage = parseInt(query.per_page as string) || 50;
    const search = query.search as string;

    // Build the users API URL with pagination
    let usersUrl = `https://${oauth.auth0.domain}/api/v2/users?page=${page}&per_page=${perPage}&include_totals=true`;

    if (search) {
      usersUrl += `&q=email:*${encodeURIComponent(search)}*`;
    }

    // Fetch users from Auth0 Management API
    const usersResponse = await fetch(usersUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!usersResponse.ok) {
      const errorText = await usersResponse.text();
      console.error(
        "🔍 Failed to fetch users from Management API. Status:",
        usersResponse.status,
      );
      console.error("🔍 Error response:", errorText);
      throw createError({
        statusCode: usersResponse.status,
        statusMessage: "Failed to fetch users from Auth0",
      });
    }

    const usersData = await usersResponse.json();

    // Fetch roles for each user
    const usersWithRoles = await Promise.all(
      usersData.users.map(async (user: any) => {
        const roles = await fetchUserRoles(user.user_id);

        // Check if user is approved (has app_metadata.approved = "true")
        const isApproved =
          user.app_metadata?.approved === "true" ||
          user.app_metadata?.approved === true;

        return {
          id: user.user_id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          picture: user.picture,
          created_at: user.created_at,
          last_login: user.last_login,
          logins_count: user.logins_count,
          roles,
          isApproved,
          app_metadata: user.app_metadata,
          user_metadata: user.user_metadata,
        };
      }),
    );

    return {
      success: true,
      users: usersWithRoles,
      total: usersData.total,
      page,
      per_page: perPage,
    };
  } catch (error) {
    console.error("🔍 Error fetching users:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
