import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { FaFileUpload } from 'react-icons/fa/index.js';

export default function JobApplicationForm({ position, onClose, onNotification }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedInputs, setTouchedInputs] = useState({});
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Refs for form fields to use uncontrolled components
  const formRefs = useRef({});
  
  // Form state - we'll update this only when needed, not on every keystroke
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
  
  // Optimize rendering for mobile
  useEffect(() => {
    // Add passive listeners to improve touch responsiveness
    const options = { passive: true };
    const container = document.querySelector('.application-form-container');
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, options);
      container.addEventListener('touchmove', handleTouchMove, options);
      container.addEventListener('touchend', handleTouchEnd, options);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);
  
  const handleTouchStart = () => {
    // Don't process multiple events simultaneously to improve performance
  };
  
  const handleTouchMove = () => {
    setIsScrolling(true);
  };
  
  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsScrolling(false);
    }, 50);
  };
  
  // Add touch feedback
  const handleTouchFeedback = (name) => {
    setTouchedInputs(prev => ({ ...prev, [name]: true }));
    setTimeout(() => {
      setTouchedInputs(prev => ({ ...prev, [name]: false }));
    }, 300);
  };
  
  // Handle immediate UI feedback and state update
  const handleChange = (e) => {
    const { name, type, checked, value, files } = e.target;
    
    // Skip if scrolling to avoid accidental selections
    if (isScrolling && (type === 'checkbox' || type === 'radio')) return;
    
    // For file uploads, we need to capture the file data differently
    if (type === 'file') {
      if (files && files.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          resume: files[0],
          resumeName: files[0].name
        }));
      }
      return;
    }
    
    // Only update state for checkboxes immediately
    if (type === 'checkbox' && name === 'terms') {
      setFormData(prev => ({ ...prev, terms: checked }));
    } else if (type === 'checkbox' && name.startsWith('skill-')) {
      const skill = name.replace('skill-', '');
      setFormData(prev => {
        const newSkills = checked 
          ? [...prev.skills, skill] 
          : prev.skills.filter(s => s !== skill);
        return { ...prev, skills: newSkills };
      });
    }
    
    // Give touch feedback
    handleTouchFeedback(name);
  };

  // Set up refs for input elements - similar to SurveyForm's approach
  const setInputRef = (refKey, element) => {
    if (element && !element.dataset.refSet) {
      formRefs.current[refKey] = element;
      element.dataset.refSet = true;
    }
  };

  // Get all current input values when needed
  const collectFormData = () => {
    const collectedData = { ...formData };
    
    // Get values from all input fields in the form
    const formElement = document.querySelector('form');
    if (formElement) {
      const inputs = formElement.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const { name, type, value, checked, files } = input;
        
        if (name) {
          if (type === 'checkbox') {
            if (name === 'terms') {
              collectedData.terms = checked;
            } else if (name.startsWith('skill-')) {
              // Skills are already handled via state
            }
          } else if (type === 'file') {
            // File inputs are handled separately
          } else if (type !== 'radio' || checked) {
            // For radio buttons, only collect checked ones
            collectedData[name] = value;
          }
        }
      });
    }
    
    return collectedData;
  };
  
  // Validate current step
  const validateStep = (step) => {
    // Collect current form data before validation
    const currentData = collectFormData();
    setFormData(currentData);
    
    let isValid = true;
    const newErrors = {};
    
    switch(step) {
      case 1:
        // Personal information validation
        if (!currentData.fullName?.trim()) {
          newErrors.fullName = 'Full name is required';
          isValid = false;
        }
        
        if (!currentData.email?.trim()) {
          newErrors.email = 'Email is required';
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentData.email)) {
          newErrors.email = 'Please enter a valid email address';
          isValid = false;
        }
        
        if (!currentData.phone?.trim()) {
          newErrors.phone = 'Phone number is required';
          isValid = false;
        }
        
        if (!currentData.location?.trim()) {
          newErrors.location = 'Location is required';
          isValid = false;
        }
        break;
        
      case 2:
        // Professional experience validation
        if (!currentData.currentPosition?.trim()) {
          newErrors.currentPosition = 'Current role is required';
          isValid = false;
        }
        
        if (!currentData.company?.trim()) {
          newErrors.company = 'Company is required';
          isValid = false;
        }
        
        if (!currentData.experience) {
          newErrors.experience = 'Years of experience is required';
          isValid = false;
        }
        
        if (!currentData.experienceDetails?.trim()) {
          newErrors.experienceDetails = 'Experience details are required';
          isValid = false;
        }
        break;
        
      case 3:
        // Skills and qualifications validation
        if (!currentData.education) {
          newErrors.education = 'Education level is required';
          isValid = false;
        }
        
        if (currentData.skills.length === 0) {
          newErrors.skills = 'Please select at least one skill';
          isValid = false;
        }
        break;
        
      case 4:
        // Resume and final details validation
        if (!currentData.resume) {
          newErrors.resume = 'Resume is required';
          isValid = false;
        }
        
        if (!currentData.startDate) {
          newErrors.startDate = 'Start date is required';
          isValid = false;
        }
        
        if (!currentData.whyJoin?.trim()) {
          newErrors.whyJoin = 'Please tell us why you want to join';
          isValid = false;
        }
        
        if (!currentData.terms) {
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
    
    // Collect all form data before submission
    const currentData = collectFormData();
    setFormData(currentData);
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First, upload the resume to Supabase Storage
      const resumeFileName = `${Date.now()}_${currentData.resumeName}`;
      const resumeFilePath = `resumes/${resumeFileName}`;

      // Upload the resume file
      const { error: uploadError, data: fileData } = await supabase.storage
        .from('resumes')
        .upload(resumeFilePath, currentData.resume);

      if (uploadError) {
        throw uploadError;
      }
      
      console.log('Resume uploaded successfully:', fileData);

      // Now save the application data
      const { error: insertError } = await supabase
        .from('job_applications')
        .insert([
          {
            position: currentData.position,
            full_name: currentData.fullName,
            email: currentData.email,
            phone: currentData.phone,
            location: currentData.location,
            current_position: currentData.currentPosition,
            company: currentData.company,
            experience: currentData.experience,
            experience_details: currentData.experienceDetails,
            education: currentData.education,
            portfolio_url: currentData.portfolio || null,
            github_url: currentData.github || null,
            linkedin_url: currentData.linkedin || null,
            resume_filename: currentData.resumeName,
            resume_file_path: resumeFilePath,
            start_date: currentData.startDate,
            why_join: currentData.whyJoin,
            skills: currentData.skills.join(', '),
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
  
  // Input component with uncontrolled inputs for better typing experience - updated to match SurveyForm approach
  const FormInput = ({ label, name, type = 'text', defaultValue = '', placeholder = '', required = false, options = [], onChange }) => {
    const isTouched = touchedInputs[name] || false;
    const error = errors[name];
    const inputKey = `input-${name}-${Math.random().toString(36).substring(7)}`;
    
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
            key={inputKey}
            defaultValue={defaultValue}
            onChange={onChange}
            className={`w-full p-3 bg-primary-800/70 border ${error ? 'border-red-500' : 'border-primary-700/50'} rounded-lg text-white focus:outline-none focus:border-primary-500 ${isTouched ? 'bg-primary-800' : ''}`}
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
            key={inputKey}
            defaultValue={defaultValue}
            placeholder={placeholder}
            onChange={onChange}
            autoComplete="off"
            rows="4"
            className={`w-full p-3 bg-primary-800/70 border ${error ? 'border-red-500' : 'border-primary-700/50'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 ${isTouched ? 'bg-primary-800' : ''}`}
          />
        ) : type === 'file' ? (
          <div className={`w-full p-2 border ${error ? 'border-red-500' : 'border-primary-700/50'} border-dashed rounded-lg bg-primary-800/50 ${isTouched ? 'bg-primary-800' : ''}`}>
            <label 
              htmlFor={name}
              className="flex flex-col items-center justify-center py-3 cursor-pointer"
            >
              <FaFileUpload className="text-3xl text-primary-500 mb-2" />
              <span className="text-sm font-medium text-gray-300">
                {defaultValue ? defaultValue : 'Select your resume'}
              </span>
              <input
                type="file"
                id={name}
                name={name}
                key={inputKey}
                onChange={onChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
            </label>
          </div>
        ) : type === 'checkbox' ? (
          <div className={`flex items-center ${isTouched ? 'bg-primary-800/60' : ''} p-2 rounded transition-colors`}>
            <input
              type="checkbox"
              id={name}
              name={name}
              key={inputKey}
              defaultChecked={defaultValue}
              onChange={onChange}
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
            key={inputKey}
            defaultValue={defaultValue}
            placeholder={placeholder}
            onChange={onChange}
            autoComplete="off"
            className={`w-full p-3 bg-primary-800/70 border ${error ? 'border-red-500' : 'border-primary-700/50'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 ${isTouched ? 'bg-primary-800' : ''}`}
          />
        )}
        
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  };
  
  // Optimize rendering of skills checkboxes
  const SkillCheckbox = ({ skill, isSelected, onChange }) => {
    const name = `skill-${skill}`;
    const isTouched = touchedInputs[name] || false;
    const checkboxKey = `checkbox-${name}-${Math.random().toString(36).substring(7)}`;
    
    return (
      <div 
        className={`flex items-center ${isTouched ? 'bg-primary-800/60' : ''} p-2 rounded mb-1 transition-colors active:bg-primary-800/80`}
      >
        <input
          type="checkbox"
          id={name}
          name={name}
          key={checkboxKey}
          defaultChecked={isSelected}
          onChange={onChange}
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
  
  // Reset the form data when the component unmounts
  useEffect(() => {
    return () => {
      formRefs.current = {};
    };
  }, []);
  
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
              <div className="space-y-4 fade-in">
                <h3 className="text-lg font-semibold text-primary-400 mb-4">Personal Information</h3>
                
                <FormInput
                  label="Full Name"
                  name="fullName"
                  defaultValue={formData.fullName}
                  placeholder="Enter your full name"
                  onChange={handleChange}
                  required
                />
                
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  defaultValue={formData.email}
                  placeholder="Enter your email address"
                  onChange={handleChange}
                  required
                />
                
                <FormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  defaultValue={formData.phone}
                  placeholder="Enter your phone number"
                  onChange={handleChange}
                  required
                />
                
                <FormInput
                  label="Location"
                  name="location"
                  defaultValue={formData.location}
                  placeholder="City, Country"
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            
            {/* Step 2: Professional Experience */}
            {currentStep === 2 && (
              <div className="space-y-4 fade-in">
                <h3 className="text-lg font-semibold text-primary-400 mb-4">Professional Experience</h3>
                
                <FormInput
                  label="Current Position"
                  name="currentPosition"
                  defaultValue={formData.currentPosition}
                  placeholder="Your current job title"
                  onChange={handleChange}
                  required
                />
                
                <FormInput
                  label="Company"
                  name="company"
                  defaultValue={formData.company}
                  placeholder="Your current company"
                  onChange={handleChange}
                  required
                />
                
                <FormInput
                  label="Years of Experience"
                  name="experience"
                  type="select"
                  defaultValue={formData.experience}
                  onChange={handleChange}
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
                  defaultValue={formData.experienceDetails}
                  placeholder="Brief description of your relevant experience..."
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            
            {/* Step 3: Skills & Qualifications */}
            {currentStep === 3 && (
              <div className="space-y-4 fade-in">
                <h3 className="text-lg font-semibold text-primary-400 mb-4">Skills & Qualifications</h3>
                
                <FormInput
                  label="Highest Education Level"
                  name="education"
                  type="select"
                  defaultValue={formData.education}
                  onChange={handleChange}
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
                          isSelected={formData.skills.includes('Leadership')}
                          onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="AI/ML" 
                          isSelected={formData.skills.includes('AI/ML')}
                          onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="Cloud Architecture" 
                          isSelected={formData.skills.includes('Cloud Architecture')}
                          onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="System Design" 
                          isSelected={formData.skills.includes('System Design')}
                          onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="Team Management" 
                          isSelected={formData.skills.includes('Team Management')}
                          onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="Product Strategy" 
                          isSelected={formData.skills.includes('Product Strategy')}
                          onChange={handleChange}
                        />
                      </>
                    )}
                    
                    {position === 'Full-Stack Developer' && (
                      <>
                        <SkillCheckbox 
                          skill="React" 
                          isSelected={formData.skills.includes('React')}
                          onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="Next.js" 
                          isSelected={formData.skills.includes('Next.js')}
                          onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="Node.js" 
                          isSelected={formData.skills.includes('Node.js')}
                          onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="TypeScript" 
                          isSelected={formData.skills.includes('TypeScript')}
                          onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="Database Design" 
                          isSelected={formData.skills.includes('Database Design')}
                          onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="API Development" 
                          isSelected={formData.skills.includes('API Development')}
                          onChange={handleChange}
                        />
                      </>
                    )}
                    
                    {position === 'AI Engineer' && (
                      <>
                        <SkillCheckbox 
                          skill="Machine Learning" 
                          isSelected={formData.skills.includes('Machine Learning')}
                        onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="NLP" 
                          isSelected={formData.skills.includes('NLP')}
                        onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="Python" 
                          isSelected={formData.skills.includes('Python')}
                        onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="LLM Fine-Tuning" 
                          isSelected={formData.skills.includes('LLM Fine-Tuning')}
                        onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="TensorFlow/PyTorch" 
                          isSelected={formData.skills.includes('TensorFlow/PyTorch')}
                        onChange={handleChange}
                        />
                        <SkillCheckbox 
                          skill="Data Science" 
                          isSelected={formData.skills.includes('Data Science')}
                        onChange={handleChange}
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
                  defaultValue={formData.portfolio}
                  placeholder="https://yourportfolio.com"
                  onChange={handleChange}
                />
                
                <FormInput
                  label="GitHub URL"
                  name="github"
                  defaultValue={formData.github}
                  placeholder="https://github.com/username"
                  onChange={handleChange}
                />
                
                <FormInput
                  label="LinkedIn URL"
                  name="linkedin"
                  defaultValue={formData.linkedin}
                  placeholder="https://linkedin.com/in/username"
                  onChange={handleChange}
                />
              </div>
            )}
            
            {/* Step 4: Final Details */}
            {currentStep === 4 && (
              <div className="space-y-4 fade-in">
                <h3 className="text-lg font-semibold text-primary-400 mb-4">Final Details</h3>
                
                <FormInput
                  label="Resume"
                  name="resume"
                  type="file"
                  defaultValue={formData.resumeName}
                  onChange={handleChange}
                  required
                />
                
                <FormInput
                  label="Earliest Start Date"
                  name="startDate"
                  type="select"
                  defaultValue={formData.startDate}
                  onChange={handleChange}
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
                  defaultValue={formData.whyJoin}
                  placeholder="Tell us why you're interested in this position and what you can bring to the team..."
                  onChange={handleChange}
                  required
                />
                
                <FormInput
                  label=""
                  name="terms"
                  type="checkbox"
                  defaultValue={formData.terms}
                  onChange={handleChange}
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