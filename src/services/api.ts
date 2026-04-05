import axios from "axios";
export const API_URL = process.env.REACT_APP_API_URL || "https://smart-interview-prep-backend-23bz.onrender.com";
export interface ProfileData {
  userId: string;
  userName: string;
  email: string;
  jobRole: string;
  experience: string;
  techStack: string[] | string;  // Can be array OR string
  selectedProject?: string;
}
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
export const createProfile = (profileData: ProfileData) => 
  api.post("/api/profiles", profileData);
export default api;
