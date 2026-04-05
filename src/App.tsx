import React, { useState, useEffect } from "react";
import JobProfileCreation from "./components/job-profile/JobProfileCreation";
import Dashboard from "./components/dashboard/Dashboard";
import InterviewSession from "./components/interview/InterviewSession";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";

interface User {
  username: string;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  createdAt: string;
  _id?: string;
  role?: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showJobProfileCreation, setShowJobProfileCreation] = useState(false);
  const [showInterviewSession, setShowInterviewSession] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setIsAuthenticated(true);

        // Only set admin if email is admin@gmail.com
        if (user.email === 'admin@gmail.com') {
          setIsAdmin(true);
          setAdminUser(user);
          console.log("✅ Admin detected:", user.email);
        } else {
          setIsAdmin(false);
          setAdminUser(null);
        }
      } catch (error) {
        console.error("Error parsing user:", error);
      }
    }

    const adminStr = localStorage.getItem("adminUser");
    if (adminStr) {
      try {
        const admin = JSON.parse(adminStr);
        setAdminUser(admin);
        setIsAdmin(true);
      } catch (error) {
        console.error("Error parsing admin:", error);
      }
    }
  }, []);

  const handleTakeInterview = () => {
    if (isAuthenticated) {
      setShowJobProfileCreation(true);
    } else {
      alert("Please login first");
      setShowLoginModal(true);
    }
  };

  const handleJobProfileSubmit = (jobProfile: any) => {
    const username = currentUser?.username;
    if (!username) {
      alert("User not found. Please login again.");
      return;
    }
    const profileKey = `jobProfiles_${username}`;
    const existingProfiles = JSON.parse(localStorage.getItem(profileKey) || '[]');
    const newProfile = {
      ...jobProfile,
      id: `job_${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: username
    };
    existingProfiles.push(newProfile);
    localStorage.setItem(profileKey, JSON.stringify(existingProfiles));
    alert("✅ Job profile created successfully!");
    setShowJobProfileCreation(false);
  };

  const handleStartInterview = (jobProfile: any) => {
    setSelectedProfile(jobProfile);
    setShowInterviewSession(true);
  };

  const handleEndInterview = () => {
    setShowInterviewSession(false);
    setSelectedProfile(null);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }
    if (!phoneNumber.match(/^\d{10}$/)) {
      alert("Please enter a valid 10-digit phone number!");
      return;
    }

    try {
      const response = await fetch('https://smart-interview-prep-backend-23bz.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: username,
          username: username,
          email: email,
          phoneNo: phoneNumber,
          password: password,
          role: 'user',
          status: 'Active'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const dbUser = data.user || data;

      setShowSignupModal(false);

      try {
        e.currentTarget.reset();
      } catch (resetError) {
        console.log('Form reset skipped');
      }

      alert(`✅ Account created for ${dbUser.name || dbUser.username}! Please login to continue.`);

    } catch (error: any) {
      console.error('❌ Signup error:', error);
      alert(error.message || 'Registration failed. Please try again.');
    }
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const loginInput = formData.get('loginInput') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    fetch('https://smart-interview-prep-backend-23bz.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: loginInput,
        password: password
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.user || data._id) {
          const dbUser = data.user || data;
          localStorage.setItem('user', JSON.stringify(dbUser));
          setCurrentUser(dbUser);
          setIsAuthenticated(true);

          // Only set admin if email is admin@gmail.com
          if (dbUser.email === 'admin@gmail.com') {
            setIsAdmin(true);
            setAdminUser(dbUser);
            console.log("✅ Admin logged in:", dbUser.email);
          } else {
            setIsAdmin(false);
            setAdminUser(null);
          }

          setShowLoginModal(false);
          setCurrentPage('home');
          try {
            e.currentTarget.reset();
          } catch (resetError) {
            console.log('Form reset skipped');
          }
          alert(`Welcome back, ${dbUser.name || dbUser.username}!`);
        } else {
          alert("Invalid username/email or password!");
        }
      })
      .catch(err => {
        console.error('Login error:', err);
        alert("Login failed. Please try again.");
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAdminUser(null);
    setShowAdminDashboard(false);
    setCurrentPage('home');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminUser');
    setIsAdmin(false);
    setAdminUser(null);
    setShowAdminDashboard(false);
    setShowAdminLogin(false);
  };

  const handleAdminButtonClick = () => {
    setShowAdminLogin(true);
  };

  const handleAdminLoginSuccess = (success: boolean) => {
    if (success) {
      const admin = JSON.parse(localStorage.getItem("adminUser") || "{}");
      if (admin && admin.username) {
        setAdminUser(admin);
        setIsAdmin(true);
        setShowAdminLogin(false);
        setShowAdminDashboard(true);
      }
    }
  };

  if (showAdminDashboard && adminUser) {
    return <AdminDashboard onLogout={handleAdminLogout} adminUser={adminUser} />;
  }

  if (showAdminLogin) {
    return <AdminLogin onLogin={handleAdminLoginSuccess} />;
  }

  if (showInterviewSession && selectedProfile) {
    return <InterviewSession profile={selectedProfile} onEnd={handleEndInterview} />;
  }

  if (showJobProfileCreation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SmartInterviewPrep
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Welcome, {currentUser?.username}</span>
                <button onClick={handleLogout} className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50">
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <JobProfileCreation onSubmit={handleJobProfileSubmit} onCancel={() => setShowJobProfileCreation(false)} />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SmartInterviewPrep
              </h1>
              <div className="hidden md:flex items-center space-x-8">
                <button onClick={() => setCurrentPage('home')} className={`px-3 py-2 text-sm font-medium transition-all ${currentPage === 'home' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                  🏠 Home
                </button>
                <button onClick={() => setCurrentPage('about')} className={`px-3 py-2 text-sm font-medium transition-all ${currentPage === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                  📖 About Us
                </button>
                <button onClick={() => setCurrentPage('services')} className={`px-3 py-2 text-sm font-medium transition-all ${currentPage === 'services' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                  🛠️ Services
                </button>
                <button onClick={() => setCurrentPage('contact')} className={`px-3 py-2 text-sm font-medium transition-all ${currentPage === 'contact' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                  📞 Contact Us
                </button>
                <button onClick={handleTakeInterview} className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700">
                  🎤 Take an Interview
                </button>

                {/* Admin button - ONLY shows for admin@gmail.com */}
                {currentUser?.email === 'admin@gmail.com' && (
                  <button onClick={handleAdminButtonClick} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700">
                    👑 Admin
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">👋 Welcome, <span className="font-semibold text-blue-600">{currentUser?.name || currentUser?.username || 'User'}</span></span>
                <button onClick={handleLogout} className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50">
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <div className="py-8">
          {currentPage === 'home' && (
            <Dashboard
              user={currentUser}
              onTakeInterview={handleStartInterview}
              onNavigate={setCurrentPage}
              onLogout={handleLogout}
              activePage={currentPage}
            />
          )}
          {currentPage === 'about' && (
            <div className="max-w-7xl mx-auto px-4 py-16">
              <h1 className="text-5xl font-bold text-center text-gray-900 mb-4">📖 About Us</h1>
              <p className="text-xl text-center text-gray-600 mb-12">Empowering developers worldwide with 100% FREE AI-powered interview practice</p>
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
                  <div className="text-6xl mb-4 text-center">🚀</div>
                  <h2 className="text-3xl font-bold mb-4 text-center">Our Mission</h2>
                  <p className="text-gray-600 text-center text-lg">To democratize interview preparation by providing completely FREE, AI-powered tools that help developers of all skill levels practice and succeed.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
                  <div className="text-6xl mb-4 text-center">🎯</div>
                  <h2 className="text-3xl font-bold mb-4 text-center">Our Vision</h2>
                  <p className="text-gray-600 text-center text-lg">To become the world's most accessible interview preparation platform, helping 1 million developers land their dream jobs.</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white mb-16 transform hover:scale-105 transition-all">
                <div className="text-center max-w-3xl mx-auto">
                  <div className="text-7xl mb-6 animate-bounce">❤️</div>
                  <h3 className="text-4xl font-bold mb-6">Our Promise</h3>
                  <p className="text-2xl text-white/90 mb-4">All our services are <span className="font-extrabold underline decoration-yellow-300">100% FREE</span></p>
                  <p className="text-xl text-white/80">No hidden costs • No premium tiers • No credit card required</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg">
                  <div className="text-5xl mb-4">👥</div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                  <div className="text-gray-700 text-lg">Active Users</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg">
                  <div className="text-5xl mb-4">🎯</div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">50K+</div>
                  <div className="text-gray-700 text-lg">Interviews Completed</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg">
                  <div className="text-5xl mb-4">⭐</div>
                  <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
                  <div className="text-gray-700 text-lg">Success Rate</div>
                </div>
              </div>
            </div>
          )}
          {currentPage === 'services' && (
            <div className="max-w-7xl mx-auto px-4 py-16">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">🛠️ Our Services</h1>
                <p className="text-xl text-gray-600 mb-4">All services are <span className="font-bold text-green-600 text-2xl">100% FREE</span></p>
                <p className="text-lg text-gray-500">No subscriptions • No hidden fees • No credit card required</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all group">
                  <div className="relative">
                    <div className="absolute -top-4 -right-4 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full animate-pulse">🆓 FREE</div>
                    <div className="text-7xl mb-6 text-center group-hover:scale-110 transition-transform">🎤</div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-center">AI Mock Interviews</h3>
                  <p className="text-gray-600 mb-6 text-center">Practice with our advanced AI interviewer that adapts to your skill level and tech stack.</p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Unlimited interviews</li>
                    <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Role-specific questions</li>
                    <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Real-time feedback</li>
                  </ul>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all group">
                  <div className="relative">
                    <div className="absolute -top-4 -right-4 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full animate-pulse">🆓 FREE</div>
                    <div className="text-7xl mb-6 text-center group-hover:scale-110 transition-transform">📊</div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-center">Performance Analytics</h3>
                  <p className="text-gray-600 mb-6 text-center">Track your progress with detailed analytics and identify areas for improvement.</p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Score tracking</li>
                    <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Weakness analysis</li>
                    <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Progress tracking</li>
                  </ul>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all group">
                  <div className="relative">
                    <div className="absolute -top-4 -right-4 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full animate-pulse">🆓 FREE</div>
                    <div className="text-7xl mb-6 text-center group-hover:scale-110 transition-transform">💡</div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-center">Skill Assessment</h3>
                  <p className="text-gray-600 mb-6 text-center">Get comprehensive assessments of your technical skills with personalized recommendations.</p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Technical knowledge</li>
                    <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Problem-solving ability</li>
                    <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Communication skills</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 rounded-3xl p-12 text-white text-center transform hover:scale-105 transition-all">
                <div className="max-w-3xl mx-auto">
                  <div className="text-8xl mb-6 animate-bounce">🆓</div>
                  <h3 className="text-4xl font-bold mb-6">All Services Are Completely Free</h3>
                  <p className="text-2xl text-white/90 mb-8">No subscriptions • No hidden fees • No credit card required</p>
                </div>
              </div>
            </div>
          )}
          {currentPage === 'contact' && (
            <div className="max-w-7xl mx-auto px-4 py-16">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">📞 Contact Us</h1>
                <p className="text-xl text-gray-600 mb-4">We're here to help - support is always <span className="font-bold text-green-600">FREE</span></p>
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all">
                    <h3 className="text-3xl font-bold mb-8 text-center">📱 Get in Touch</h3>
                    <div className="space-y-6">
                      <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl hover:scale-105 transition-all">
                        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">📧</div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-xl font-semibold">support@smartinterviewprep.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl hover:scale-105 transition-all">
                        <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">💬</div>
                        <div>
                          <p className="text-sm text-gray-500">Discord</p>
                          <p className="text-xl font-semibold">discord.gg/smartinterview</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl hover:scale-105 transition-all">
                        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">🐦</div>
                        <div>
                          <p className="text-sm text-gray-500">Twitter</p>
                          <p className="text-xl font-semibold">@SmartInterviewPrep</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-xl">
                  <h3 className="text-3xl font-bold mb-8 text-center">📝 Send us a message</h3>
                  <form className="space-y-6">
                    <input type="text" placeholder="Your Name" className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-lg" />
                    <input type="email" placeholder="Your Email" className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-lg" />
                    <textarea rows={5} placeholder="Your Message" className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-lg"></textarea>
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg">
                      Send Message 📨
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SmartInterviewPrep
            </h1>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => setCurrentPage('home')} className={`px-3 py-2 text-sm font-medium transition-all ${currentPage === 'home' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                🏠 Home
              </button>
              <button onClick={() => setCurrentPage('about')} className={`px-3 py-2 text-sm font-medium transition-all ${currentPage === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                📖 About Us
              </button>
              <button onClick={() => setCurrentPage('services')} className={`px-3 py-2 text-sm font-medium transition-all ${currentPage === 'services' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                🛠️ Services
              </button>
              <button onClick={() => setCurrentPage('contact')} className={`px-3 py-2 text-sm font-medium transition-all ${currentPage === 'contact' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                📞 Contact Us
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowLoginModal(true)} className="px-6 py-2 text-blue-600 font-semibold hover:text-blue-700">
                🔐 Login
              </button>
              <button onClick={() => setShowSignupModal(true)} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700">
                ✨ Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8">
        {currentPage === 'home' && (
          <>
            <div className="relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
              </div>
              <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="text-center lg:text-left">
                    <h1 className="text-5xl md:text-6xl font-extrabold">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Smart Interview
                      </span>
                      <br />
                      <span className="text-gray-900">Preparation System</span>
                    </h1>
                    <p className="mt-6 text-xl text-gray-600 max-w-3xl">
                      Free AI-powered platform to help you ace technical interviews using React, TypeScript, and Gemini AI
                    </p>
                    <div className="mt-8 flex justify-center lg:justify-start space-x-12">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">10K+</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <span className="text-lg">👥</span> Users
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">50K+</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <span className="text-lg">🎯</span> Interviews
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">95%</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <span className="text-lg">⭐</span> Success
                        </div>
                      </div>
                    </div>
                    <div className="mt-10">
                      <button onClick={() => setShowSignupModal(true)} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg text-lg">
                        ✨ Sign Up to Start ✨
                      </button>
                    </div>
                    <p className="mt-4 text-green-600 font-semibold flex items-center justify-center lg:justify-start gap-2">
                      <span className="text-xl">🆓</span> All Services Are 100% Free <span className="text-xl">🆓</span>
                    </p>
                  </div>
                  <div className="relative">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 transform hover:scale-105 transition-all duration-500">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-gray-600">
                            <span className="text-lg">🤖</span> AI Assistant Online
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-around py-4">
                        <div className="text-center group">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-2 shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all">
                            <span className="text-5xl">👤</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">You</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-4xl text-purple-500 animate-pulse">⚡</div>
                          <div className="text-xs text-gray-400 mt-1">AI Processing</div>
                        </div>
                        <div className="text-center group">
                          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mb-2 shadow-xl transform group-hover:scale-110 group-hover:-rotate-3 transition-all">
                            <span className="text-5xl">🤖</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Gemini AI</span>
                        </div>
                      </div>
                      <div className="mt-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                            <span className="text-lg">👤</span>
                          </div>
                          <div className="flex-1">
                            <div className="bg-blue-50 rounded-2xl rounded-tl-none p-3 max-w-xs">
                              <p className="text-sm text-gray-800">"How do I prepare for React interviews?"</p>
                            </div>
                            <span className="text-xs text-gray-400 mt-1 block">Just now</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm">
                            <span className="text-lg">🤖</span>
                          </div>
                          <div className="flex-1">
                            <div className="bg-purple-50 rounded-2xl rounded-tl-none p-3 max-w-sm">
                              <p className="text-sm text-gray-800">"I'll generate personalized questions based on your experience with React!"</p>
                            </div>
                            <span className="text-xs text-gray-400 mt-1 block">1 min ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-400 ml-2">AI Analysis Complete</span>
                        </div>
                        <div className="flex items-center justify-between text-white">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">95%</div>
                            <div className="text-xs text-gray-400">Match Rate</div>
                          </div>
                          <div className="w-px h-8 bg-gray-700"></div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">3/5</div>
                            <div className="text-xs text-gray-400">Key Points</div>
                          </div>
                          <div className="w-px h-8 bg-gray-700"></div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">2</div>
                            <div className="text-xs text-gray-400">Improvements</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-2xl animate-bounce shadow-xl">
                      ⚡
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-xl animate-pulse shadow-xl">
                      💬
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="max-w-4xl mx-auto px-4 py-12">
              <div className="bg-gray-900 rounded-lg p-6 text-green-400 font-mono text-sm text-center border border-gray-700">
                "componentDidMount for API calls, componentDidUpdate for prop changes, and componentWillUnmount for cleanup"
              </div>
              <p className="text-center text-gray-600 mt-4">🤝 Human-AI Interaction • 100% Free Services</p>
            </div>
          </>
        )}
        {currentPage === 'about' && (
          <div className="max-w-7xl mx-auto px-4 py-16">
            <h1 className="text-5xl font-bold text-center text-gray-900 mb-4">📖 About Us</h1>
            <p className="text-xl text-center text-gray-600 mb-12">Empowering developers worldwide with 100% FREE AI-powered interview practice</p>
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="text-6xl mb-4 text-center">🚀</div>
                <h2 className="text-3xl font-bold mb-4 text-center">Our Mission</h2>
                <p className="text-gray-600 text-center text-lg">To democratize interview preparation by providing completely FREE, AI-powered tools that help developers of all skill levels practice and succeed.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="text-6xl mb-4 text-center">🎯</div>
                <h2 className="text-3xl font-bold mb-4 text-center">Our Vision</h2>
                <p className="text-gray-600 text-center text-lg">To become the world's most accessible interview preparation platform, helping 1 million developers land their dream jobs.</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white mb-16 transform hover:scale-105 transition-all">
              <div className="text-center max-w-3xl mx-auto">
                <div className="text-7xl mb-6 animate-bounce">❤️</div>
                <h3 className="text-4xl font-bold mb-6">Our Promise</h3>
                <p className="text-2xl text-white/90 mb-4">All our services are <span className="font-extrabold underline decoration-yellow-300">100% FREE</span></p>
                <p className="text-xl text-white/80">No hidden costs • No premium tiers • No credit card required</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg">
                <div className="text-5xl mb-4">👥</div>
                <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-700 text-lg">Active Users</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg">
                <div className="text-5xl mb-4">🎯</div>
                <div className="text-4xl font-bold text-purple-600 mb-2">50K+</div>
                <div className="text-gray-700 text-lg">Interviews Completed</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg">
                <div className="text-5xl mb-4">⭐</div>
                <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
                <div className="text-gray-700 text-lg">Success Rate</div>
              </div>
            </div>
          </div>
        )}
        {currentPage === 'services' && (
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">🛠️ Our Services</h1>
              <p className="text-xl text-gray-600 mb-4">All services are <span className="font-bold text-green-600 text-2xl">100% FREE</span></p>
              <p className="text-lg text-gray-500">No subscriptions • No hidden fees • No credit card required</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all group">
                <div className="relative">
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full animate-pulse">🆓 FREE</div>
                  <div className="text-7xl mb-6 text-center group-hover:scale-110 transition-transform">🎤</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">AI Mock Interviews</h3>
                <p className="text-gray-600 mb-6 text-center">Practice with our advanced AI interviewer that adapts to your skill level and tech stack.</p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Unlimited interviews</li>
                  <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Role-specific questions</li>
                  <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Real-time feedback</li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all group">
                <div className="relative">
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full animate-pulse">🆓 FREE</div>
                  <div className="text-7xl mb-6 text-center group-hover:scale-110 transition-transform">📊</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Performance Analytics</h3>
                <p className="text-gray-600 mb-6 text-center">Track your progress with detailed analytics and identify areas for improvement.</p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Score tracking</li>
                  <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Weakness analysis</li>
                  <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Progress tracking</li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all group">
                <div className="relative">
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full animate-pulse">🆓 FREE</div>
                  <div className="text-7xl mb-6 text-center group-hover:scale-110 transition-transform">💡</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Skill Assessment</h3>
                <p className="text-gray-600 mb-6 text-center">Get comprehensive assessments of your technical skills with personalized recommendations.</p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Technical knowledge</li>
                  <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Problem-solving ability</li>
                  <li className="flex items-center gap-3"><span className="text-green-500 text-xl">✓</span> Communication skills</li>
                </ul>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 rounded-3xl p-12 text-white text-center transform hover:scale-105 transition-all">
              <div className="max-w-3xl mx-auto">
                <div className="text-8xl mb-6 animate-bounce">🆓</div>
                <h3 className="text-4xl font-bold mb-6">All Services Are Completely Free</h3>
                <p className="text-2xl text-white/90 mb-8">No subscriptions • No hidden fees • No credit card required</p>
              </div>
            </div>
          </div>
        )}
        {currentPage === 'contact' && (
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">📞 Contact Us</h1>
              <p className="text-xl text-gray-600 mb-4">We're here to help - support is always <span className="font-bold text-green-600">FREE</span></p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all">
                  <h3 className="text-3xl font-bold mb-8 text-center">📱 Get in Touch</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl hover:scale-105 transition-all">
                      <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">📧</div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-xl font-semibold">support@smartinterviewprep.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl hover:scale-105 transition-all">
                      <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">💬</div>
                      <div>
                        <p className="text-sm text-gray-500">Discord</p>
                        <p className="text-xl font-semibold">discord.gg/smartinterview</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl hover:scale-105 transition-all">
                      <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">🐦</div>
                      <div>
                        <p className="text-sm text-gray-500">Twitter</p>
                        <p className="text-xl font-semibold">@SmartInterviewPrep</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-xl">
                <h3 className="text-3xl font-bold mb-8 text-center">📝 Send us a message</h3>
                <form className="space-y-6">
                  <input type="text" placeholder="Your Name" className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-lg" />
                  <input type="email" placeholder="Your Email" className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-lg" />
                  <textarea rows={5} placeholder="Your Message" className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-lg"></textarea>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg">
                    Send Message 📨
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>

      {/* Signup Modal - Simplified */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">✨ Create Your Account</h2>
              <button onClick={() => setShowSignupModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                <input type="text" name="username" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Choose a username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" name="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input type="tel" name="phoneNumber" required pattern="[0-9]{10}" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="10-digit mobile number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input type="password" name="password" required minLength={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Minimum 6 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <input type="password" name="confirmPassword" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Re-enter password" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold">
                  Create Account
                </button>
                <button type="button" onClick={() => setShowSignupModal(false)} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Modal - With Confirm Password */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">🔐 Login to Your Account</h2>
              <button onClick={() => setShowLoginModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username or Email *</label>
                <input type="text" name="loginInput" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter your username or email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input type="password" name="password" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter your password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <input type="password" name="confirmPassword" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Re-enter your password" />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold">
                  Login
                </button>
                <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button onClick={() => { setShowLoginModal(false); setShowSignupModal(true); }} className="text-blue-600 hover:text-blue-800 font-semibold">
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;