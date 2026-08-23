import type { CoachMarkStepDef } from "~/types/types";

export const COACH_MARKS_STORAGE_KEY = "gc-coach-marks";
export const COACH_MARKS_VERSION = 2;
export const COACH_MARKS_DESKTOP_MQ = "(min-width: 1001px)";

/** Welcome (centered), cards L→R, header L→R, data sources, docs last. */
export const COACH_MARK_STEPS: readonly CoachMarkStepDef[] = [
  {
    key: "welcome",
    icon: "sparkles",
    placement: "center",
    minRole: 0,
  },
  {
    key: "explorer",
    anchor: '[data-tour="service-explorer"]',
    icon: "map",
    image: "/screenshots/explorer.jpg",
    placement: "bottom",
    minRole: 0,
  },
  {
    key: "superset",
    anchor: '[data-tour="service-superset"]',
    icon: "chart",
    image: "/screenshots/superset.jpg",
    placement: "bottom",
    minRole: 1,
  },
  {
    key: "filebrowser",
    anchor: '[data-tour="service-filebrowser"]',
    icon: "folder",
    image: "/screenshots/filebrowser.jpg",
    placement: "bottom",
    minRole: 2,
  },
  {
    key: "windmill",
    anchor: '[data-tour="service-windmill"]',
    icon: "wind",
    image: "/screenshots/windmill.jpg",
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
    key: "adminUsers",
    anchor: '[data-tour="header-users"]',
    icon: "users",
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
    key: "adminApps",
    anchor: '[data-tour="header-apps"]',
    icon: "layoutGrid",
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
  {
    key: "language",
    anchor: '[data-tour="header-language"]',
    icon: "globe",
    placement: "bottom",
    minRole: 0,
  },
  {
    key: "dataSources",
    anchor: '[data-tour="data-sources"]',
    icon: "database",
    placement: "bottom",
    minRole: 0,
  },
  {
    key: "docs",
    anchor: '[data-tour="docs-help"]',
    icon: "bookOpen",
    placement: "top",
    minRole: 0,
  },
] as const;

const stepIsAvailable = (step: CoachMarkStepDef, userRole: number): boolean => {
  if (step.minRole > userRole) return false;
  if (step.placement === "center" || !step.anchor) return true;
  return !!document.querySelector(step.anchor);
};

export const resolveCoachMarkSteps = (
  steps: readonly CoachMarkStepDef[] = COACH_MARK_STEPS,
  userRole: number = 0,
): CoachMarkStepDef[] => {
  if (!import.meta.client) return [];
  return steps.filter((step) => stepIsAvailable(step, userRole));
};

/** Wait until service/header tour anchors have finished mounting. */
export const waitForTourDom = async (timeoutMs = 2500): Promise<void> => {
  if (!import.meta.client) return;

  const deadline = Date.now() + timeoutMs;
  let lastServiceCount = -1;
  let stableFrames = 0;

  while (Date.now() < deadline) {
    const serviceCount = document.querySelectorAll(
      "[data-tour^='service-']",
    ).length;
    const hasChrome = !!document.querySelector("[data-tour='header-replay']");
    const hasDataSources = !!document.querySelector(
      "[data-tour='data-sources']",
    );

    if (serviceCount > 0 && serviceCount === lastServiceCount) {
      stableFrames += 1;
    } else {
      stableFrames = 0;
      lastServiceCount = serviceCount;
    }

    // Grid settled (or empty on purpose) and header + data-sources are present
    if (stableFrames >= 2 && hasChrome && hasDataSources) return;
    // No services enabled — still need header/docs anchors
    if (stableFrames >= 2 && serviceCount === 0 && hasChrome) return;

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
};
