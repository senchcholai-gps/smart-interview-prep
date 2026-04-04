import React, { useState, useEffect } from "react";
import { createProfile } from "../services/api";
interface UserProfile {
  fullName: string;
  email: string;
  yearsExperience: string;
  desiredRole: string;
  techStack: string[];
  selectedProject: string;
  agreeToTerms: boolean;
}

interface Props {
  onProfileComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
}

const ProfileCreation: React.FC<Props> = ({ onProfileComplete, onCancel }) => {
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState("resume-builder");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    yearsExperience: "",
    desiredRole: "",
    agreeToTerms: false
  });

  // Get current user from localStorage (or your auth system)
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        // Pre-fill form if user data exists
        if (user.name) setFormData(prev => ({ ...prev, fullName: user.name }));
        if (user.email) setFormData(prev => ({ ...prev, email: user.email }));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const projects = [
    {
      id: "resume-builder",
      name: "AI Resume Builder SaaS",
      description: "Full Stack Web Application with AI-powered features",
      tech: ["React", "TypeScript", "Node.js", "MongoDB", "Gemini AI"]
    },
    {
      id: "ecommerce",
      name: "E-Commerce Platform",
      description: "Scalable online shopping platform",
      tech: ["React", "Node.js", "PostgreSQL", "Redis", "Stripe"]
    },
    {
      id: "dashboard",
      name: "Analytics Dashboard",
      description: "Real-time data visualization dashboard",
      tech: ["React", "D3.js", "WebSocket", "Express", "MongoDB"]
    }
  ];

  const popularTech = [
    "React", "TypeScript", "Node.js", "Python", "Java",
    "MongoDB", "PostgreSQL", "AWS", "Docker", "GraphQL"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.fullName || !formData.email)) {
      alert("Please fill in your name and email");
      return;
    }
    if (currentStep === 2 && (!formData.yearsExperience || !formData.desiredRole)) {
      alert("Please select experience and desired role");
      return;
    }
    if (currentStep === 3 && techStack.length === 0) {
      alert("Please add at least one technology");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    // Check if user is logged in
    if (!currentUser || !currentUser._id) {
      alert("Please login first to save your profile");
      return;
    }

    setIsSaving(true);

    try {
      const profile = {
        ...formData,
        techStack,
        selectedProject
      };

      // Save to MongoDB via API
      console.log('Saving profile to database...');
      const profileData = {
        userId: currentUser._id,
        userName: formData.fullName,
        email: formData.email,
        jobRole: formData.desiredRole,
        experience: formData.yearsExperience,
        techStack: techStack,
        selectedProject: selectedProject
      };

      const response = await createProfile(profileData);
      console.log('Profile saved to database:', response.data);

      // Save to localStorage as backup
      localStorage.setItem("interviewProfile", JSON.stringify(profile));

      // Call the original onProfileComplete
      onProfileComplete(profile);

      alert("Profile created successfully and saved to database!");

    } catch (error) {
      console.error('Error saving profile to database:', error);
      alert("Profile saved locally but failed to save to database. Check console for details.");

      // Still save locally and proceed
      const profile = {
        ...formData,
        techStack,
        selectedProject
      };
      localStorage.setItem("interviewProfile", JSON.stringify(profile));
      onProfileComplete(profile);

    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SmartInterviewPrep
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>
          <a href="#" className="text-gray-700 hover:text-blue-600">About Us</a>
          <a href="#" className="text-gray-700 hover:text-blue-600">Services</a>
          <a href="#" className="text-gray-700 hover:text-blue-600">Contact Us</a>
        </div>
        <div className="flex space-x-4">
          <button className="px-6 py-2 text-blue-600 font-semibold hover:text-blue-700">Login</button>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Create Your Interview Profile</h1>
            <p className="text-blue-100 mt-2">Set up your profile to get personalized interview questions</p>
          </div>

          {/* Progress Steps */}
          <div className="px-8 pt-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${currentStep >= step
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-gray-100 text-gray-400"
                    }
                  `}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 rounded ${currentStep > step ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-gray-200"
                      }`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Step {currentStep} of 4: {
                currentStep === 1 ? "Personal Info" :
                  currentStep === 2 ? "Experience" :
                    currentStep === 3 ? "Tech Stack" : "Project"
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                    <select
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select experience</option>
                      <option value="0-2">0-2 years (Entry Level)</option>
                      <option value="3-5">3-5 years (Mid Level)</option>
                      <option value="6-10">6-10 years (Senior Level)</option>
                      <option value="10+">10+ years (Expert Level)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Desired Role *</label>
                    <input
                      type="text"
                      name="desiredRole"
                      value={formData.desiredRole}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full Stack Developer"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Tech Stack */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Technologies *</label>
                  <div className="flex gap-2">
                    <input
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech(techInput))}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Type and press Enter"
                    />
                    <button
                      type="button"
                      onClick={() => addTech(techInput)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <span key={tech} className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                      {tech}
                      <button type="button" onClick={() => removeTech(tech)} className="ml-2 text-blue-600 hover:text-blue-800">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Popular technologies:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularTech.map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => addTech(tech)}
                        className={`px-3 py-1.5 rounded-full text-sm ${techStack.includes(tech)
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
            )}

            {/* Step 4: Project Selection */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${selectedProject === project.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <h3 className="font-semibold text-gray-800">{project.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {project.tech.map((t) => (
                          <span key={t} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                      {selectedProject === project.id && (
                        <p className="text-blue-600 text-sm font-medium mt-2">✓ Selected</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-blue-600 rounded"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the Terms of Service and Privacy Policy
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 font-semibold ${isSaving ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {isSaving ? 'Saving...' : 'Generate Questions →'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ProfileCreation;