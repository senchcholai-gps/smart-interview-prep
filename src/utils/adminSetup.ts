export const isAdminCredentials = (username: string, password: string): boolean => {
  const adminStr = localStorage.getItem('admin_user');
  if (!adminStr) return false;
  try {
    const admin = JSON.parse(adminStr);
    return admin.username === username && admin.password === password;
  } catch {
    return false;
  }
};
export const getAdminUser = () => {
  const adminStr = localStorage.getItem('admin_user');
  return adminStr ? JSON.parse(adminStr) : null;
};
