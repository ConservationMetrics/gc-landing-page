/** Auth redirect origin. https://<community>.<rootDomain> when both env vars are set. */
export const landingBaseUrl = (): string => {
  const communityName = process.env.NUXT_PUBLIC_COMMUNITY_NAME?.trim();
  const rootDomain = process.env.NUXT_PUBLIC_ROOT_DOMAIN?.trim();
  if (!communityName || !rootDomain) return "http://localhost:8080";
  return `https://${communityName}.${rootDomain}`;
};
