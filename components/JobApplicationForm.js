import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { FaFileUpload } from 'react-icons/fa/index.js';

export default function JobApplicationForm({ position, onClose, onNotification }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Store form data that we'll collect only when needed (not on every keystroke)
  const [formState, setFormState] = useState({
    position,
    skills: [],
    terms: false
  });
  
  // Create refs for form fields
  const formRefs = useRef({
    fullName: null,
    email: null,
    phone: null,
    location: null,
    currentPosition: null,
    company: null,
    experience: null,
    experienceDetails: null,
    education: null,
    portfolio: null,
    github: null,
    linkedin: null,
    startDate: null,
    whyJoin: null,
    resume: null,
    resumeName: '',
  });
  
  // Skills and checkbox handlers still need state updates
  const handleSkillChange = (e) => {
    const { name, checked } = e.target;
    const skill = name.replace('skill-', '');
    
    setFormState(prev => {
      const newSkills = checked 
        ? [...prev.skills, skill] 
        : prev.skills.filter(s => s !== skill);
      return { ...prev, skills: newSkills };
    });
  };
  
  const handleTermsChange = (e) => {
    setFormState(prev => ({ 
      ...prev, 
      terms: e.target.checked
    }));
  };
  
  // File upload handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      formRefs.current.resume = file;
      formRefs.current.resumeName = file.name;
    }
  };
  
  // Collect all form data at once (only when submitting or changing steps)
  const collectFormData = () => {
    const data = {
      ...formState,
      fullName: formRefs.current.fullName?.value || '',
      email: formRefs.current.email?.value || '',
      phone: formRefs.current.phone?.value || '',
      location: formRefs.current.location?.value || '',
      currentPosition: formRefs.current.currentPosition?.value || '',
      company: formRefs.current.company?.value || '',
      experience: formRefs.current.experience?.value || '',
      experienceDetails: formRefs.current.experienceDetails?.value || '',
      education: formRefs.current.education?.value || '',
      portfolio: formRefs.current.portfolio?.value || '',
      github: formRefs.current.github?.value || '',
      linkedin: formRefs.current.linkedin?.value || '',
      startDate: formRefs.current.startDate?.value || '',
      whyJoin: formRefs.current.whyJoin?.value || '',
      resume: formRefs.current.resume,
      resumeName: formRefs.current.resumeName,
    };
    return data;
  };

  // Validate current step
  const validateStep = (step) => {
    let isValid = true;
    const newErrors = {};
    const formData = collectFormData();
    
    switch(step) {
      case 1:
        // Personal information validation
        if (!formData.fullName?.trim()) {
          newErrors.fullName = 'Full name is required';
          isValid = false;
        }
        
        if (!formData.email?.trim()) {
          newErrors.email = 'Email is required';
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
          isValid = false;
        }
        
        if (!formData.phone?.trim()) {
          newErrors.phone = 'Phone number is required';
          isValid = false;
        }
        
        if (!formData.location?.trim()) {
          newErrors.location = 'Location is required';
          isValid = false;
        }
        break;
        
      case 2:
        // Professional experience validation
        if (!formData.currentPosition?.trim()) {
          newErrors.currentPosition = 'Current role is required';
          isValid = false;
        }
        
        if (!formData.company?.trim()) {
          newErrors.company = 'Company is required';
          isValid = false;
        }
        
        if (!formData.experience) {
          newErrors.experience = 'Years of experience is required';
          isValid = false;
        }
        
        if (!formData.experienceDetails?.trim()) {
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
        
        if (!formData.whyJoin?.trim()) {
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
      // Update formState with current values before changing step
      setFormState(collectFormData());
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      // Scroll to top when changing steps
      setTimeout(() => {
        const container = document.querySelector('.application-form-container');
        if (container) container.scrollTop = 0;
      }, 10);
    }
  };
  
  // Handle previous step
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    // Scroll to top when changing steps
    setTimeout(() => {
      const container = document.querySelector('.application-form-container');
      if (container) container.scrollTop = 0;
    }, 10);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    const formData = collectFormData();
    
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Basic uncontrolled input component
  const FormInput = ({ label, name, type = 'text', defaultValue = '', placeholder = '', required = false, options = [] }) => {
    const error = errors[name];
    const inputRef = (element) => {
      if (element) formRefs.current[name] = element;
    };
    
    return (
      <div className="mb-4">
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {type === 'select' ? (
          <select
            id={name}
            name={name}
            ref={inputRef}
            defaultValue={formState[name] || defaultValue}
            className={`w-full p-3 bg-primary-800/70 border ${error ? 'border-red-500' : 'border-primary-700/50'} rounded-lg text-white focus:outline-none focus:border-primary-500`}
          >
            <option value="">Select an option</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            ref={inputRef}
            defaultValue={formState[name] || defaultValue}
            placeholder={placeholder}
            rows="4"
            className={`w-full p-3 bg-primary-800/70 border ${error ? 'border-red-500' : 'border-primary-700/50'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500`}
          />
        ) : type === 'file' ? (
          <div className={`w-full p-2 border ${error ? 'border-red-500' : 'border-primary-700/50'} border-dashed rounded-lg bg-primary-800/50`}>
            <label 
              htmlFor={name}
              className="flex flex-col items-center justify-center py-3 cursor-pointer"
            >
              <FaFileUpload className="text-3xl text-primary-500 mb-2" />
              <span className="text-sm font-medium text-gray-300">
                {formRefs.current.resumeName || 'Select your resume'}
              </span>
              <input
                type="file"
                id={name}
                name={name}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
            </label>
          </div>
        ) : type === 'checkbox' ? (
          <div className={`flex items-center p-2 rounded`}>
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={formState.terms}
              onChange={handleTermsChange}
              className="w-5 h-5 text-primary-600 border-gray-700 rounded bg-primary-900 focus:ring-primary-500"
            />
            <label 
              htmlFor={name} 
              className="ml-3 block text-sm text-gray-300"
            >
              I agree to the terms and conditions
            </label>
          </div>
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            ref={inputRef}
            defaultValue={formState[name] || defaultValue}
            placeholder={placeholder}
            className={`w-full p-3 bg-primary-800/70 border ${error ? 'border-red-500' : 'border-primary-700/50'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500`}
          />
        )}
        
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  };

  // Simple checkbox for skills
  const SkillCheckbox = ({ skill, isSelected }) => {
    const name = `skill-${skill}`;
    
    return (
      <div className="flex items-center p-2 rounded mb-1">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={isSelected}
          onChange={handleSkillChange}
          className="w-5 h-5 text-primary-600 border-gray-700 rounded bg-primary-900 focus:ring-primary-500"
        />
        <label 
          htmlFor={name} 
          className="ml-3 block text-sm text-gray-300 flex-1 py-1"
        >
          {skill}
        </label>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-primary-900/80 border border-primary-800/50 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto application-form-container">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Apply for {position} Position</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white active:bg-primary-800/40 p-2 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-center mb-8">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div 
                key={`step-${index}`}
                className={`w-3 h-3 rounded-full mx-1 ${
                  currentStep > index + 1 
                    ? 'bg-primary-600' 
                    : currentStep === index + 1
                      ? 'bg-white' 
                      : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-400 mb-4">Personal Information</h3>
                
                <FormInput
                  label="Full Name"
                  name="fullName"
                  placeholder="Enter your full name"
                  required
                />
                
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  required
                />
                
                <FormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  required
                />
                
                <FormInput
                  label="Location"
                  name="location"
                  placeholder="City, Country"
                  required
                />
              </div>
            )}
            
            {/* Step 2: Professional Experience */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-400 mb-4">Professional Experience</h3>
                
                <FormInput
                  label="Current Position"
                  name="currentPosition"
                  placeholder="Your current job title"
                  required
                />
                
                <FormInput
                  label="Company"
                  name="company"
                  placeholder="Your current company"
                  required
                />
                
                <FormInput
                  label="Years of Experience"
                  name="experience"
                  type="select"
                  required
                  options={[
                    { value: '0-1', label: 'Less than 1 year' },
                    { value: '1-3', label: '1-3 years' },
                    { value: '3-5', label: '3-5 years' },
                    { value: '5-10', label: '5-10 years' },
                    { value: '10+', label: 'More than 10 years' }
                  ]}
                />
                
                <FormInput
                  label="Relevant Experience Details"
                  name="experienceDetails"
                  type="textarea"
                  placeholder="Brief description of your relevant experience..."
                  required
                />
              </div>
            )}
            
            {/* Step 3: Skills & Qualifications */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-400 mb-4">Skills & Qualifications</h3>
                
                <FormInput
                  label="Highest Education Level"
                  name="education"
                  type="select"
                  required
                  options={[
                    { value: 'high-school', label: 'High School' },
                    { value: 'associate', label: 'Associate Degree' },
                    { value: 'bachelor', label: 'Bachelor\'s Degree' },
                    { value: 'master', label: 'Master\'s Degree' },
                    { value: 'phd', label: 'PhD / Doctorate' },
                    { value: 'self-taught', label: 'Self Taught' }
                  ]}
                />
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Skills <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    {position === 'CTO' && (
                      <>
                        <SkillCheckbox 
                          skill="Leadership" 
                          isSelected={formState.skills.includes('Leadership')}
                        />
                        <SkillCheckbox 
                          skill="AI/ML" 
                          isSelected={formState.skills.includes('AI/ML')}
                        />
                        <SkillCheckbox 
                          skill="Cloud Architecture" 
                          isSelected={formState.skills.includes('Cloud Architecture')}
                        />
                        <SkillCheckbox 
                          skill="System Design" 
                          isSelected={formState.skills.includes('System Design')}
                        />
                        <SkillCheckbox 
                          skill="Team Management" 
                          isSelected={formState.skills.includes('Team Management')}
                        />
                        <SkillCheckbox 
                          skill="Product Strategy" 
                          isSelected={formState.skills.includes('Product Strategy')}
                        />
                      </>
                    )}
                    
                    {position === 'Full-Stack Developer' && (
                      <>
                        <SkillCheckbox 
                          skill="React" 
                          isSelected={formState.skills.includes('React')}
                        />
                        <SkillCheckbox 
                          skill="Next.js" 
                          isSelected={formState.skills.includes('Next.js')}
                        />
                        <SkillCheckbox 
                          skill="Node.js" 
                          isSelected={formState.skills.includes('Node.js')}
                        />
                        <SkillCheckbox 
                          skill="TypeScript" 
                          isSelected={formState.skills.includes('TypeScript')}
                        />
                        <SkillCheckbox 
                          skill="Database Design" 
                          isSelected={formState.skills.includes('Database Design')}
                        />
                        <SkillCheckbox 
                          skill="API Development" 
                          isSelected={formState.skills.includes('API Development')}
                        />
                      </>
                    )}
                    
                    {position === 'AI Engineer' && (
                      <>
                        <SkillCheckbox 
                          skill="Machine Learning" 
                          isSelected={formState.skills.includes('Machine Learning')}
                        />
                        <SkillCheckbox 
                          skill="NLP" 
                          isSelected={formState.skills.includes('NLP')}
                        />
                        <SkillCheckbox 
                          skill="Python" 
                          isSelected={formState.skills.includes('Python')}
                        />
                        <SkillCheckbox 
                          skill="LLM Fine-Tuning" 
                          isSelected={formState.skills.includes('LLM Fine-Tuning')}
                        />
                        <SkillCheckbox 
                          skill="TensorFlow/PyTorch" 
                          isSelected={formState.skills.includes('TensorFlow/PyTorch')}
                        />
                        <SkillCheckbox 
                          skill="Data Science" 
                          isSelected={formState.skills.includes('Data Science')}
                        />
                      </>
                    )}
                  </div>
                  {errors.skills && (
                    <p className="text-sm text-red-500 mt-1">{errors.skills}</p>
                  )}
                </div>
                
                <FormInput
                  label="Portfolio URL"
                  name="portfolio"
                  placeholder="https://yourportfolio.com"
                />
                
                <FormInput
                  label="GitHub URL"
                  name="github"
                  placeholder="https://github.com/username"
                />
                
                <FormInput
                  label="LinkedIn URL"
                  name="linkedin"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            )}
            
            {/* Step 4: Final Details */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-400 mb-4">Final Details</h3>
                
                <FormInput
                  label="Resume"
                  name="resume"
                  type="file"
                  required
                />
                
                <FormInput
                  label="Earliest Start Date"
                  name="startDate"
                  type="select"
                  required
                  options={[
                    { value: 'immediately', label: 'Immediately' },
                    { value: '2-weeks', label: '2 Weeks Notice' },
                    { value: '1-month', label: '1 Month Notice' },
                    { value: '3-months', label: '3+ Months' },
                  ]}
                />
                
                <FormInput
                  label="Why do you want to join LaunchAI?"
                  name="whyJoin"
                  type="textarea"
                  placeholder="Tell us why you're interested in this position and what you can bring to the team..."
                  required
                />
                
                <FormInput
                  label=""
                  name="terms"
                  type="checkbox"
                  required
                />
              </div>
            )}
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-300 hover:text-white active:bg-primary-800/40 rounded transition-colors"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg text-white hover:from-primary-500 hover:to-primary-700 active:scale-95 transform transition-transform"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg ${
                    isSubmitting 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-primary-600 to-primary-800 text-white hover:from-primary-500 hover:to-primary-700 active:scale-95 transform transition-transform'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 