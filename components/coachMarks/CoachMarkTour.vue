<script lang="ts" setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
  type Component,
} from "vue";
import { useI18n } from "#imports";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Database,
  FolderOpen,
  Globe,
  HelpCircle,
  LayoutGrid,
  Map,
  Palette,
  Sparkles,
  SunMoon,
  Users,
  Wind,
  X,
} from "lucide-vue-next";
import { useCoachMarks } from "~/composables/useCoachMarks";
import type { CoachMarkIcon, CoachMarkPlacement } from "~/utils/coachMarks";

const PAD = 8;
const GUTTER = 16;
const POPOVER_W = 320;
const ARROW = 8;

const { t } = useI18n();
const { active, steps, index, currentStep, next, back, dismiss, cancel } =
  useCoachMarks();

const iconMap: Record<CoachMarkIcon, Component> = {
  sparkles: Sparkles,
  map: Map,
  chart: BarChart3,
  folder: FolderOpen,
  wind: Wind,
  layoutGrid: LayoutGrid,
  database: Database,
  sunMoon: SunMoon,
  globe: Globe,
  palette: Palette,
  users: Users,
  helpCircle: HelpCircle,
};

const spotlight = ref({ top: 0, left: 0, width: 0, height: 0 });
const popover = ref({
  top: 0,
  left: 0,
  placement: "bottom" as CoachMarkPlacement,
});
const popoverEl = ref<HTMLElement | null>(null);
const closeBtn = ref<HTMLButtonElement | null>(null);
const previousFocus = ref<HTMLElement | null>(null);

const stepIcon = computed(() =>
  currentStep.value ? iconMap[currentStep.value.icon] : HelpCircle,
);
const titleId = "coach-mark-title";
const isFirst = computed(() => index.value === 0);
const isLast = computed(() => index.value >= steps.value.length - 1);
const isCentered = computed(() => currentStep.value?.placement === "center");
const isWelcome = computed(() => currentStep.value?.key === "welcome");

const title = computed(() =>
  currentStep.value ? t(`coachMarks.${currentStep.value.key}.title`) : "",
);
const body = computed(() =>
  currentStep.value ? t(`coachMarks.${currentStep.value.key}.body`) : "",
);

const getAnchor = (): HTMLElement | null => {
  if (!currentStep.value?.anchor || !import.meta.client) return null;
  return document.querySelector(currentStep.value.anchor);
};

const measureCenter = () => {
  spotlight.value = { top: 0, left: 0, width: 0, height: 0 };
  popover.value = { top: 0, left: 0, placement: "center" };
};

const measure = () => {
  if (currentStep.value?.placement === "center") {
    measureCenter();
    return;
  }

  const el = getAnchor();
  if (!el) return;

  const rect = el.getBoundingClientRect();
  spotlight.value = {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  };

  const preferred = currentStep.value?.placement ?? "bottom";
  const popH = popoverEl.value?.offsetHeight ?? 160;
  const spaceBelow = window.innerHeight - rect.bottom - GUTTER;
  const spaceAbove = rect.top - GUTTER;

  let placement: CoachMarkPlacement = preferred;
  if (
    preferred === "bottom" &&
    spaceBelow < popH + ARROW &&
    spaceAbove > spaceBelow
  ) {
    placement = "top";
  } else if (
    preferred === "top" &&
    spaceAbove < popH + ARROW &&
    spaceBelow > spaceAbove
  ) {
    placement = "bottom";
  }

  let left = rect.left + rect.width / 2 - POPOVER_W / 2;
  left = Math.max(
    GUTTER,
    Math.min(left, window.innerWidth - POPOVER_W - GUTTER),
  );

  let top =
    placement === "bottom"
      ? rect.bottom + PAD + ARROW
      : rect.top - PAD - ARROW - popH;

  top = Math.max(GUTTER, Math.min(top, window.innerHeight - popH - GUTTER));

  popover.value = { top, left, placement };
};

const isFullyInView = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= GUTTER &&
    rect.bottom <= window.innerHeight - GUTTER &&
    rect.left >= 0 &&
    rect.right <= window.innerWidth
  );
};

const scrollToAnchor = () => {
  if (currentStep.value?.placement === "center") return;
  const el = getAnchor();
  if (!el) return;
  if (isFullyInView(el) && currentStep.value?.key !== "dataSources") return;
  el.scrollIntoView({
    block: currentStep.value?.key === "dataSources" ? "start" : "nearest",
    behavior: "smooth",
  });
};

const onKeydown = (e: KeyboardEvent) => {
  if (!active.value) return;
  if (e.key === "Escape") {
    e.preventDefault();
    dismiss();
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    next();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    back();
  }
};

const onViewportChange = () => {
  if (active.value) measure();
};

watch(
  () => [active.value, index.value, currentStep.value?.key] as const,
  async ([isActive]) => {
    if (!isActive) return;
    scrollToAnchor();
    await nextTick();
    measure();
    // Re-measure after smooth scroll settles
    window.setTimeout(measure, 350);
  },
);

watch(active, async (isActive, wasActive) => {
  if (!import.meta.client) return;
  if (isActive && !wasActive) {
    previousFocus.value = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", onKeydown);
    window.addEventListener("scroll", onViewportChange, true);
    window.addEventListener("resize", onViewportChange);
    await nextTick();
    closeBtn.value?.focus();
  } else if (!isActive && wasActive) {
    document.removeEventListener("keydown", onKeydown);
    window.removeEventListener("scroll", onViewportChange, true);
    window.removeEventListener("resize", onViewportChange);
    const replay = document.querySelector(
      '[data-tour="header-replay"] button',
    ) as HTMLElement | null;
    (replay ?? previousFocus.value)?.focus?.();
  }
});

onBeforeUnmount(() => {
  if (!import.meta.client) return;
  document.removeEventListener("keydown", onKeydown);
  window.removeEventListener("scroll", onViewportChange, true);
  window.removeEventListener("resize", onViewportChange);
  if (active.value) cancel();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="active && currentStep"
      class="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <!-- Scrim click target (spotlight hole is pointer-events-none) -->
      <div
        class="absolute inset-0 cursor-default"
        aria-hidden="true"
        @click="dismiss"
      ></div>

      <!-- Spotlight hole (hidden for centered welcome) -->
      <div
        v-if="!isCentered"
        class="pointer-events-none absolute rounded-2xl motion-reduce:transition-none transition-all duration-300"
        :style="{
          top: `${spotlight.top}px`,
          left: `${spotlight.left}px`,
          width: `${spotlight.width}px`,
          height: `${spotlight.height}px`,
          boxShadow: '0 0 0 9999px rgba(15, 10, 30, 0.55)',
        }"
        aria-hidden="true"
      ></div>
      <div
        v-else
        class="pointer-events-none absolute inset-0 bg-[rgba(15,10,30,0.55)]"
        aria-hidden="true"
      ></div>

      <!-- Popover -->
      <div
        ref="popoverEl"
        class="z-[101] max-w-[calc(100vw-2rem)] rounded-2xl border border-violet-200 bg-white p-5 shadow-xl dark:border-violet-900 dark:bg-dusk-800 motion-reduce:transition-none transition-all duration-300"
        :class="
          isCentered
            ? 'fixed left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2'
            : 'absolute w-80'
        "
        :style="
          isCentered
            ? undefined
            : {
                top: `${popover.top}px`,
                left: `${popover.left}px`,
              }
        "
        @click.stop
      >
        <!-- Arrow -->
        <div
          v-if="!isCentered"
          class="pointer-events-none absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-violet-200 bg-white dark:border-violet-900 dark:bg-dusk-800"
          :class="
            popover.placement === 'bottom'
              ? '-top-1.5 border-l border-t'
              : '-bottom-1.5 border-r border-b'
          "
          aria-hidden="true"
        ></div>

        <button
          ref="closeBtn"
          type="button"
          class="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:hover:bg-dusk-700 dark:hover:text-dusk-100 dark:focus:ring-offset-dusk-800"
          :aria-label="t('coachMarks.close')"
          @click="dismiss"
        >
          <X class="h-4 w-4" />
        </button>

        <div class="mb-3 flex items-start gap-3 pr-6">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 dark:bg-dusk-700"
          >
            <component
              :is="stepIcon"
              class="h-5 w-5 text-violet-600 dark:text-violet-300"
            />
          </div>
          <div>
            <h2
              :id="titleId"
              class="text-base font-bold text-gray-900 dark:text-dusk-100"
            >
              {{ title }}
            </h2>
            <template v-if="isWelcome">
              <p class="mt-1 text-sm text-gray-600 dark:text-dusk-400">
                {{ t("coachMarks.welcome.body") }}
              </p>
              <p class="mt-2 text-sm text-gray-600 dark:text-dusk-400">
                <i18n-t keypath="coachMarks.welcome.exit" tag="span">
                  <template #icon>
                    <HelpCircle
                      class="mx-0.5 inline h-3.5 w-3.5 -translate-y-px text-violet-600 dark:text-violet-300"
                      aria-hidden="true"
                    />
                  </template>
                </i18n-t>
              </p>
            </template>
            <p v-else class="mt-1 text-sm text-gray-600 dark:text-dusk-400">
              {{ body }}
            </p>
          </div>
        </div>

        <!-- Progress dots -->
        <div
          class="mb-4 flex items-center justify-center gap-1.5"
          :aria-label="
            t('coachMarks.stepLabel', {
              current: index + 1,
              total: steps.length,
            })
          "
        >
          <span
            v-for="(_, i) in steps"
            :key="i"
            class="h-1.5 w-1.5 rounded-full transition-colors"
            :class="
              i === index
                ? 'bg-violet-600 dark:bg-violet-400'
                : 'bg-gray-300 dark:bg-dusk-600'
            "
          ></span>
        </div>

        <div class="flex items-center justify-between gap-2">
          <button
            type="button"
            class="text-sm text-gray-500 underline-offset-2 transition-colors hover:text-gray-800 hover:underline dark:text-dusk-400 dark:hover:text-dusk-200"
            @click="dismiss"
          >
            {{ t("coachMarks.skip") }}
          </button>

          <div class="flex items-center gap-2">
            <button
              v-if="!isFirst"
              type="button"
              class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-dusk-200 dark:hover:bg-dusk-700"
              @click="back"
            >
              <ChevronLeft class="h-4 w-4" />
              {{ t("coachMarks.back") }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-dusk-800"
              @click="next"
            >
              {{
                isLast
                  ? t("coachMarks.done")
                  : isWelcome
                    ? t("coachMarks.restart")
                    : t("coachMarks.next")
              }}
              <ChevronRight v-if="!isLast && !isWelcome" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
