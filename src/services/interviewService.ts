export interface UserProfile {
  _id?: string;
  fullName: string;
  email: string;
  yearsExperience: string;
  desiredRole: string;
  techStack: string[];
  selectedProject: string;
  agreeToTerms: boolean;
  createdAt?: Date;
}
const InterviewService = {
  getCurrentProfile: (): UserProfile | null => {
    const data = localStorage.getItem('interviewProfile');
    return data ? JSON.parse(data) : null;
  },
  saveProfile: (profile: UserProfile): void => {
    localStorage.setItem('interviewProfile', JSON.stringify(profile));
  },
  clearProfile: (): void => {
    localStorage.removeItem('interviewProfile');
  }
};
export default InterviewService;
