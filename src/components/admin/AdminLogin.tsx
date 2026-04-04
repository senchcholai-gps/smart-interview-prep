// src/components/admin/AdminLogin.tsx
import React, { useState } from "react";
interface Props {
  onLogin: (success: boolean) => void;
}
const AdminLogin: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // Default admin credentials (in real app, this would be server-side)
  const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "admin123"
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Store admin session
      localStorage.setItem("adminUser", JSON.stringify({ username, role: "admin" }));
      onLogin(true);
    } else {
      setError("Invalid admin credentials!");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600 mt-2">Access the administration panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter admin username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter admin password"
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-semibold transition-all transform hover:scale-105"
          >
            Access Admin Panel
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Default credentials: admin / admin123</p>
          <p className="mt-2 text-xs">(Change these in production!)</p>
        </div>
      </div>
    </div>
  );
};
export default AdminLogin;
