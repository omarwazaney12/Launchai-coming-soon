import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export default function SurveyForm({ onClose, onNotification }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedInputs, setTouchedInputs] = useState({});
  const [isScrolling, setIsScrolling] = useState(false);
  
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
  
  // Straightforward, non-debounced input handler
  const handleInputChange = (sectionIndex, questionIndex, value, isCheckbox = false) => {
    const section = surveyData.sections[sectionIndex];
    const question = section.questions[questionIndex];
    const key = `${section.title}-${question.label}`;
    
    setFormData(prev => {
      const newFormData = { ...prev };
      
      if (isCheckbox) {
        if (!newFormData[key]) {
          newFormData[key] = [value];
        } else if (newFormData[key].includes(value)) {
          newFormData[key] = newFormData[key].filter(item => item !== value);
        } else {
          // If there's a limit, check if we're at the limit
          if (question.limit && newFormData[key].length >= question.limit) {
            return prev; // Don't add more if we're at the limit
          }
          newFormData[key] = [...newFormData[key], value];
        }
      } else {
        newFormData[key] = value;
      }
      
      return newFormData;
    });
  };
  
  // Handle input changes with touch feedback
  const handleImmediateChange = (sectionIndex, questionIndex, value, isCheckbox = false) => {
    // Skip if scrolling to avoid accidental selections
    if (isScrolling) return;
    
    const section = surveyData.sections[sectionIndex];
    const question = section.questions[questionIndex];
    const key = `${section.title}-${question.label}`;
    
    // Handle the change
    handleInputChange(sectionIndex, questionIndex, value, isCheckbox);
    
    // Give touch feedback after state update
    handleTouchFeedback(key + value);
  };

  const surveyData = {
    "title": "LaunchAI Early Access Survey",
    "sections": [
      {
        "title": "1. About You",
        "questions": [
          {
            "type": "checkbox",
            "label": "What best describes you?",
            "options": [
              "I'm a first-time founder",
              "I'm a serial entrepreneur",
              "I have a startup idea",
              "I work at a startup",
              "I'm a developer / engineer",
              "I'm a designer",
              "I'm a marketer / growth expert",
              "I'm an investor / mentor",
              "I want to join a startup",
              "I'm just curious / exploring",
              "Other: ____________"
            ]
          },
          {
            "type": "radio",
            "label": "How technical are you?",
            "options": [
              "Not technical at all",
              "Beginner (I can use no-code tools)",
              "Intermediate (I know basic coding)",
              "Advanced (I build apps & APIs)"
            ]
          }
        ]
      },
      {
        "title": "2. Your Startup Journey",
        "questions": [
          {
            "type": "radio",
            "label": "Do you have a startup idea right now?",
            "options": [
              "Yes",
              "No",
              "I have multiple ideas",
              "I'm working on someone else's startup"
            ]
          },
          {
            "type": "radio",
            "label": "What stage are you in right now?",
            "options": [
              "Just brainstorming",
              "Validating my idea",
              "Building my MVP",
              "Preparing to launch",
              "Already launched",
              "Not working on a startup"
            ]
          },
          {
            "type": "checkbox",
            "label": "What are your biggest roadblocks right now? (Select up to 3)",
            "options": [
              "Finding & validating a good idea",
              "Doing market research",
              "Defining my target audience",
              "Writing a business model",
              "Building an MVP",
              "Financial planning / projections",
              "Creating a pitch deck",
              "Getting early users / traction",
              "Raising funds",
              "Staying focused / organized",
              "I'm not sure where to start"
            ],
            "limit": 3
          }
        ]
      },
      {
        "title": "3. Current Methods & Tools",
        "questions": [
          {
            "type": "textarea",
            "label": "How are you validating or building your idea today?",
            "placeholder": "e.g., surveys, Reddit, talking to users, using Notion, Webflow, Figma, etc."
          },
          {
            "type": "checkbox",
            "label": "Have you used any startup tools before?",
            "options": [
              "Y Combinator Startup School",
              "Idea validation tools (e.g. Validation Board)",
              "Business model canvases",
              "Bubble / Webflow / Framer",
              "OpenAI / ChatGPT",
              "Typeform / Tally / Google Forms",
              "None of the above"
            ]
          }
        ]
      },
      {
        "title": "4. What Would Be Most Useful to You?",
        "questions": [
          {
            "type": "checkbox",
            "label": "Which features of LaunchAI sound most helpful to you?",
            "options": [
              "AI-generated market & competitor research",
              "Step-by-step startup building journey",
              "Business model + financial plan generation",
              "MVP feature list + user flows",
              "Automatic code generation / export",
              "Pitch deck builder",
              "GTM strategy & campaign planner",
              "A dashboard that tracks your startup progress",
              "All of the above"
            ]
          },
          {
            "type": "checkbox",
            "label": "Would you like to be:",
            "options": [
              "A test user (use LaunchAI before it's public)",
              "A beta collaborator (help us improve it)",
              "A contributor (developer, designer, mentor, etc.)",
              "Just following the journey"
            ]
          }
        ]
      },
      {
        "title": "5. Pricing & Value Insight",
        "questions": [
          {
            "type": "radio",
            "label": "How much would you realistically be willing to pay for an AI-powered platform that guides you from idea to launch?",
            "options": [
              "I wouldn't pay",
              "$5/month",
              "$10/month",
              "$20/month",
              "$50/month",
              "$100/month",
              "I'd prefer a one-time payment",
              "Other: ___________"
            ]
          },
          {
            "type": "radio",
            "label": "If LaunchAI offered a free plan with limited features, would you:",
            "options": [
              "Stick with the free plan",
              "Consider upgrading later",
              "Immediately want premium features"
            ]
          },
          {
            "type": "textarea",
            "label": "What would make you say, \"I need this now\"?",
            "placeholder": "Your answer"
          },
          {
            "type": "text",
            "label": "What price would feel too expensive for you — even if the platform was amazing?",
            "placeholder": "Your honest answer"
          },
          {
            "type": "textarea",
            "label": "What kind of features would make it 100% worth paying for?",
            "placeholder": "Be as specific as you'd like"
          }
        ]
      },
      {
        "title": "6. Stay in the Loop",
        "questions": [
          {
            "type": "text",
            "label": "Email (for early access + updates)",
            "placeholder": "📩 your@email.com"
          },
          {
            "type": "text",
            "label": "Mobile Number (for product updates)",
            "placeholder": "📱 +962..."
          },
          {
            "type": "textarea",
            "label": "Anything else you'd like to share with us?",
            "placeholder": "📝 Your thoughts, feedback, or startup pitch..."
          }
        ]
      }
    ]
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Get the email from the form data
      const emailKey = `${surveyData.sections[5].title}-${surveyData.sections[5].questions[0].label}`;
      const email = formData[emailKey] || '';
      
      // Submit to Supabase
      const { error } = await supabase
        .from('early_access_subscribers')
        .insert([
          { 
            email,
            source: 'survey-form',
            survey_data: formData,
            ip_address: '',
            user_agent: navigator.userAgent
          }
        ]);
      
      if (error) {
        if (error.code === '23505') {
          onNotification('You are already subscribed!', 'success');
        } else {
          throw error;
        }
      } else {
        onNotification('Thank you for completing our survey!', 'success');
      }
      
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      onNotification('Failed to submit the form. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextSection = () => {
    if (currentSection < surveyData.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const isLastSection = currentSection === surveyData.sections.length - 1;
  const currentSectionData = surveyData.sections[currentSection];

  // Utility function to check if email is provided in the final section
  const isFinalSectionComplete = () => {
    if (!isLastSection) return true;
    
    const emailKey = `${surveyData.sections[5].title}-${surveyData.sections[5].questions[0].label}`;
    const email = formData[emailKey] || '';
    
    return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const renderInput = (question, sectionIndex, questionIndex) => {
    const key = `${surveyData.sections[sectionIndex].title}-${question.label}`;
    
    switch (question.type) {
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options.map((option, optionIndex) => {
              const optionKey = `${key}-${optionIndex}`;
              const isSelected = formData[key]?.includes(option) || false;
              const isTouched = touchedInputs[key + option] || false;
              
              return (
                <div 
                  key={optionIndex} 
                  className={`flex items-center ${isTouched ? 'bg-primary-900/60' : ''} transition-colors rounded p-2 mb-1 active:bg-primary-800/40`}
                >
                  <input
                    type="checkbox"
                    id={optionKey}
                    className="w-5 h-5 text-primary-600 border-gray-600 rounded focus:ring-primary-500 bg-gray-800"
                    checked={isSelected}
                    onChange={() => handleImmediateChange(sectionIndex, questionIndex, option, true)}
                  />
                  <label 
                    htmlFor={optionKey} 
                    className="ml-3 text-sm text-gray-300 flex-1 py-1"
                    onClick={() => handleImmediateChange(sectionIndex, questionIndex, option, true)}
                  >
                    {option}
                  </label>
                </div>
              );
            })}
            {question.limit && (
              <p className="text-xs text-gray-500 mt-1">
                Please select up to {question.limit} options
                {formData[key] ? ` (${formData[key].length}/${question.limit} selected)` : ''}
              </p>
            )}
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {question.options.map((option, optionIndex) => {
              const optionKey = `${key}-${optionIndex}`;
              const isSelected = formData[key] === option;
              const isTouched = touchedInputs[key + option] || false;
              
              return (
                <div 
                  key={optionIndex} 
                  className={`flex items-center ${isTouched ? 'bg-primary-900/60' : ''} transition-colors rounded p-2 mb-1 active:bg-primary-800/40`}
                >
                  <input
                    type="radio"
                    id={optionKey}
                    name={key}
                    className="w-5 h-5 text-primary-600 border-gray-600 focus:ring-primary-500 bg-gray-800"
                    checked={isSelected}
                    onChange={() => handleImmediateChange(sectionIndex, questionIndex, option)}
                  />
                  <label 
                    htmlFor={optionKey} 
                    className="ml-3 text-sm text-gray-300 flex-1 py-1"
                    onClick={() => handleImmediateChange(sectionIndex, questionIndex, option)}
                  >
                    {option}
                  </label>
                </div>
              );
            })}
          </div>
        );
      
      case 'textarea':
        return (
          <textarea
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
            rows="3"
            placeholder={question.placeholder}
            value={formData[key] || ''}
            autoComplete="off"
            key={`textarea-${key}`}
            onChange={(e) => handleImmediateChange(sectionIndex, questionIndex, e.target.value)}
          />
        );
      
      case 'text':
        return (
          <input
            type="text"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
            placeholder={question.placeholder}
            value={formData[key] || ''}
            autoComplete="off"
            key={`input-${key}`}
            onChange={(e) => handleImmediateChange(sectionIndex, questionIndex, e.target.value)}
          />
        );
      
      default:
        return null;
    }
  };

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
          
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="w-full bg-gray-800 rounded-full h-2.5">
              <div 
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${((currentSection + 1) / surveyData.sections.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Start</span>
              <span>{`Section ${currentSection + 1} of ${surveyData.sections.length}`}</span>
              <span>Complete</span>
            </div>
          </div>

          {/* Current section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-primary-400 mb-4">{currentSectionData.title}</h3>
            
            <div className="space-y-6">
              {currentSectionData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="space-y-2">
                  <label className="block text-white font-medium">{question.label}</label>
                  {renderInput(question, currentSection, questionIndex)}
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button 
              onClick={prevSection} 
              disabled={currentSection === 0}
              className={`px-4 py-3 rounded ${currentSection === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white active:bg-primary-800/40'}`}
            >
              Previous
            </button>
            
            <div className="flex gap-3">
              {isLastSection ? (
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !isFinalSectionComplete()}
                  className={`px-6 py-3 rounded-lg ${isSubmitting || !isFinalSectionComplete() ? 
                    'bg-gray-700 text-gray-400 cursor-not-allowed' : 
                    'bg-gradient-to-r from-primary-600 to-primary-800 text-white hover:from-primary-500 hover:to-primary-700 active:scale-95 transform transition-transform'}`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                </button>
              ) : (
                <button 
                  onClick={nextSection}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg text-white hover:from-primary-500 hover:to-primary-700 active:scale-95 transform transition-transform"
                >
                  Next Section
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 