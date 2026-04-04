import React, { useState, useEffect } from "react";

interface JobProfile {
  jobRole: string;
  jobDescription: string;
  yearsOfExperience: string;
  techStacks: string[];
}

interface Props {
  onSubmit: (profile: JobProfile) => void;
  onCancel?: () => void;
}

const JobProfileCreation: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [techInput, setTechInput] = useState("");
  const [techStacks, setTechStacks] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    console.log('🔍 Current user from localStorage:', userStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('✅ User found:', user.name || user.email);
        console.log('✅ User ID from localStorage:', user._id || user.id);
        
        // Make sure user has _id field (convert id to _id if needed)
        if (user.id && !user._id) {
          user._id = user.id;
          console.log('✅ Converted id to _id:', user._id);
        }
        
        setCurrentUser(user);
      } catch (e) {
        console.error('❌ Error parsing user:', e);
      }
    } else {
      console.log('❌ No user logged in - Please login first');
    }
  }, []);

  const addTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !techStacks.includes(trimmed)) {
      setTechStacks([...techStacks, trimmed]);
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setTechStacks(techStacks.filter(t => t !== tech));
  };

  const handleReset = () => {
    setJobRole("");
    setJobDescription("");
    setYearsOfExperience("");
    setTechStacks([]);
    setTechInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobRole || !jobDescription || !yearsOfExperience || techStacks.length === 0) {
      alert("Please fill all required fields");
      return;
    }

    // Check if user is logged in
    if (!currentUser || !currentUser._id) {
      alert("❌ Please login first to save your profile");
      console.error('❌ No user logged in');
      return;
    }

    setIsSubmitting(true);

    // Create job profile object
    const jobProfile: JobProfile = {
      jobRole,
      jobDescription,
      yearsOfExperience,
      techStacks
    };

    console.log('🚀 Submitting profile to Dashboard:', jobProfile);
    
    // 🔴 REMOVED API CALL - Only call onSubmit
    // The actual saving to database will happen in Dashboard
    
    // Call the onSubmit prop which will pass data to Dashboard
    onSubmit(jobProfile);
    
    // Reset form after submission
    handleReset();
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <h1 className="text-3xl font-bold text-white">Create A New Mock Interview</h1>
          <p className="text-blue-100 mt-2">Fill in the job details to generate personalized interview questions</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Job Role/Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Role / Job Position <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="eg: Full Stack Developer"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter the job title you're interviewing for</p>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="eg: Job Description..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">Paste the full job description for more accurate questions</p>
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <select
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">eg: Years of Experience</option>
              <option value="0-1">0-1 years (Intern/Fresher)</option>
              <option value="1-2">1-2 years (Junior)</option>
              <option value="2-4">2-4 years (Mid-Level)</option>
              <option value="4-6">4-6 years (Senior)</option>
              <option value="6-8">6-8 years (Lead)</option>
              <option value="8-10">8-10 years (Principal)</option>
              <option value="10+">10+ years (Architect/Manager)</option>
            </select>
          </div>

          {/* Tech Stacks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tech Stacks <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech(techInput))}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="eg: React, Angular, NextJS..."
              />
              <button
                type="button"
                onClick={() => addTech(techInput)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
              >
                Add
              </button>
            </div>

            {/* Selected Tech Stacks */}
            {techStacks.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {techStacks.map((tech) => (
                  <span key={tech} className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Popular Tech Stacks */}
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">Popular tech stacks:</p>
              <div className="flex flex-wrap gap-2">
                {["React", "Angular", "NextJS", "Node.js", "TypeScript", "Python", "Java", "MongoDB", "PostgreSQL", "AWS"].map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => addTech(tech)}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      techStacks.includes(tech)
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleReset}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobProfileCreation;