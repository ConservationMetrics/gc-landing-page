import { Role, type CustomApp } from "~/types/types";

export type { CustomApp };

/**
 * Visibility for custom app cards on the homepage grid.
 * Hardcoded to Member for now (no per-app role UI). May become configurable later.
 */
export const CUSTOM_APP_MIN_ROLE = Role.Member;

export const CUSTOM_APPS_MAX = 20;
export const CUSTOM_APP_NAME_MAX = 80;
export const CUSTOM_APP_DESCRIPTION_MAX = 280;
export const CUSTOM_APP_TAG_MAX_COUNT = 8;
export const CUSTOM_APP_TAG_MAX_LENGTH = 32;
export const CUSTOM_APP_ID_MAX = 64;
export const CUSTOM_APP_SUBDOMAIN_MAX = 63;

export const CUSTOM_APP_SUBDOMAIN_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const CUSTOM_APP_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type CustomAppInput = Omit<CustomApp, "sortOrder"> & {
  sortOrder?: number;
};

export const emptyCustomApps = (): CustomApp[] => [];

/** Absolute http(s) URLs and root-relative paths are allowed; empty is not. */
export const isValidCustomAppIconUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const isValidCustomAppSubdomain = (value: string): boolean => {
  const trimmed = value.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= CUSTOM_APP_SUBDOMAIN_MAX &&
    CUSTOM_APP_SUBDOMAIN_PATTERN.test(trimmed)
  );
};

export const isValidCustomAppId = (value: string): boolean => {
  const trimmed = value.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= CUSTOM_APP_ID_MAX &&
    CUSTOM_APP_ID_PATTERN.test(trimmed)
  );
};

export const slugifyCustomAppId = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, CUSTOM_APP_ID_MAX);

const isNonEmptyString = (value: unknown, max: number): value is string =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.trim().length <= max;

const normalizeTags = (tags: unknown): string[] | null => {
  if (!Array.isArray(tags)) return null;
  if (tags.length > CUSTOM_APP_TAG_MAX_COUNT) return null;
  const normalized: string[] = [];
  for (const tag of tags) {
    if (typeof tag !== "string") return null;
    const trimmed = tag.trim();
    if (!trimmed || trimmed.length > CUSTOM_APP_TAG_MAX_LENGTH) return null;
    normalized.push(trimmed);
  }
  return normalized;
};

const ALLOWED_KEYS = new Set([
  "id",
  "name",
  "description",
  "iconUrl",
  "tags",
  "subdomain",
  "enabled",
  "sortOrder",
]);

export type CustomAppValidationError = {
  index: number;
  message: string;
};

export type CustomAppsValidationResult =
  | { ok: true; apps: CustomApp[] }
  | { ok: false; errors: CustomAppValidationError[] };

/**
 * Validates and normalizes a full custom-apps payload for PUT replace.
 * Assigns sortOrder from array index when omitted.
 */
export const validateCustomAppsPayload = (
  apps: unknown,
): CustomAppsValidationResult => {
  if (!Array.isArray(apps)) {
    return {
      ok: false,
      errors: [{ index: -1, message: "apps must be an array" }],
    };
  }
  if (apps.length > CUSTOM_APPS_MAX) {
    return {
      ok: false,
      errors: [
        {
          index: -1,
          message: `at most ${CUSTOM_APPS_MAX} custom apps are allowed`,
        },
      ],
    };
  }

  const errors: CustomAppValidationError[] = [];
  const normalized: CustomApp[] = [];
  const seenIds = new Set<string>();
  const seenSubdomains = new Set<string>();

  apps.forEach((raw, index) => {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      errors.push({ index, message: "app must be an object" });
      return;
    }

    const record = raw as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      if (!ALLOWED_KEYS.has(key)) {
        errors.push({ index, message: `unknown field: ${key}` });
      }
    }

    const id = typeof record.id === "string" ? record.id.trim() : "";
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const description =
      typeof record.description === "string" ? record.description.trim() : "";
    const iconUrl =
      typeof record.iconUrl === "string" ? record.iconUrl.trim() : "";
    const subdomain =
      typeof record.subdomain === "string" ? record.subdomain.trim() : "";
    const enabled = record.enabled;
    const tags = normalizeTags(record.tags);

    if (!isValidCustomAppId(id)) {
      errors.push({
        index,
        message: "id must be a non-empty slug ([a-z0-9-]+)",
      });
    } else if (seenIds.has(id)) {
      errors.push({ index, message: `duplicate id: ${id}` });
    } else {
      seenIds.add(id);
    }

    if (!isNonEmptyString(name, CUSTOM_APP_NAME_MAX)) {
      errors.push({
        index,
        message: `name is required (max ${CUSTOM_APP_NAME_MAX} chars)`,
      });
    }

    if (!isNonEmptyString(description, CUSTOM_APP_DESCRIPTION_MAX)) {
      errors.push({
        index,
        message: `description is required (max ${CUSTOM_APP_DESCRIPTION_MAX} chars)`,
      });
    }

    if (!isValidCustomAppIconUrl(iconUrl)) {
      errors.push({
        index,
        message: "iconUrl must be http(s) or a root-relative path",
      });
    }

    if (tags === null) {
      errors.push({
        index,
        message: `tags must be a string[] (max ${CUSTOM_APP_TAG_MAX_COUNT}, each max ${CUSTOM_APP_TAG_MAX_LENGTH} chars)`,
      });
    }

    if (!isValidCustomAppSubdomain(subdomain)) {
      errors.push({
        index,
        message: "subdomain must match [a-z0-9-]+ (no dots)",
      });
    } else if (seenSubdomains.has(subdomain)) {
      errors.push({ index, message: `duplicate subdomain: ${subdomain}` });
    } else {
      seenSubdomains.add(subdomain);
    }

    if (typeof enabled !== "boolean") {
      errors.push({ index, message: "enabled must be a boolean" });
    }

    if (
      record.sortOrder !== undefined &&
      (typeof record.sortOrder !== "number" ||
        !Number.isInteger(record.sortOrder))
    ) {
      errors.push({ index, message: "sortOrder must be an integer" });
    }

    if (errors.some((error) => error.index === index)) return;

    normalized.push({
      id,
      name,
      description,
      iconUrl,
      tags: tags ?? [],
      subdomain,
      enabled: enabled as boolean,
      sortOrder:
        typeof record.sortOrder === "number" &&
        Number.isInteger(record.sortOrder)
          ? record.sortOrder
          : index,
    });
  });

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    apps: normalized.map((app, index) => ({ ...app, sortOrder: index })),
  };
};

export const buildCustomAppUrl = (
  subdomain: string,
  communityName: string,
  domain: string,
): string => `https://${subdomain}.${communityName}.${domain}`;
