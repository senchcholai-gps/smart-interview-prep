import React, { useState, useEffect } from "react";
import JobProfileCreation from "../job-profile/JobProfileCreation";
import { API_URL } from "../../services/api";

interface JobProfile {
  id: string;
  jobRole: string;
  jobDescription: string;
  yearsOfExperience: string;
  techStacks: string[];
  createdAt: string;
  _id?: string;
}

interface Props {
  user: any;
  onTakeInterview: (jobProfile: JobProfile) => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  activePage: string;
}

const Dashboard: React.FC<Props> = ({ 
  user, 
  onTakeInterview, 
  onNavigate, 
  onLogout, 
  activePage 
}) => {
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch profiles from database
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user?._id) {
        console.log('No user ID available');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching profiles for user:', user._id);
        
        const response = await fetch(`${API_URL}/api/profiles/user/${user._id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }
        
        const data = await response.json();
        console.log('✅ Profiles fetched:', data.length, 'profiles');
        
        // Transform database profiles to match JobProfile interface
        const transformedProfiles = data.map((profile: any) => ({
          id: profile._id || `profile_${Date.now()}`,
          jobRole: profile.jobRole,
          jobDescription: profile.jobDescription || '',
          yearsOfExperience: profile.experience,
          techStacks: profile.techStack ? profile.techStack.split(',').map((t: string) => t.trim()) : [],
          createdAt: profile.createdAt,
          _id: profile._id
        }));
        
        setJobProfiles(transformedProfiles);
      } catch (error) {
        console.error('❌ Error fetching profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [user?._id]);

  const handleAddNewJob = () => {
    setShowJobForm(true);
  };

  // 🔴 THIS is where the profile gets saved to database (ONLY HERE)
  const handleJobSubmit = async (jobProfile: any) => {
    if (!user?._id) {
      alert('User not found. Please login again.');
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) {
      console.log('Already submitting, please wait...');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Creating profile for user:', user._id);
      
      const profileData = {
        userId: user._id,
        userName: user.name || user.username,
        email: user.email,
        jobRole: jobProfile.jobRole,
        experience: jobProfile.yearsOfExperience,
        techStack: jobProfile.techStacks.join(', '),
        jobDescription: jobProfile.jobDescription || ''
      };

      const response = await fetch(`${API_URL}/api/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      const savedProfile = await response.json();
      console.log('✅ Profile saved to database:', savedProfile);

      // Add the new profile to the list
      const newProfile: JobProfile = {
        id: savedProfile._id || `profile_${Date.now()}`,
        jobRole: savedProfile.jobRole,
        jobDescription: jobProfile.jobDescription || '',
        yearsOfExperience: savedProfile.experience,
        techStacks: savedProfile.techStack ? savedProfile.techStack.split(',').map((t: string) => t.trim()) : [],
        createdAt: savedProfile.createdAt,
        _id: savedProfile._id
      };
      
      setJobProfiles(prev => {
        // Check if already exists (prevent duplicates)
        const exists = prev.some(p => p._id === newProfile._id);
        if (exists) {
          console.log('⚠️ Profile already exists, not adding duplicate');
          return prev;
        }
        return [...prev, newProfile];
      });
      
      setShowJobForm(false);
      alert('✅ Profile created successfully!');

    } catch (error) {
      console.error('❌ Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartInterview = (profile: JobProfile) => {
    onTakeInterview(profile);
  };

  const handleDeleteProfile = async (id: string) => {
    if (!user?._id) return;

    const profileToDelete = jobProfiles.find(p => p.id === id);
    
    if (!profileToDelete?._id) {
      alert('Profile not found');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this profile?')) {
      return;
    }

    setIsDeleting(id);

    try {
      console.log('Deleting profile:', profileToDelete._id);
      
      const response = await fetch(`${API_URL}/api/profiles/${profileToDelete._id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }

      const updatedProfiles = jobProfiles.filter(p => p.id !== id);
      setJobProfiles(updatedProfiles);
      
      console.log('✅ Profile deleted successfully');
      alert('Profile deleted successfully!');

    } catch (error) {
      console.error('❌ Error deleting profile:', error);
      alert('Failed to delete profile. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  if (showJobForm) {
    return (
      <JobProfileCreation 
        onSubmit={handleJobSubmit}
        onCancel={() => setShowJobForm(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profiles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Add New button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xl text-gray-600 mt-2">Create and start your AI Mock interview</p>
        </div>
        <button
          onClick={handleAddNewJob}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold"
        >
          <span className="text-2xl">+</span>
          Add New
        </button>
      </div>
      
      {/* Job Profiles Grid */}
      {jobProfiles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No job profiles yet</h3>
          <p className="text-gray-500 mb-6">Click the "Add New" button to create your first mock interview profile</p>
          <button
            onClick={handleAddNewJob}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
          >
            + Create Your First Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobProfiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white capitalize">{profile.jobRole}</h3>
                <p className="text-blue-100 text-sm mt-1">{profile.yearsOfExperience} years experience</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {profile.jobDescription}
                </p>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">TECH STACK</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.techStacks.slice(0, 4).map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {tech}
                      </span>
                    ))}
                    {profile.techStacks.length > 4 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{profile.techStacks.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleStartInterview(profile)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 text-sm font-medium"
                  >
                    Start Interview
                  </button>
                  <button
                    onClick={() => handleDeleteProfile(profile.id)}
                    disabled={isDeleting === profile.id}
                    className={`text-gray-400 hover:text-red-500 transition-colors ${isDeleting === profile.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-xl">{isDeleting === profile.id ? '⏳' : '🗑️'}</span>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-2 text-xs text-gray-500">
                Created: {new Date(profile.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {/* Add New Card */}
          <div
            onClick={handleAddNewJob}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-dashed border-gray-300 hover:border-blue-500 flex flex-col items-center justify-center p-8 cursor-pointer min-h-[300px]"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl text-blue-600">+</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Add New Job Role</h3>
            <p className="text-gray-500 text-center">Create another mock interview profile</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;