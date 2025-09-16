export const Role = {
    Public: 0, // Not signed in, no permissions
    Viewer: 1, // Signed in but no special permissions
    Member: 2, // Signed in with member permissions
    Admin: 3, // Signed in with admin permissions
  } as const;
  
  export type Role = (typeof Role)[keyof typeof Role];
  
  export interface User {
    auth0: string;
    roles?: Array<{ id: string; name: string; description: string }>;
    userRole?: Role;
  }

// User Management Types
export interface UserRole {
  id: string;
  name: string;
  description: string;
}

export interface UserManagementUser {
  id: string;
  email: string;
  name: string;
  nickname: string;
  picture: string;
  created_at: string;
  last_login: string;
  logins_count: number;
  roles: UserRole[];
  isApproved: boolean;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
}

export interface UsersResponse {
  success: boolean;
  users: UserManagementUser[];
  total: number;
  page: number;
  per_page: number;
}

export interface RolesResponse {
  success: boolean;
  roles: UserRole[];
}
  