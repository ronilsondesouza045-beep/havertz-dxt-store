export const ADMIN_EMAIL = 'havertz.dxt@gmail.com';

export const AUTHORIZED_ADMINS = [
  ADMIN_EMAIL
];

export const isAdminEmail = (email: string | null | undefined) => {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};
