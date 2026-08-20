import { computed, nextTick, ref, type Ref } from "vue";
import { useUserSession } from "#imports";
import { Role, type User } from "~/types/types";
import {
  COACH_MARK_STEPS,
  COACH_MARKS_DESKTOP_MQ,
  COACH_MARKS_STORAGE_KEY,
  COACH_MARKS_VERSION,
  resolveCoachMarkSteps,
  type CoachMarkStepDef,
  type CoachMarksStorage,
} from "~/utils/coachMarks";

const active = ref(false);
const index = ref(0);
const steps = ref<CoachMarkStepDef[]>([]);
const startedOnce = ref(false);

const readStorage = (): CoachMarksStorage | null => {
  if (!import.meta.client) return null;
  try {
    const raw = localStorage.getItem(COACH_MARKS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CoachMarksStorage;
    if (
      typeof parsed?.version !== "number" ||
      typeof parsed?.dismissedAt !== "number" ||
      typeof parsed?.maxRole !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeStorage = (userRole: number) => {
  if (!import.meta.client) return;
  const payload: CoachMarksStorage = {
    version: COACH_MARKS_VERSION,
    dismissedAt: Date.now(),
    maxRole: userRole,
  };
  localStorage.setItem(COACH_MARKS_STORAGE_KEY, JSON.stringify(payload));
};

const isDesktop = () =>
  import.meta.client && window.matchMedia(COACH_MARKS_DESKTOP_MQ).matches;

const currentUserRole = (user: Ref<User | null | undefined>) =>
  computed(() => (user.value as User | undefined)?.userRole ?? Role.SignedIn);

/**
 * Module-level singleton so AppHeader (replay) and HomePage (autostart/overlay)
 * share the same tour state without a Pinia store.
 */
export const useCoachMarks = () => {
  const { user } = useUserSession();
  const userRole = currentUserRole(user as Ref<User | null | undefined>);

  const hasSeen = computed(() => {
    const stored = readStorage();
    if (!stored || stored.version !== COACH_MARKS_VERSION) return false;
    return userRole.value <= stored.maxRole;
  });

  const buildSteps = (opts?: { force?: boolean }): CoachMarkStepDef[] => {
    const available = resolveCoachMarkSteps(COACH_MARK_STEPS);
    if (opts?.force) return available;

    const stored = readStorage();
    if (
      stored &&
      stored.version === COACH_MARKS_VERSION &&
      userRole.value > stored.maxRole
    ) {
      return available.filter((step) => step.minRole > stored.maxRole);
    }
    return available;
  };

  const start = async (opts?: { force?: boolean }) => {
    if (!import.meta.client) return;
    if (!isDesktop()) return;
    if (active.value) return;

    if (!opts?.force && hasSeen.value) return;

    await nextTick();
    const resolved = buildSteps(opts);
    if (resolved.length === 0) return;

    steps.value = resolved;
    index.value = 0;
    active.value = true;
    startedOnce.value = true;
  };

  const dismiss = () => {
    if (!active.value) return;
    active.value = false;
    writeStorage(userRole.value);
  };

  /** Close without persisting (e.g. navigating away mid-tour). */
  const cancel = () => {
    active.value = false;
  };

  const next = () => {
    if (!active.value) return;
    if (index.value >= steps.value.length - 1) {
      dismiss();
      return;
    }
    index.value += 1;
  };

  const back = () => {
    if (!active.value || index.value <= 0) return;
    index.value -= 1;
  };

  const currentStep = computed(() => steps.value[index.value] ?? null);

  /** Call from HomePage once custom apps (if any) have loaded. */
  const tryAutostart = async () => {
    if (startedOnce.value || active.value) return;
    await start();
  };

  return {
    active,
    steps,
    index,
    currentStep,
    hasSeen,
    start,
    next,
    back,
    dismiss,
    cancel,
    tryAutostart,
  };
};
