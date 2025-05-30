import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';

export default function SurveyForm({ onClose, onNotification }) {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedInputs, setTouchedInputs] = useState({});
  const [isScrolling, setIsScrolling] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Store refs to form elements
  const formRefs = useRef({});
  
  // Optimize rendering for mobile
  useEffect(() => {
    // Add passive listeners to improve touch responsiveness
    const options = { passive: true };
    const container = document.querySelector('.survey-container');
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
  const handleTouchFeedback = (key) => {
    setTouchedInputs(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setTouchedInputs(prev => ({ ...prev, [key]: false }));
    }, 300);
  };
  
  // Get all current input values when needed
  const collectFormData = () => {
    const newData = { ...formData };
    newData.accessReasons = newData.accessReasons || [];
    
    Object.keys(formRefs.current).forEach(refKey => {
      const element = formRefs.current[refKey];
      if (!element) return;
      
      // Split the refKey to get field info
      const [type, fieldName, optionValue] = refKey.split('|');
      
      if (!type || !fieldName) return;
      
      if (type === 'checkbox' && fieldName === 'accessReason') {
        if (element.checked && optionValue) {
          // Add to the array if not already included
          if (!newData.accessReasons.includes(optionValue)) {
            newData.accessReasons.push(optionValue);
          }
        } else if (!element.checked && optionValue) {
          // Remove from array if unchecked
          newData.accessReasons = newData.accessReasons.filter(value => value !== optionValue);
        }
      } else if (type === 'text' || type === 'textarea' || type === 'email') {
        newData[fieldName] = element.value;
      }
    });
    
    return newData;
  };
  
  // Handle input changes
  const handleChange = (type, fieldName, value = null) => {
    // Skip if scrolling to avoid accidental selections
    if (isScrolling) return;
    
    // Give touch feedback
    handleTouchFeedback(fieldName + (value || ''));
    
    // Clear error for this field when user makes changes
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    // If this is a checkbox and it's the "Other" option, update state to re-render
    if (type === 'checkbox' && fieldName === 'accessReason' && value && value.startsWith('Other')) {
      const currentData = collectFormData();
      setFormData(currentData);
    }
  };

  // Check if "Other" option is selected
  const isOtherSelected = () => {
    return formData.accessReasons && formData.accessReasons.some(reason => reason.startsWith('Other'));
  };

  // Simplified survey data structure
  const surveyData = {
    title: "LaunchAI Early Access",
    questions: [
      {
        type: "textarea",
        name: "aboutSelf",
        label: "Tell us briefly about yourself and what you're working on right now.",
        required: true
      },
      {
        type: "checkbox",
        name: "accessReason",
        label: "What's your main reason for wanting early access to LaunchAI? (select all that apply)",
        required: true,
        options: [
          "I need help validating my startup idea (market research, competitors, customer validation)",
          "I'm struggling with finances and business model planning",
          "I need help creating a professional pitch deck",
          "I need guidance building and launching my MVP",
          "I want to build a strong brand (branding & marketing strategy)",
          "I'm curious about how AI can streamline my startup journey",
          "I'm exploring new tools to accelerate my startup",
          "Other (please specify)"
        ]
      },
      {
        type: "textarea",
        name: "reasonExplanation",
        label: "What would it mean for you to finally launch your idea?",
        required: true
      },
      {
        type: "email",
        name: "email",
        label: "Your Email",
        placeholder: "email@example.com",
        required: true
      },
      {
        type: "text",
        name: "mobile",
        label: "Your Mobile Number",
        placeholder: "+1234567890",
        required: true
      }
    ],
    submitButton: "Request Early Access"
  };

  // Validate the form data
  const validateForm = (data) => {
    const newErrors = {};
    
    // Check each required field
    surveyData.questions.forEach(question => {
      if (question.required) {
        if (question.type === 'checkbox' && question.name === 'accessReason') {
          // Check if at least one option is selected
          if (!data.accessReasons || data.accessReasons.length === 0) {
            newErrors[question.name] = `Please select at least one option`;
          }
        } 
        else if (!data[question.name] || !data[question.name].trim()) {
          newErrors[question.name] = `This field is required`;
        }
      }
    });
    
    // Special validation for email
    if (data.email && !validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Special validation for "Other" reason
    if (isOtherSelected() && (!data.otherReason || !data.otherReason.trim())) {
      newErrors.otherReason = 'Please specify your other reason';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Collect all form data before submission
      const currentData = collectFormData();
      setFormData(currentData);
      
      // Validate all required fields
      if (!validateForm(currentData)) {
        setIsSubmitting(false);
        return;
      }
      
      // Process reasons to include "Other" specification if selected
      let accessReasons = [...(currentData.accessReasons || [])];
      if (isOtherSelected() && currentData.otherReason) {
        // Replace "Other (please specify)" with the actual reason
        accessReasons = accessReasons.map(reason => 
          reason.startsWith('Other') ? `Other: ${currentData.otherReason}` : reason
        );
      }
      
      // Submit to Supabase
      const { error } = await supabase
        .from('early_access_subscribers')
        .insert([
          { 
            email: currentData.email,
            mobile: currentData.mobile || null,
            source: 'early-access-form',
            about_self: currentData.aboutSelf || '',
            access_reason: accessReasons.join(', '),
            reason_explanation: currentData.reasonExplanation || ''
          }
        ]);
      
      if (error) {
        if (error.code === '23505') {
          onNotification('You are already subscribed!', 'success');
        } else {
          throw error;
        }
      } else {
        onNotification('Thank you for requesting early access!', 'success');
      }
      
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      onNotification(error.message || 'Failed to submit the form. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Validate email format
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Check if form is complete enough to submit
  const isFormComplete = () => {
    const currentData = collectFormData();
    return validateForm(currentData);
  };
  
  // Set up refs for input elements
  const setInputRef = (refKey, element) => {
    if (element && !element.dataset.refSet) {
      formRefs.current[refKey] = element;
      element.dataset.refSet = true;
    }
  };

  const renderInput = (question) => {
    const key = question.name;
    const value = formData[key] || '';
    const error = errors[key];
    
    switch (question.type) {
      case 'checkbox':
        if (key === 'accessReason') {
          return (
            <>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const optionKey = `${key}-${optionIndex}`;
                  const isSelected = formData.accessReasons && formData.accessReasons.includes(option);
                  const isTouched = touchedInputs[key + option] || false;
                  const refKey = `checkbox|${key}|${option}`;
                  
                  return (
                    <div 
                      key={optionIndex} 
                      className={`flex items-center ${isTouched ? 'bg-primary-900/60' : ''} ${isSelected ? 'bg-primary-800/40' : ''} transition-colors rounded p-2 mb-1 active:bg-primary-800/40`}
                    >
                      <input
                        type="checkbox"
                        id={optionKey}
                        name={optionKey}
                        ref={(el) => setInputRef(refKey, el)}
                        className="w-5 h-5 text-primary-600 border-gray-600 focus:ring-primary-500 bg-gray-800 rounded"
                        defaultChecked={isSelected}
                        onChange={() => handleChange('checkbox', key, option)}
                      />
                      <label 
                        htmlFor={optionKey} 
                        className="ml-3 text-sm text-gray-300 flex-1 py-1"
                        onClick={() => handleChange('checkbox', key, option)}
                      >
                        {option}
                      </label>
                    </div>
                  );
                })}
                {error && (
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </div>

              {/* Show text input if "Other" is selected */}
              {isOtherSelected() && (
                <div className="mt-3 ml-8">
                  <input
                    type="text"
                    className={`w-full px-3 py-2 bg-gray-800 border ${errors.otherReason ? 'border-red-500' : 'border-gray-700'} rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50`}
                    placeholder="Please specify your other reason..."
                    defaultValue={formData.otherReason || ''}
                    ref={(el) => setInputRef(`text|otherReason`, el)}
                    autoComplete="off"
                    onChange={() => handleChange('text', 'otherReason')}
                  />
                  {errors.otherReason && (
                    <p className="text-sm text-red-500 mt-1">{errors.otherReason}</p>
                  )}
                </div>
              )}
            </>
          );
        }
        return null;
      
      case 'textarea':
        return (
          <>
            <textarea
              className={`w-full px-3 py-2 bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-700'} rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50`}
              rows="3"
              placeholder={question.placeholder || "Your answer..."}
              defaultValue={value}
              ref={(el) => setInputRef(`textarea|${key}`, el)}
              autoComplete="off"
              onChange={() => handleChange('textarea', key)}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </>
        );
      
      case 'email':
        return (
          <>
            <input
              type="email"
              className={`w-full px-3 py-2 bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-700'} rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50`}
              placeholder={question.placeholder || "your@email.com"}
              defaultValue={value}
              ref={(el) => setInputRef(`email|${key}`, el)}
              autoComplete="off"
              onChange={() => handleChange('email', key)}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </>
        );
      
      case 'text':
      default:
        return (
          <>
            <input
              type="text"
              className={`w-full px-3 py-2 bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-700'} rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50`}
              placeholder={question.placeholder || ""}
              defaultValue={value}
              ref={(el) => setInputRef(`text|${key}`, el)}
              autoComplete="off"
              onChange={() => handleChange('text', key)}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </>
        );
    }
  };

  // Reset form refs when component unmounts
  useEffect(() => {
    return () => {
      formRefs.current = {};
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-start p-4 overflow-y-auto">
      <div className="bg-primary-900 border border-primary-800/60 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto survey-container">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{surveyData.title}</h2>
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
          
          {/* Form content */}
          <div className="mb-8">
            <div className="space-y-6">
              {surveyData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="space-y-2">
                  <label className="block text-white font-medium">
                    {question.label} 
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderInput(question)}
                </div>
              ))}
            </div>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end mt-8">
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg ${isSubmitting ? 
                'bg-gray-700 text-gray-400 cursor-not-allowed' : 
                'bg-gradient-to-r from-primary-600 to-primary-800 text-white hover:from-primary-500 hover:to-primary-700 active:scale-95 transform transition-transform'}`}
            >
              {isSubmitting ? 'Submitting...' : surveyData.submitButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 