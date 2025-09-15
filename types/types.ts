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
  