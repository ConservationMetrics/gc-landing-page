export const GC_SERVICE_DOMAIN = "guardianconnector.net";

/**
 * Builds the HTTPS URL for a GC service subdomain.
 *
 * @param {string} service - Service subdomain prefix (e.g. explorer, superset).
 * @param {string} communityName - Community alias.
 * @returns {string} Full service URL.
 */
export const buildServiceUrl = (
  service: string,
  communityName: string,
): string => {
  return `https://${service}.${communityName}.${GC_SERVICE_DOMAIN}`;
};
