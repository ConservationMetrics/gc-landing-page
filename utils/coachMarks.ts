export const COACH_MARKS_STORAGE_KEY = "gc-coach-marks";
export const COACH_MARKS_VERSION = 1;
export const COACH_MARKS_DESKTOP_MQ = "(min-width: 1001px)";

export type CoachMarkPlacement = "top" | "bottom";

export type CoachMarkStepKey =
  | "explorer"
  | "superset"
  | "filebrowser"
  | "windmill"
  | "customApp"
  | "dataSources"
  | "display"
  | "language"
  | "adminApps"
  | "adminTheme"
  | "adminUsers"
  | "replay";

export type CoachMarkIcon =
  | "map"
  | "chart"
  | "folder"
  | "wind"
  | "layoutGrid"
  | "database"
  | "sunMoon"
  | "globe"
  | "palette"
  | "users"
  | "helpCircle";

export type CoachMarkStepDef = {
  key: CoachMarkStepKey;
  anchor: string;
  icon: CoachMarkIcon;
  placement: CoachMarkPlacement;
  /** Minimum Role enum value; used when a user is promoted to show only new steps. */
  minRole: number;
};

/** Ordered by reading flow; filtered at runtime to anchors present in the DOM. */
export const COACH_MARK_STEPS: readonly CoachMarkStepDef[] = [
  {
    key: "explorer",
    anchor: '[data-tour="service-explorer"]',
    icon: "map",
    placement: "bottom",
    minRole: 0,
  },
  {
    key: "superset",
    anchor: '[data-tour="service-superset"]',
    icon: "chart",
    placement: "bottom",
    minRole: 1,
  },
  {
    key: "filebrowser",
    anchor: '[data-tour="service-filebrowser"]',
    icon: "folder",
    placement: "bottom",
    minRole: 2,
  },
  {
    key: "windmill",
    anchor: '[data-tour="service-windmill"]',
    icon: "wind",
    placement: "bottom",
    minRole: 3,
  },
  {
    key: "customApp",
    anchor: '[data-tour^="service-custom-"]',
    icon: "layoutGrid",
    placement: "bottom",
    minRole: 2,
  },
  {
    key: "dataSources",
    anchor: '[data-tour="data-sources"]',
    icon: "database",
    placement: "top",
    minRole: 0,
  },
  {
    key: "display",
    anchor: '[data-tour="header-display"]',
    icon: "sunMoon",
    placement: "bottom",
    minRole: 0,
  },
  {
    key: "language",
    anchor: '[data-tour="header-language"]',
    icon: "globe",
    placement: "bottom",
    minRole: 0,
  },
  {
    key: "adminApps",
    anchor: '[data-tour="header-apps"]',
    icon: "layoutGrid",
    placement: "bottom",
    minRole: 3,
  },
  {
    key: "adminTheme",
    anchor: '[data-tour="header-theme"]',
    icon: "palette",
    placement: "bottom",
    minRole: 3,
  },
  {
    key: "adminUsers",
    anchor: '[data-tour="header-users"]',
    icon: "users",
    placement: "bottom",
    minRole: 3,
  },
  {
    key: "replay",
    anchor: '[data-tour="header-replay"]',
    icon: "helpCircle",
    placement: "bottom",
    minRole: 0,
  },
] as const;

export type CoachMarksStorage = {
  version: number;
  dismissedAt: number;
  maxRole: number;
};

export const resolveCoachMarkSteps = (
  steps: readonly CoachMarkStepDef[] = COACH_MARK_STEPS,
): CoachMarkStepDef[] => {
  if (!import.meta.client) return [];
  return steps.filter((step) => document.querySelector(step.anchor));
};
