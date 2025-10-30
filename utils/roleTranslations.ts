/**
 * Utility function to translate role names using i18n
 * @param roleName - The role name to translate
 * @param t - The i18n translation function
 * @returns Translated role name
 */
export const translateRoleName = (roleName: string, t: (key: string) => string): string => {
  // Normalize the role name: lowercase, replace underscores with spaces, then capitalize first letter
  const normalizedRole = roleName
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  
  // Handle special case for SignedIn - convert "Signed In" back to "SignedIn" (camelCase)
  const finalRole = normalizedRole === 'Signed In' ? 'SignedIn' : normalizedRole;
  
  // Map normalized role names to translation keys
  const roleMap: Record<string, string> = {
    'Admin': 'roles.admin',
    'Member': 'roles.member',
    'Guest': 'roles.guest',
    'SignedIn': 'roles.signedIn',
  };
  
  const translationKey = roleMap[finalRole] || roleName;
  return t(translationKey);
};
