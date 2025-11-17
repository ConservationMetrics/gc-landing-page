import { useRuntimeConfig } from "#imports";

/**
 * Cache for Management API access token
 */
let managementTokenCache: { token: string; expiresAt: number } | null = null;

/**
 * Gets or generates a Management API access token for Auth0
 * Uses client credentials flow to obtain a token for API v2 access
 * Implements token caching to avoid unnecessary API calls
 * 
 * @returns {Promise<string | null>} The access token string, or null if failed
 * @throws {Error} When Auth0 configuration is missing or API call fails
 */
export const getManagementApiToken = async (): Promise<string | null> => {
    try {
        const config = useRuntimeConfig();
        const { oauth } = config;

        if (
            !oauth?.auth0?.clientId ||
            !oauth?.auth0?.clientSecret ||
            !oauth?.auth0?.domain
        ) {
            console.error("🔍 Auth0 Management API configuration missing");
            return null;
        }

        // Check if we have a valid cached token
        if (managementTokenCache && managementTokenCache.expiresAt > Date.now()) {
            return managementTokenCache.token;
        }

        // Generate new access token
        const tokenResponse = await fetch(
            `https://${oauth.auth0.domain}/oauth/token`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "client_credentials",
                    client_id: oauth.auth0.clientId,
                    client_secret: oauth.auth0.clientSecret,
                    audience: `https://${oauth.auth0.domain}/api/v2/`,
                }),
            },
        );

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error(
                "🔍 Failed to generate Management API token. Status:",
                tokenResponse.status,
            );
            console.error("🔍 Error response:", errorText);
            return null;
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        const expiresIn = tokenData.expires_in || 86400; // Default to 24 hours

        // Cache the token with expiration
        managementTokenCache = {
            token: accessToken,
            expiresAt: Date.now() + expiresIn * 1000 - 60000, // Expire 1 minute early for safety
        };
        return accessToken;
    } catch (error) {
        console.error("🔍 Error generating Management API token:", error);
        return null;
    }
};

/**
 * Fetches a user ID by email address from Auth0 Management API
 * Searches for users with the specified email and returns the first match
 * 
 * @param {string} email - The email address to search for
 * @returns {Promise<string | null>} The user ID if found, null otherwise
 * @throws {Error} When Auth0 configuration is missing or API call fails
 */
export const fetchUserIdByEmail = async (email: string): Promise<string | null> => {
    try {
        const config = useRuntimeConfig();
        const { oauth } = config;

        if (!oauth?.auth0?.domain) {
            console.error("🔍 Auth0 Management API configuration missing");
            return null;
        }

        const accessToken = await getManagementApiToken();
        if (!accessToken) {
            console.error("🔍 Failed to get Management API access token");
            return null;
        }

        // Fetch user by email
        const userResponse = await fetch(
            `https://${oauth.auth0.domain}/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!userResponse.ok) {
            const errorText = await userResponse.text();
            console.error(
                "🔍 Failed to fetch user by email from Management API. Status:",
                userResponse.status,
            );
            console.error("🔍 Error response:", errorText);
            return null;
        }

        const usersData = await userResponse.json();

        if (usersData.length === 0) {
            console.error("🔍 No user found with email:", email);
            return null;
        }

        const userId = usersData[0].user_id;
        return userId;
    } catch (error) {
        console.error("🔍 Error fetching user ID by email:", error);
        return null;
    }
};

/**
 * Fetches all roles assigned to a specific user from Auth0 Management API
 * Includes retry logic with exponential backoff for rate limiting
 * 
 * @param {string} userId - The Auth0 user ID to fetch roles for
 * @param {number} retries - Number of retries remaining (default: 3)
 * @returns {Promise<Array<{id: string, name: string, description: string}>>} Array of role objects with id, name, and description
 * @throws {Error} When Auth0 configuration is missing or API call fails
 */
export const fetchUserRoles = async (
    userId: string,
    retries: number = 3,
): Promise<Array<{ id: string; name: string; description: string }>> => {
    try {
        const config = useRuntimeConfig();
        const { oauth } = config;

        if (!oauth?.auth0?.domain) {
            console.error("🔍 Auth0 Management API configuration missing");
            return [];
        }

        const accessToken = await getManagementApiToken();
        if (!accessToken) {
            console.error("🔍 Failed to get Management API access token");
            return [];
        }

        // Fetch user roles using the provided Management API token
        const rolesResponse = await fetch(
            `https://${oauth.auth0.domain}/api/v2/users/${userId}/roles`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            },
        );

        // Handle different response statuses
        if (rolesResponse.status === 404) {
            // User has no roles - this is not an error, just return empty array
            return [];
        }

        if (rolesResponse.status === 429) {
            // Rate limited - retry with exponential backoff
            if (retries > 0) {
                const delay = Math.pow(2, 4 - retries) * 1000; // 1s, 2s, 4s
                await new Promise((resolve) => setTimeout(resolve, delay));
                return fetchUserRoles(userId, retries - 1);
            } else {
                console.error(
                    `🔍 Rate limited when fetching roles for user ${userId} after retries`,
                );
                return [];
            }
        }

        if (!rolesResponse.ok) {
            const errorText = await rolesResponse.text();
            console.error(
                `🔍 Failed to fetch user roles from Management API for user ${userId}. Status: ${rolesResponse.status}`,
            );
            console.error(`🔍 Error response: ${errorText}`);
            return [];
        }

        const rolesData = await rolesResponse.json();
        return rolesData.map(
            (role: { id: string; name: string; description: string }) => ({
                id: role.id,
                name: role.name,
                description: role.description,
            }),
        );
    } catch (error) {
        // Retry on network errors
        if (retries > 0 && error instanceof Error) {
            const delay = Math.pow(2, 4 - retries) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            return fetchUserRoles(userId, retries - 1);
        }
        console.error(`🔍 Error fetching user roles for user ${userId}:`, error);
        return [];
    }
};

/**
 * Fetches all available roles from Auth0 Management API
 * 
 * @returns {Promise<Array<{id: string, name: string, description: string}>>} Array of all role objects with id, name, and description
 * @throws {Error} When Auth0 configuration is missing or API call fails
 */
export const fetchAllRoles = async (): Promise<Array<{ id: string; name: string; description: string }>> => {
    try {
        const config = useRuntimeConfig();
        const { oauth } = config;

        if (!oauth?.auth0?.domain) {
            console.error("🔍 Auth0 Management API configuration missing");
            return [];
        }

        const accessToken = await getManagementApiToken();
        if (!accessToken) {
            console.error("🔍 Failed to get Management API access token");
            return [];
        }

        // Fetch all roles from Auth0 Management API
        const rolesResponse = await fetch(
            `https://${oauth.auth0.domain}/api/v2/roles`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!rolesResponse.ok) {
            const errorText = await rolesResponse.text();
            console.error(
                "🔍 Failed to fetch roles from Management API. Status:",
                rolesResponse.status,
            );
            console.error("🔍 Error response:", errorText);
            return [];
        }

        const rolesData = await rolesResponse.json();
        return rolesData.map((role: { id: string; name: string; description: string }) => ({
            id: role.id,
            name: role.name,
            description: role.description,
        }));
    } catch (error) {
        console.error("🔍 Error fetching roles:", error);
        return [];
    }
};

/**
 * Gets the current user's role IDs from Auth0 Management API
 * Returns only the role IDs, not the full role objects
 * 
 * @param {string} userId - The Auth0 user ID to get roles for
 * @returns {Promise<string[]>} Array of role IDs assigned to the user
 * @throws {Error} When Auth0 configuration is missing or API call fails
 */
export const getCurrentUserRoles = async (
    userId: string,
): Promise<string[]> => {
    try {
        const config = useRuntimeConfig();
        const { oauth } = config;

        if (!oauth?.auth0?.domain) {
            console.error("🔍 Auth0 Management API configuration missing");
            return [];
        }

        const accessToken = await getManagementApiToken();
        if (!accessToken) {
            console.error("🔍 Failed to get Management API access token");
            return [];
        }

        const rolesResponse = await fetch(
            `https://${oauth.auth0.domain}/api/v2/users/${userId}/roles`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!rolesResponse.ok) {
            console.error("🔍 Failed to fetch current user roles");
            return [];
        }

        const rolesData = await rolesResponse.json();
        return rolesData.map((role: { id: string }) => role.id);
    } catch (error) {
        console.error("🔍 Error fetching current user roles:", error);
        return [];
    }
};

/**
 * Removes all specified roles from a user in Auth0
 * 
 * @param {string} userId - The Auth0 user ID to remove roles from
 * @param {string[]} roleIds - Array of role IDs to remove from the user
 * @returns {Promise<boolean>} True if successful, false otherwise
 * @throws {Error} When Auth0 configuration is missing or API call fails
 */
export const removeAllUserRoles = async (
    userId: string,
    roleIds: string[],
): Promise<boolean> => {
    try {
        const config = useRuntimeConfig();
        const { oauth } = config;

        if (!oauth?.auth0?.domain || roleIds.length === 0) return true;

        const accessToken = await getManagementApiToken();
        if (!accessToken) {
            console.error("🔍 Failed to get Management API access token");
            return false;
        }

        const response = await fetch(
            `https://${oauth.auth0.domain}/api/v2/users/${userId}/roles`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    roles: roleIds,
                }),
            },
        );

        return response.ok;
    } catch (error) {
        console.error("🔍 Error removing user roles:", error);
        return false;
    }
};

/**
 * Assigns specified roles to a user in Auth0
 * 
 * @param {string} userId - The Auth0 user ID to assign roles to
 * @param {string[]} roleIds - Array of role IDs to assign to the user
 * @returns {Promise<boolean>} True if successful, false otherwise
 * @throws {Error} When Auth0 configuration is missing or API call fails
 */
export const assignUserRoles = async (
    userId: string,
    roleIds: string[],
): Promise<boolean> => {
    try {
        const config = useRuntimeConfig();
        const { oauth } = config;

        if (!oauth?.auth0?.domain || roleIds.length === 0) return true;

        const accessToken = await getManagementApiToken();
        if (!accessToken) {
            console.error("🔍 Failed to get Management API access token");
            return false;
        }

        const response = await fetch(
            `https://${oauth.auth0.domain}/api/v2/users/${userId}/roles`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    roles: roleIds,
                }),
            },
        );

        return response.ok;
    } catch (error) {
        console.error("🔍 Error assigning user roles:", error);
        return false;
    }
};

/**
 * Updates user metadata in Auth0 using the Management API
 * 
 * @param {string} userId - The Auth0 user ID to update metadata for
 * @param {any} metadata - The metadata object to update (can include user_metadata, app_metadata, etc.)
 * @returns {Promise<boolean>} True if successful, false otherwise
 * @throws {Error} When Auth0 configuration is missing or API call fails
 */
export const updateUserMetadata = async (
    userId: string,
    metadata: any,
): Promise<boolean> => {
    try {
        const config = useRuntimeConfig();
        const { oauth } = config;

        if (!oauth?.auth0?.domain) return false;

        const accessToken = await getManagementApiToken();
        if (!accessToken) {
            console.error("🔍 Failed to get Management API access token");
            return false;
        }

        const response = await fetch(
            `https://${oauth.auth0.domain}/api/v2/users/${userId}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(metadata),
            },
        );

        return response.ok;
    } catch (error) {
        console.error("🔍 Error updating user metadata:", error);
        return false;
    }
};
