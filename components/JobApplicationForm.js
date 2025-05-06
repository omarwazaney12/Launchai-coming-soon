import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { FaFileUpload } from 'react-icons/fa/index.js';

export default function JobApplicationForm({ position, onClose, onNotification }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Form state
  const [formData, setFormData] = useState({
    position,
    fullName: '',
    email: '',
    phone: '',
    location: '',
    currentPosition: '',
    company: '',
    experience: '',
    experienceDetails: '',
    education: '',
    portfolio: '',
    github: '',
    linkedin: '',
    resume: null,
    resumeName: '',
    startDate: '',
    whyJoin: '',
    skills: [],
    terms: false
  });
  
  // Error state
  const [errors, setErrors] = useState({});
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'terms') {
      setFormData({ ...formData, terms: checked });
    } else if (type === 'checkbox' && name.startsWith('skill-')) {
      const skill = name.replace('skill-', '');
      const newSkills = checked 
        ? [...formData.skills, skill] 
        : formData.skills.filter(s => s !== skill);
      
      setFormData({ ...formData, skills: newSkills });
    } else if (type === 'file') {
      if (e.target.files.length > 0) {
        setFormData({ 
          ...formData, 
          resume: e.target.files[0],
          resumeName: e.target.files[0].name
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  // Validate current step
  const validateStep = (step) => {
    let isValid = true;
    const newErrors = {};
    
    switch(step) {
      case 1:
        // Personal information validation
        if (!formData.fullName.trim()) {
          newErrors.fullName = 'Full name is required';
          isValid = false;
        }
        
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
          isValid = false;
        }
        
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
          isValid = false;
        }
        
        if (!formData.location.trim()) {
          newErrors.location = 'Location is required';
          isValid = false;
        }
        break;
        
      case 2:
        // Professional experience validation
        if (!formData.currentPosition.trim()) {
          newErrors.currentPosition = 'Current role is required';
          isValid = false;
        }
        
        if (!formData.company.trim()) {
          newErrors.company = 'Company is required';
          isValid = false;
        }
        
        if (!formData.experience) {
          newErrors.experience = 'Years of experience is required';
          isValid = false;
        }
        
        if (!formData.experienceDetails.trim()) {
          newErrors.experienceDetails = 'Experience details are required';
          isValid = false;
        }
        break;
        
      case 3:
        // Skills and qualifications validation
        if (!formData.education) {
          newErrors.education = 'Education level is required';
          isValid = false;
        }
        
        if (formData.skills.length === 0) {
          newErrors.skills = 'Please select at least one skill';
          isValid = false;
        }
        break;
        
      case 4:
        // Resume and final details validation
        if (!formData.resume) {
          newErrors.resume = 'Resume is required';
          isValid = false;
        }
        
        if (!formData.startDate) {
          newErrors.startDate = 'Start date is required';
          isValid = false;
        }
        
        if (!formData.whyJoin.trim()) {
          newErrors.whyJoin = 'Please tell us why you want to join';
          isValid = false;
        }
        
        if (!formData.terms) {
          newErrors.terms = 'You must agree to the terms';
          isValid = false;
        }
        break;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };
  
  // Handle previous step
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    try {
      // First, upload the resume to Supabase Storage
      const resumeFileName = `${Date.now()}_${formData.resumeName}`;
      const resumeFilePath = `resumes/${resumeFileName}`;

      // Upload the resume file
      const { error: uploadError, data: fileData } = await supabase.storage
        .from('resumes')
        .upload(resumeFilePath, formData.resume);

      if (uploadError) {
        throw uploadError;
      }
      
      console.log('Resume uploaded successfully:', fileData);

      // Now save the application data
      const { error: insertError } = await supabase
        .from('job_applications')
        .insert([
          {
            position: formData.position,
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            current_position: formData.currentPosition,
            company: formData.company,
            experience: formData.experience,
            experience_details: formData.experienceDetails,
            education: formData.education,
            portfolio_url: formData.portfolio || null,
            github_url: formData.github || null,
            linkedin_url: formData.linkedin || null,
            resume_filename: formData.resumeName,
            resume_file_path: resumeFilePath,
            start_date: formData.startDate,
            why_join: formData.whyJoin,
            skills: formData.skills.join(', '),
            user_agent: navigator.userAgent
          }
        ]);

      if (insertError) {
        throw insertError;
      }
      
      console.log('Application submitted successfully');
      onNotification('Your application has been submitted successfully!', 'success');
      onClose();
      
    } catch (error) {
      console.error('Application submission error:', error);
      onNotification('Failed to submit application. Please try again.', 'error');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-primary-900/80 border border-primary-800/50 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Apply for {position} Position</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-center mb-8">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div 
                key={index} 
                className={`w-3 h-3 rounded-full mx-2 transition-all ${
                  currentStep > index + 1 
                    ? 'bg-primary-400' 
                    : currentStep === index + 1 
                      ? 'bg-primary-500 scale-125' 
                      : 'bg-primary-800'
                }`}
              />
            ))}
          </div>
          
          <form>
            {/* Step 1: Personal Information */}
            <div className={`${currentStep === 1 ? 'block fade-in' : 'hidden'}`}>
              <div className="text-center mb-6 pb-2 border-b border-primary-800/30">
                <h3 className="text-lg font-medium">Personal Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Full Name<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Email Address<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Phone Number<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Current Location<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white"
                  />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </div>
              </div>
            </div>
            
            {/* Step 2: Professional Experience */}
            <div className={`${currentStep === 2 ? 'block fade-in' : 'hidden'}`}>
              <div className="text-center mb-6 pb-2 border-b border-primary-800/30">
                <h3 className="text-lg font-medium">Professional Experience</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Current/Most Recent Role<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="currentPosition"
                    value={formData.currentPosition}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white"
                  />
                  {errors.currentPosition && <p className="text-red-500 text-xs mt-1">{errors.currentPosition}</p>}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Company<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white"
                  />
                  {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Years of Experience<span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                  >
                    <option value="">Select</option>
                    <option value="0-1">Less than 1 year</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                  {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Describe your relevant experience<span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    name="experienceDetails"
                    value={formData.experienceDetails}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white resize-none"
                  />
                  {errors.experienceDetails && <p className="text-red-500 text-xs mt-1">{errors.experienceDetails}</p>}
                </div>
              </div>
            </div>
            
            {/* Step 3: Skills & Qualifications */}
            <div className={`${currentStep === 3 ? 'block fade-in' : 'hidden'}`}>
              <div className="text-center mb-6 pb-2 border-b border-primary-800/30">
                <h3 className="text-lg font-medium">Skills & Qualifications</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Highest Education Level<span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                  >
                    <option value="">Select</option>
                    <option value="high-school">High School</option>
                    <option value="associate">Associate Degree</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD or Doctorate</option>
                    <option value="bootcamp">Coding Bootcamp</option>
                    <option value="self-taught">Self-taught</option>
                  </select>
                  {errors.education && <p className="text-red-500 text-xs mt-1">{errors.education}</p>}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Key Skills<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center hover:bg-primary-800/30 p-1 rounded">
                      <input
                        type="checkbox"
                        name="skill-React"
                        id="skill-react"
                        checked={formData.skills.includes('React')}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="skill-react" className="text-sm cursor-pointer">React</label>
                    </div>
                    <div className="flex items-center hover:bg-primary-800/30 p-1 rounded">
                      <input
                        type="checkbox"
                        name="skill-Node.js"
                        id="skill-node"
                        checked={formData.skills.includes('Node.js')}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="skill-node" className="text-sm cursor-pointer">Node.js</label>
                    </div>
                    <div className="flex items-center hover:bg-primary-800/30 p-1 rounded">
                      <input
                        type="checkbox"
                        name="skill-TypeScript"
                        id="skill-typescript"
                        checked={formData.skills.includes('TypeScript')}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="skill-typescript" className="text-sm cursor-pointer">TypeScript</label>
                    </div>
                    <div className="flex items-center hover:bg-primary-800/30 p-1 rounded">
                      <input
                        type="checkbox"
                        name="skill-Python"
                        id="skill-python"
                        checked={formData.skills.includes('Python')}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="skill-python" className="text-sm cursor-pointer">Python</label>
                    </div>
                    <div className="flex items-center hover:bg-primary-800/30 p-1 rounded">
                      <input
                        type="checkbox"
                        name="skill-AI/ML"
                        id="skill-ai-ml"
                        checked={formData.skills.includes('AI/ML')}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="skill-ai-ml" className="text-sm cursor-pointer">AI/ML</label>
                    </div>
                    <div className="flex items-center hover:bg-primary-800/30 p-1 rounded">
                      <input
                        type="checkbox"
                        name="skill-Cloud Architecture"
                        id="skill-cloud"
                        checked={formData.skills.includes('Cloud Architecture')}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="skill-cloud" className="text-sm cursor-pointer">Cloud Architecture</label>
                    </div>
                  </div>
                  {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleChange}
                    placeholder="https://yourportfolio.com"
                    className="w-full px-4 py-2 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="https://github.com/yourusername"
                    className="w-full px-4 py-2 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-2 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
            
            {/* Step 4: Resume & Final Details */}
            <div className={`${currentStep === 4 ? 'block fade-in' : 'hidden'}`}>
              <div className="text-center mb-6 pb-2 border-b border-primary-800/30">
                <h3 className="text-lg font-medium">Resume & Final Details</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Upload Resume/CV<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="border-2 border-dashed border-primary-700/50 rounded-lg p-6 text-center hover:bg-primary-800/20 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      name="resume"
                      onChange={handleChange}
                      accept=".pdf,.doc,.docx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FaFileUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                    <p className="text-gray-400 mb-1">Drag & drop your resume, or click to browse</p>
                    {formData.resumeName && (
                      <p className="text-primary-400 text-sm mt-2">{formData.resumeName}</p>
                    )}
                  </div>
                  {errors.resume && <p className="text-red-500 text-xs mt-1">{errors.resume}</p>}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    When can you start?<span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                  >
                    <option value="">Select</option>
                    <option value="immediately">Immediately</option>
                    <option value="2-weeks">2 weeks</option>
                    <option value="1-month">1 month</option>
                    <option value="2-months">2+ months</option>
                  </select>
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Why do you want to join LaunchAI?<span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    name="whyJoin"
                    value={formData.whyJoin}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white resize-none"
                  />
                  {errors.whyJoin && <p className="text-red-500 text-xs mt-1">{errors.whyJoin}</p>}
                </div>
                
                <div className="flex items-start mt-4">
                  <input
                    type="checkbox"
                    name="terms"
                    id="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    className="mt-1 mr-2"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-400">
                    I agree to the processing of my personal data for recruitment purposes<span className="text-red-500 ml-1">*</span>
                  </label>
                </div>
                {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-hover-effect px-5 py-2 bg-primary-800/70 rounded-lg font-medium text-white"
                >
                  <span>Previous</span>
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-hover-effect px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg font-medium text-white"
                >
                  <span>Next</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn-hover-effect px-5 py-2 bg-gradient-to-r from-green-600 to-green-800 rounded-lg font-medium text-white"
                >
                  <span>Submit Application</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 