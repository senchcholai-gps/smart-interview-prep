// src/components/admin/types.ts
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  lastLogin?: string;
  totalInterviews: number;
  avgScore: number;
  isActive: boolean;
}
export interface AdminStats {
  totalUsers: number;
  totalInterviews: number;
  avgScore: number;
  activeUsers: number;
  newUsersToday: number;
  interviewsToday: number;
  totalProfiles: number;  // Added this line
}
export interface InterviewData {
  id: string;
  username: string;
  jobRole: string;
  techStacks: string[];
  date: string;
  score: number;
  questionsCount: number;
}
export interface SystemHealth {
  apiStatus: 'healthy' | 'degraded' | 'down';
  lastBackup: string;
  storageUsed: string;
  activeSessions: number;
}
