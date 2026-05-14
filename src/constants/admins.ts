export const AUTHORIZED_ADMINS = [
  'ronisouza495@gmail.com',
  'ronilsondesouza045@gmail.com'
];

export const isAdminEmail = (email: string | null | undefined) => {
  if (!email) return false;
  return AUTHORIZED_ADMINS.includes(email.toLowerCase());
};
