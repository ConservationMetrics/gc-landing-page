import { useRuntimeConfig } from "#imports";

// Cache for Management API access token
let managementTokenCache: { token: string; expiresAt: number } | null = null;

// Function to get or generate Management API access token
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

// Function to fetch user ID by email from Auth0 Management API
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

// Function to fetch user roles from Auth0 Management API
export const fetchUserRoles = async (
    userId: string,
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

        if (!rolesResponse.ok) {
            console.error("🔍 Failed to fetch user roles from Management API");
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
        console.error("🔍 Error fetching user roles:", error);
        return [];
    }
};

// Function to fetch all roles from Auth0 Management API
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

// Function to get current user roles
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

// Function to remove all roles from user
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

// Function to assign roles to user
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

// Function to update user metadata
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
