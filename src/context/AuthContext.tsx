import React, { createContext, useState, useContext, ReactNode } from 'react';

type User = {
  username: string;
  email: string;
  name?: string;
  location?: string;
  phoneNo?: string;
  twelfthPercentage?: string;
  ugCollege?: string;
  ugCourse?: string;
  ugCGPA?: string;
  pgCollege?: string;
  pgCourse?: string;
  pgCGPA?: string;
  _id?: string; // Make sure to include _id from backend
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  signup: (userData: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    // In real app, you would verify credentials with backend
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('User logged in:', userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    console.log('User logged out');
  };

  const signup = (userData: User) => {
    // In real app, you would send to backend
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('User signed up:', userData);
  };

  // Check localStorage on initial load
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log('✅ User restored from localStorage:', parsedUser.name || parsedUser.email);
      } catch (error) {
        console.error('❌ Error parsing saved user:', error);
      }
    } else {
      console.log('ℹ️ No user found in localStorage');
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};