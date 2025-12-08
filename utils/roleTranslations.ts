/**
 * Utility function to translate role names using i18n
 * @param roleName - The role name to translate
 * @param t - The i18n translation function
 * @returns Translated role name
 */
export const translateRoleName = (
  roleName: string,
  t: (key: string) => string,
): string => {
  // Map role names directly to translation keys
  const roleMap: Record<string, string> = {
    Admin: "roles.admin",
    Member: "roles.member",
    Guest: "roles.guest",
    SignedIn: "roles.signedIn",
  };

  const translationKey = roleMap[roleName] || roleName;
  return t(translationKey);
};

/**
 * Utility function to translate role descriptions using i18n
 * @param roleName - The role name to get description for
 * @param t - The i18n translation function
 * @returns Translated role description
 */
export const translateRoleDescription = (
  roleName: string,
  t: (key: string) => string,
): string => {
  // Map role names directly to description translation keys
  const descriptionMap: Record<string, string> = {
    Admin: "roles.adminDescription",
    Member: "roles.memberDescription",
    Guest: "roles.guestDescription",
    SignedIn: "roles.signedInDescription",
  };

  const translationKey = descriptionMap[roleName];
  return translationKey ? t(translationKey) : "";
};
