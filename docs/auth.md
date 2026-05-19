# Role-Based Access Control (RBAC) with Auth0

This document describes how Role-Based Access Control (RBAC) is implemented in the GuardianConnector Landing Page application using Auth0.

## Overview

The landing page uses Auth0's core RBAC functionality to control visibility of community services based on user roles. Users are assigned roles in the Auth0 dashboard, and the application fetches these roles during authentication to determine which services to display.

## Access Control Matrix

| Role | Access Level | Services Visible |
|------|-------------|------------------|
| **Admin** | Full access | All enabled services including Windmill |
| **Member** | Standard access | All enabled services except Windmill |
| **Viewer** | Limited access | All enabled services except Windmill |

> [!NOTE]
> 
> The "Viewer" role is nominal only — it is equivalent to users who have no roles assigned in Auth0. Users without any assigned roles are treated as having Viewer-level access i.e. they can see all services except Windmill.

## Implementation Details

### 1. Role Fetching Process

When a user logs in, the application:

1. **Receives basic user info** from Auth0 OAuth (email, sub, etc.)
2. **Fetches user ID** by email using Auth0 Management API
3. **Retrieves user roles** using the user ID
4. **Stores roles in session** for service visibility control

### 2. Management API Integration

The application uses Auth0's Management API to fetch user roles. This requires:

- **Management API authorization** for the application
- **Required scopes**: `read:users`, `read:user_idp_tokens`
- **Access token generation** with client credentials flow

### 3. Service Visibility Control

Service visibility is implemented in the main page component (`pages/index.vue`):

```typescript
// Only show Windmill if user has Admin role
if (config.public.windmillEnabled) {
  const typedUser = user.value as User;
  const userRoles = typedUser?.roles || [];
  const hasAdminRole = userRoles.some(
    (role: { name: string }) => role.name === "Admin",
  );

  if (hasAdminRole) {
    services.push({
      name: "Windmill",
      url: `https://windmill.${communityName}.guardianconnector.net`,
    });
  }
}
```

## Auth0 Configuration

### Prerequisites

Before implementing RBAC, ensure:

1. **RBAC is enabled** for your API in Auth0 dashboard
2. **Management API access** is configured for your application
3. **Required scopes** are granted to your application

### Required Auth0 Setup

1. **Register Your API** (if not already done):
   - Go to **Dashboard > Applications > APIs**
   - Click **"+ Create API"**
   - Provide API details:
     - **Name**: Your API name (e.g., "GuardianConnector Landing")
     - **Identifier**: `https://your-domain.com` (unique identifier)
     - **Signing Algorithm**: HS256 (recommended)
   - Click **"Create"**

2. **Enable RBAC for Your API**:
   - Go to **Dashboard > Applications > APIs > Your API**
   - In the **Settings** tab, enable:
     - **"Add Permissions in the Access Token"**
     - **"RBAC"** (Role-Based Access Control)
     - **"Add Roles in the Access Token"**

> [!NOTE]
>
> For the Auth0 Management API that is added by default, it is not necessary to enable RBAC; the previous step can be skipped.

3. **Authorize Management API Access**:
   - Go to **Dashboard > Applications > APIs > Auth0 Management API**
   - Navigate to **"Machine to Machine Applications"** tab
   - Find your application in the list
   - **Authorize** your application
   - Select the required scopes:
     - `read:users` - to fetch user information
     - `read:user_idp_tokens` - to read user roles

## Role Management

### Creating Roles

1. Navigate to **User Management > Roles** in the Auth0 dashboard
2. Click **"+ Create Role"** (blue button in the top right)
3. Enter role details:
   - **Name**: Admin, Member, or Viewer
   - **Description**: Brief description of permissions

**Required Roles in the System:**
- **Admin**: "can access all services including Windmill"
- **Member**: "can access standard services (no Windmill access)"  
- **Viewer**: "can access standard services (no Windmill access)"

### Assigning Roles to Users

1. Go to **User Management > Users**
2. Click on the user's name
3. Navigate to the **"Roles"** tab
4. Click **"Assign Role"**
5. Select the appropriate role(s)

**Note**: Users can have multiple roles, but it's recommended to assign only the highest-level role needed (e.g., assign Admin and remove Member role).

### Viewing User Roles

You can view assigned roles using the Auth0 dashboard or Management API:

**Dashboard Method**:
1. User Management → Users → [User Name] → Roles tab

**Management API Method**:
```bash
curl --request GET \
  --url 'https://{yourDomain}/api/v2/users/USER_ID/roles' \
  --header 'authorization: Bearer MGMT_API_ACCESS_TOKEN'
```

## API References

### Auth0 Documentation References

- [Configure Core RBAC](https://auth0.com/docs/manage-users/access-control/configure-core-rbac) - Core RBAC setup guide
- [Register APIs](https://auth0.com/docs/get-started/auth0-overview/set-up-apis) - How to register and configure APIs
- [View User Roles](https://auth0.com/docs/manage-users/access-control/configure-core-rbac/rbac-users/view-user-roles) - Managing user roles
- [Get User Roles Endpoint](https://auth0.com/docs/api/management/v2#!/Users/get_user_roles) - Management API reference

### Management API Endpoints Used

1. **Get User by Email**:
   ```
   GET /api/v2/users-by-email?email={email}
   ```

2. **Get User Roles**:
   ```
   GET /api/v2/users/{user_id}/roles
   ```

3. **Get Management API Token**:
   ```
   POST /oauth/token
   ```

## Troubleshooting

### Common Issues

1. **"No roles found"**: Check if user has roles assigned in Auth0 dashboard
2. **"Management API configuration missing"**: Verify environment variables are set
3. **"Failed to fetch user roles"**: Check Management API authorization and scopes
4. **"Windmill not visible"**: Verify user has Admin role assigned
5. **"Auth0 not working"**: Check if `NUXT_PUBLIC_AUTH0_ENABLED` is set to `true`

### RBAC not working despite correct Auth0 configuration

If RBAC is not working despite correct Auth0 configuration, try restarting the application after the RBAC configuration has been made.

### Service Visibility Issues

- **Windmill not showing**: Ensure user has "Admin" role assigned
- **No services showing**: Check service availability flags in environment variables
- **Authentication not working**: Verify Auth0 configuration and `auth0Enabled` flag
