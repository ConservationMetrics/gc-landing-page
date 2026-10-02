export const Role = {
  SignedIn: 0, // Signed in but no elevated access
  Guest: 1, // Signed in with guest permissions
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

// Auth0 Management API User Response
export interface Auth0ManagementUser {
  user_id: string;
  email: string;
  name?: string;
  nickname?: string;
  picture?: string;
  created_at: string;
  last_login?: string;
  logins_count?: number;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
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

// Custom Apps
export type CustomApp = {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  tags: string[];
  subdomain: string;
  enabled: boolean;
  sortOrder: number;
};

export type CustomAppInput = Omit<CustomApp, "sortOrder"> & {
  sortOrder?: number;
};

export type CustomAppTag = { text: string };

export type CustomAppDraft = CustomApp & {
  clientKey: string;
  tagDraft: string;
};

export type CustomAppValidationError = {
  index: number;
  message: string;
};

export type CustomAppsValidationResult =
  | { ok: true; apps: CustomApp[] }
  | { ok: false; errors: CustomAppValidationError[] };

export interface CustomAppsResponse {
  success: boolean;
  apps: CustomApp[];
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

// I18n Types
export type SupportedLocale = "en" | "pt" | "es" | "nl";

// Coach Marks
export type CoachMarkPlacement = "top" | "bottom" | "center";

export type CoachMarkStepKey =
  | "welcome"
  | "explorer"
  | "superset"
  | "filebrowser"
  | "windmill"
  | "customApp"
  | "dataSources"
  | "docs"
  | "display"
  | "language"
  | "adminApps"
  | "adminTheme"
  | "adminUsers"
  | "replay";

export type CoachMarkIcon =
  | "sparkles"
  | "map"
  | "chart"
  | "folder"
  | "wind"
  | "layoutGrid"
  | "database"
  | "bookOpen"
  | "sunMoon"
  | "globe"
  | "palette"
  | "users"
  | "helpCircle";

export type CoachMarkStepDef = {
  key: CoachMarkStepKey;
  /** CSS selector; omit for centered steps with no spotlight target. */
  anchor?: string;
  icon: CoachMarkIcon;
  /** Optional product screenshot shown in the tour card. */
  image?: string;
  placement: CoachMarkPlacement;
  /** Minimum Role enum value; used when a user is promoted to show only new steps. */
  minRole: number;
};

export type CoachMarksStorage = {
  version: number;
  dismissedAt: number;
  maxRole: number;
};
