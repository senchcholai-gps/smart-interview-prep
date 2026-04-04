// src/scripts/setupAdmin.ts
export const setupAdminAccount = () => {
  // Check if admin already exists in a separate storage
  const adminExists = localStorage.getItem('admin_configured');
  if (adminExists) {
    console.log('✅ Admin already configured');
    return false;
  }
  // Create admin user in separate storage (not in regular users)
  const adminUser = {
    username: 'admin',
    email: 'admin@smartinterview.com',
    password: 'admin123',
    role: 'superadmin',
    createdAt: new Date().toISOString()
  };
  // Store admin separately from regular users
  localStorage.setItem('admin_user', JSON.stringify(adminUser));
  localStorage.setItem('admin_configured', 'true');
  console.log('✅ Admin account created successfully!');
  console.log('📝 Admin credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  return true;
};
// Function to check if credentials are for admin
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
// Function to get admin user
export const getAdminUser = () => {
  const adminStr = localStorage.getItem('admin_user');
  return adminStr ? JSON.parse(adminStr) : null;
};
// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  console.log('🚀 Running admin setup...');
  setupAdminAccount();
}
