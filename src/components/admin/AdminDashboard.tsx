import React, { useState, useEffect } from "react";
import { AdminUser, AdminStats, SystemHealth } from "./types";
import { API_URL } from "../../services/api";

interface Props {
  onLogout: () => void;
  adminUser: any;
}

// Define types for backup data
interface BackupData {
  users: any[];
  profiles: {
    [key: string]: any[];
  };
  interviews: {
    [key: string]: any[];
  };
  timestamp: string;
}

// Extended user type with profile count
interface UserWithProfiles extends AdminUser {
  profileCount: number;
  profiles: any[];
  _id?: string;
  name?: string;
  username: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  lastLogin?: string;
  totalInterviews: number;
  avgScore: number;
  isActive: boolean;
}

const AdminDashboard: React.FC<Props> = ({ onLogout, adminUser }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'profiles' | 'interviews' | 'settings'>('dashboard');
  const [users, setUsers] = useState<UserWithProfiles[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalInterviews: 0,
    avgScore: 0,
    activeUsers: 0,
    newUsersToday: 0,
    interviewsToday: 0,
    totalProfiles: 0
  });
  const [health, setHealth] = useState<SystemHealth>({
    apiStatus: 'healthy',
    lastBackup: new Date().toLocaleString(),
    storageUsed: '24.5 MB',
    activeSessions: 0
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersResponse = await fetch(`${API_URL}/api/users`);
      const usersData = await usersResponse.json();
      
      const profilesResponse = await fetch(`${API_URL}/api/profiles`);
      const profilesData = await profilesResponse.json();
      
      const interviewsResponse = await fetch(`${API_URL}/api/interviews`);
      const interviewsData = await interviewsResponse.json();

      console.log('📊 Admin Data:', { users: usersData, profiles: profilesData, interviews: interviewsData });

      const usersWithProfiles: UserWithProfiles[] = usersData.map((user: any) => {
        const userProfiles = profilesData.filter((p: any) => p.userId === user._id);
        const userInterviews = interviewsData.filter((i: any) => i.userId === user._id);
        
        const avgScore = userInterviews.length > 0 
          ? userInterviews.reduce((sum: number, i: any) => sum + (i.score || 0), 0) / userInterviews.length 
          : 0;

        const lastActive = user.lastLogin || user.joinedDate;
        const isActive = lastActive ? (new Date().getTime() - new Date(lastActive).getTime()) < 24 * 60 * 60 * 1000 : false;

        return {
          id: user._id,
          username: user.name || user.username || 'Unknown',
          name: user.name,
          email: user.email,
          phoneNumber: user.phone || '',
          createdAt: user.joinedDate,
          lastLogin: user.lastLogin,
          totalInterviews: userInterviews.length,
          avgScore,
          isActive,
          profileCount: userProfiles.length,
          profiles: userProfiles.map((p: any) => ({
            id: p._id,
            jobRole: p.jobRole,
            yearsOfExperience: p.experience,
            techStacks: p.techStack ? p.techStack.split(',').map((t: string) => t.trim()) : [],
            createdAt: p.createdAt,
            description: p.jobDescription
          }))
        };
      });

      const totalUsers = usersData.length;
      const totalProfiles = profilesData.length;
      const totalInterviews = interviewsData.length;
      const avgScore = totalInterviews > 0 
        ? interviewsData.reduce((sum: number, i: any) => sum + (i.score || 0), 0) / totalInterviews 
        : 0;

      const today = new Date().toDateString();
      
      const newUsersToday = usersData.filter((u: any) => {
        const createdDate = new Date(u.joinedDate).toDateString();
        return createdDate === today;
      }).length;

      const interviewsToday = interviewsData.filter((i: any) => {
        const interviewDate = new Date(i.date).toDateString();
        return interviewDate === today;
      }).length;

      const activeUsers = usersWithProfiles.filter(u => u.isActive).length;

      setStats({
        totalUsers,
        totalInterviews,
        avgScore: Number(avgScore.toFixed(1)),
        activeUsers,
        newUsersToday,
        interviewsToday,
        totalProfiles
      });

      setUsers(usersWithProfiles);
      setAllProfiles(profilesData);
      setInterviews(interviewsData.slice(0, 50));
      
      setHealth(prev => ({
        ...prev,
        activeSessions: activeUsers
      }));

    } catch (error) {
      console.error('❌ Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user ${username}? This action cannot be undone.`)) {
      try {
        alert('Delete user functionality requires backend DELETE endpoint');
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        const response = await fetch(`${API_URL}/api/profiles/${profileId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          alert('Profile deleted successfully!');
          fetchAdminData();
        }
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  const handleDeleteInterview = async (interviewId: string) => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      try {
        const response = await fetch(`${API_URL}/api/interviews/${interviewId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          alert('Interview deleted successfully!');
          fetchAdminData();
        } else {
          alert('Failed to delete interview');
        }
      } catch (error) {
        console.error('Error deleting interview:', error);
        alert('Error deleting interview');
      }
    }
  };

  const handleInterviewClick = (interview: any) => {
    setSelectedInterview(interview);
    setShowQuestionModal(true);
  };

  const handleBackupData = () => {
    const backupData: BackupData = {
      users: users,
      profiles: {},
      interviews: {},
      timestamp: new Date().toISOString()
    };

    users.forEach(user => {
      backupData.profiles[user.username] = user.profiles;
    });

    interviews.forEach(interview => {
      const key = `interviews_${interview.username}`;
      if (!backupData.interviews[key]) {
        backupData.interviews[key] = [];
      }
      backupData.interviews[key].push(interview);
    });

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      if (!e.target || !e.target.result) {
        alert('Error reading file!');
        return;
      }

      try {
        const backup = JSON.parse(e.target.result as string) as BackupData;
        if (window.confirm('This will overwrite all existing data. Continue?')) {
          alert('Restore functionality requires backend implementation');
        }
      } catch (error) {
        alert('Invalid backup file!');
      }
    };
    reader.readAsText(file);
  };

  const toggleUserExpansion = (username: string) => {
    setExpandedUser(expandedUser === username ? null : username);
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navigation */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-purple-200">Welcome, {adminUser?.username || 'Admin'}</span>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all"
              >
                🚪 Logout
              </button>
            </div>
          </div>
          {/* Admin Tabs */}
          <div className="flex gap-6 mt-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === 'dashboard' 
                  ? 'border-b-2 border-white text-white' 
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === 'users' 
                  ? 'border-b-2 border-white text-white' 
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              👥 Users
            </button>
            <button
              onClick={() => setActiveTab('profiles')}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === 'profiles' 
                  ? 'border-b-2 border-white text-white' 
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              📋 Profiles
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === 'interviews' 
                  ? 'border-b-2 border-white text-white' 
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              🎯 Interviews
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === 'settings' 
                  ? 'border-b-2 border-white text-white' 
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-100">Total Users</p>
                    <p className="text-4xl font-bold mt-2">{stats.totalUsers}</p>
                  </div>
                  <span className="text-4xl">👥</span>
                </div>
                <div className="mt-4 text-sm text-blue-100">
                  <span className="text-green-300">+{stats.newUsersToday}</span> new today
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-purple-100">Total Profiles</p>
                    <p className="text-4xl font-bold mt-2">{stats.totalProfiles}</p>
                  </div>
                  <span className="text-4xl">📋</span>
                </div>
                <div className="mt-4 text-sm text-purple-100">
                  Avg {(stats.totalProfiles / (stats.totalUsers || 1)).toFixed(1)} per user
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-green-100">Total Interviews</p>
                    <p className="text-4xl font-bold mt-2">{stats.totalInterviews}</p>
                  </div>
                  <span className="text-4xl">🎯</span>
                </div>
                <div className="mt-4 text-sm text-green-100">
                  <span className="text-green-300">+{stats.interviewsToday}</span> today
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-yellow-100">Average Score</p>
                    <p className="text-4xl font-bold mt-2">{stats.avgScore}</p>
                  </div>
                  <span className="text-4xl">⭐</span>
                </div>
                <div className="mt-4 text-sm text-yellow-100">
                  out of 10
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">📈 User Growth</h3>
                <div className="h-64 flex items-end gap-2">
                  {[65, 72, 78, 85, 92, 98, 105].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg"
                        style={{ height: `${height}px` }}
                      ></div>
                      <span className="text-xs text-gray-600">Day {i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">🎯 Interview Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Success Rate</span>
                      <span className="font-semibold">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Profile Creation Rate</span>
                      <span className="font-semibold">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">🖥️ System Health</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    health.apiStatus === 'healthy' ? 'bg-green-500 animate-pulse' : 
                    health.apiStatus === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-sm text-gray-500">API Status</p>
                    <p className="font-semibold capitalize">{health.apiStatus}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Backup</p>
                  <p className="font-semibold">{health.lastBackup}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Storage Used</p>
                  <p className="font-semibold">{health.storageUsed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Sessions</p>
                  <p className="font-semibold">{health.activeSessions}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold">👥 User Management</h2>
                  <p className="text-gray-600 mt-1">Manage all registered users and their profiles</p>
                </div>
                
                {/* Search Bar - Right Corner */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 Search by username or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-72 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Showing {filteredUsers.length} of {users.length} users
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profiles</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interviews</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <React.Fragment key={user.id}>
                      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleUserExpansion(user.username)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {user.username?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-medium">{user.username || user.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">Click to view profiles</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm">{user.email}</p>
                          <p className="text-sm text-gray-500">{user.phoneNumber}</p>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                            {user.profileCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          {user.totalInterviews}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{user.avgScore.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">/10</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user.id, user.username);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Delete User"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                      {expandedUser === user.username && user.profiles.length > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="ml-12">
                              <h4 className="font-semibold mb-3 text-gray-700">📋 Profiles for {user.username}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {user.profiles.map((profile, index) => (
                                  <div key={index} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                      <h5 className="font-bold text-blue-600">{profile.jobRole}</h5>
                                      <button
                                        onClick={() => handleDeleteProfile(profile.id)}
                                        className="text-red-400 hover:text-red-600 text-sm"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">{profile.yearsOfExperience} years exp</p>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {profile.techStacks?.slice(0, 3).map((tech: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                          {tech}
                                        </span>
                                      ))}
                                      {profile.techStacks?.length > 3 && (
                                        <span className="text-xs text-gray-500">+{profile.techStacks.length - 3}</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-400">
                                      Created: {new Date(profile.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'profiles' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">📋 All Profiles</h2>
              <p className="text-gray-600 mt-1">View all job profiles created by users</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tech Stack</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allProfiles.map((profile, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{profile.userName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-blue-600">{profile.jobRole}</td>
                      <td className="px-6 py-4">{profile.experience}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {profile.techStack?.split(',').slice(0, 2).map((tech: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {tech.trim()}
                            </span>
                          ))}
                          {profile.techStack?.split(',').length > 2 && (
                            <span className="text-xs text-gray-500">+{profile.techStack.split(',').length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{new Date(profile.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteProfile(profile._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Profile"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'interviews' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">🎯 Recent Interviews</h2>
              <p className="text-gray-600 mt-1">Click on any interview to view detailed questions and answers</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tech Stack</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {interviews.map((interview: any, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium cursor-pointer" onClick={() => handleInterviewClick(interview)}>
                        {interview.userName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => handleInterviewClick(interview)}>
                        {interview.jobRole}
                      </td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => handleInterviewClick(interview)}>
                        <div className="flex flex-wrap gap-1">
                          {interview.techStack?.split(',').slice(0, 2).map((tech: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {tech.trim()}
                            </span>
                          ))}
                          {interview.techStack?.split(',').length > 2 && (
                            <span className="text-xs text-gray-500">+{interview.techStack.split(',').length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm cursor-pointer" onClick={() => handleInterviewClick(interview)}>
                        {new Date(interview.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => handleInterviewClick(interview)}>
                        <span className={`font-semibold ${
                          interview.score >= 7 ? 'text-green-600' :
                          interview.score >= 4 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {interview.score}
                        </span>
                      </td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => handleInterviewClick(interview)}>
                        <span className="text-blue-500 hover:text-blue-700 underline">View Details</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteInterview(interview._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Interview"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Interview Question Modal */}
        {showQuestionModal && selectedInterview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Interview Details</h2>
                  <p className="text-gray-500 mt-1">
                    {selectedInterview.userName || 'Unknown'} • {selectedInterview.jobRole} • {new Date(selectedInterview.date).toLocaleString()}
                  </p>
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedInterview.score >= 7 ? 'bg-green-100 text-green-700' :
                      selectedInterview.score >= 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      Score: {selectedInterview.score}/10
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {selectedInterview.questions && selectedInterview.questions.length > 0 ? (
                  selectedInterview.questions.map((q: any, idx: number) => (
                    <div key={idx} className="border rounded-xl p-5 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-blue-600">Question {idx + 1}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          q.rating >= 7 ? 'bg-green-100 text-green-700' :
                          q.rating >= 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          Score: {q.rating}/10
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Question:</p>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{q.question}</p>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-blue-700 mb-1">User's Answer:</p>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg whitespace-pre-wrap">{q.answer}</p>
                      </div>
                      
                      {q.correctAnswer && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-green-700 mb-1">Model Answer:</p>
                          <p className="text-gray-700 bg-green-50 p-3 rounded-lg whitespace-pre-wrap">{q.correctAnswer}</p>
                        </div>
                      )}
                      
                      {(q.matchedPoints && q.matchedPoints.length > 0) && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-green-600 mb-1">✓ Covered Points:</p>
                          <ul className="list-disc list-inside text-gray-600">
                            {q.matchedPoints.map((point: string, i: number) => (
                              <li key={i} className="text-sm">{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {(q.missedPoints && q.missedPoints.length > 0) && (
                        <div>
                          <p className="text-sm font-semibold text-red-600 mb-1">✗ Missed Points:</p>
                          <ul className="list-disc list-inside text-gray-600">
                            {q.missedPoints.map((point: string, i: number) => (
                              <li key={i} className="text-sm">{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No detailed question data available for this interview.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">💾 Backup & Restore</h3>
              <div className="space-y-4">
                <button
                  onClick={handleBackupData}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  📥 Download Backup
                </button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreData}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all">
                    📤 Restore from Backup
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">⚙️ System Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Maintenance Mode</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span>Allow New Registrations</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="pt-4">
                  <label className="block text-sm font-medium mb-2">Max Questions per Set</label>
                  <input type="number" defaultValue={5} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;