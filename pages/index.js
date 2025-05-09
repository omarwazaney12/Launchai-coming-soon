import { useState, useEffect } from 'react';
import Head from 'next/head';
import { FaInstagram } from 'react-icons/fa/index.js';
import Background from '../components/Background';
import Navbar from '../components/Navbar';
import EarlyAccessForm from '../components/EarlyAccessForm';
import JobApplicationButton from '../components/JobApplicationButton';
import JobApplicationForm from '../components/JobApplicationForm';
import Notification from '../components/Notification';
import SurveyForm from '../components/SurveyForm';

export default function Home() {
  const [activeTab, setActiveTab] = useState('early-access');
  const [applicationFormVisible, setApplicationFormVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [surveyFormVisible, setSurveyFormVisible] = useState(false);
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    show: false
  });

  // Initialize SurveyMonkey widget
  useEffect(() => {
    // Add SurveyMonkey script
    const script = document.createElement('script');
    script.innerHTML = `(function(t,e,s,n){var o,a,c;t.SMCX=t.SMCX||[],e.getElementById(n)||(o=e.getElementsByTagName(s),a=o[o.length-1],c=e.createElement(s),c.type="text/javascript",c.async=!0,c.id=n,c.src="https://widget.surveymonkey.com/collect/website/js/tRaiETqnLgj758hTBazgd4xLwA22va5PfWzzV1_2FuLGv0DZF1tvUvKRUtT8I7_2BFV3.js",a.parentNode.insertBefore(c,a))})(window,document,"script","smcx-sdk")`;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleShowNotification = (message, type = 'success') => {
    setNotification({
      message,
      type,
      show: true
    });
  };

  const handleHideNotification = () => {
    setNotification(prev => ({
      ...prev,
      show: false
    }));
  };

  const openApplicationForm = (position) => {
    setSelectedPosition(position);
    setApplicationFormVisible(true);
  };

  const closeApplicationForm = () => {
    setApplicationFormVisible(false);
  };

  const openSurveyForm = () => {
    // Use SurveyMonkey widget instead of our custom form
    if (window.SMCX && typeof window.SMCX.show === 'function') {
      window.SMCX.show();
    } else {
      // Fallback if SurveyMonkey hasn't loaded
      setSurveyFormVisible(true);
    }
  };

  const closeSurveyForm = () => {
    setSurveyFormVisible(false);
  };

  return (
    <div>
      <Head>
        <title>LaunchAI - Coming Soon</title>
        <meta name="description" content="LaunchAI - From Concept To Launch" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="application-name" content="LaunchAI" />
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
        <meta name="apple-mobile-web-app-title" content="LaunchAI" />
      </Head>

      <Background />
      <Navbar />

      <main className="relative z-10 min-h-screen pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center bg-gradient-to-r from-white to-primary-400 bg-clip-text text-transparent mb-3">
            LaunchAI
          </h1>
          
          <div className="text-xl md:text-2xl text-primary-400 mb-6 font-medium tracking-wide">
            From Concept To Launch
          </div>
          
          <p className="text-gray-300 text-lg text-center max-w-2xl mb-10">
            We're building the ultimate AI platform to help entrepreneurs transform ideas into successful businesses. 
            Get ready for a revolutionary approach to startup creation.
          </p>

          <div className="w-full max-w-2xl mb-8">
            <div className="flex border-b border-primary-800/50 mb-6">
              <button 
                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'early-access' ? 'text-white border-b-2 border-primary-500' : 'text-gray-400 hover:text-gray-300'}`}
                onClick={() => setActiveTab('early-access')}
              >
                Early Access
              </button>
              <button 
                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'join-team' ? 'text-white border-b-2 border-primary-500' : 'text-gray-400 hover:text-gray-300'}`}
                onClick={() => setActiveTab('join-team')}
              >
                Join Our Team
              </button>
            </div>

            <div className={`tab-content ${activeTab === 'early-access' ? 'active' : ''}`}>
              <div className="py-6 px-8 bg-primary-900/30 backdrop-blur-sm rounded-xl border border-primary-800/30 shadow-xl">
                <h2 className="text-xl font-semibold text-center mb-4">Be One Of The First Users</h2>
                <p className="text-gray-300 text-center mb-6">
                  Get early access to our AI-powered platform and give your startup the competitive edge.
                </p>
                <div className="w-full max-w-md mx-auto">
                  <button
                    onClick={openSurveyForm}
                    className="w-full btn-hover-effect px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg font-semibold text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                    <span>Get Early Access</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={`tab-content ${activeTab === 'join-team' ? 'active' : ''}`}>
              <div className="py-6 px-8 bg-primary-900/30 backdrop-blur-sm rounded-xl border border-primary-800/30 shadow-xl">
                <h2 className="text-xl font-semibold text-center mb-4">Join Our Team</h2>
                <p className="text-gray-300 text-center mb-6">
                  We're looking for talented individuals to join our mission of revolutionizing startup creation.
                </p>
                
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* CTO Position */}
                  <div className="bg-primary-900/30 backdrop-blur-sm rounded-xl border border-primary-800/30 p-5 transition-transform hover:-translate-y-1 flex flex-col h-full">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-2">CTO</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Lead our technical vision and engineering team to build our AI-powered platform.
                      </p>
                      <p className="text-gray-300 text-sm mb-4">
                        <span className="font-medium">Skills:</span> AI/ML, Full-Stack Development, Cloud Architecture
                      </p>
                    </div>
                    <div className="mt-4">
                      <JobApplicationButton position="CTO" onClick={openApplicationForm} />
                    </div>
                  </div>

                  {/* Developer Position */}
                  <div className="bg-primary-900/30 backdrop-blur-sm rounded-xl border border-primary-800/30 p-5 transition-transform hover:-translate-y-1 flex flex-col h-full">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-2">Full-Stack Developer</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Build the future of startup creation with modern web technologies.
                      </p>
                      <p className="text-gray-300 text-sm mb-4">
                        <span className="font-medium">Skills:</span> React, Node.js, TypeScript, Database Design
                      </p>
                    </div>
                    <div className="mt-4">
                      <JobApplicationButton position="Full-Stack Developer" onClick={openApplicationForm} />
                    </div>
                  </div>

                  {/* AI Engineer Position */}
                  <div className="bg-primary-900/30 backdrop-blur-sm rounded-xl border border-primary-800/30 p-5 transition-transform hover:-translate-y-1 flex flex-col h-full">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-2">AI Engineer</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Develop innovative AI solutions to power our startup creation platform.
                      </p>
                      <p className="text-gray-300 text-sm mb-4">
                        <span className="font-medium">Skills:</span> Machine Learning, NLP, LLM Fine-Tuning, Python
                      </p>
                    </div>
                    <div className="mt-4">
                      <JobApplicationButton position="AI Engineer" onClick={openApplicationForm} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-primary-400 text-lg font-medium mt-12">
            Coming Soon – Summer 2025
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-8 border-t border-primary-800/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">© 2025 LaunchAI. All rights reserved.</p>
          <div className="flex justify-center mt-4">
            <a 
              href="https://instagram.com/launchai.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary-400 transition-colors"
              aria-label="Follow us on Instagram"
            >
              <FaInstagram size={20} />
            </a>
          </div>
        </div>
      </footer>

      {/* Notification component */}
      <Notification 
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onHide={handleHideNotification}
      />

      {/* Job Application Form Modal */}
      {applicationFormVisible && (
        <JobApplicationForm
          position={selectedPosition}
          onClose={closeApplicationForm}
          onNotification={handleShowNotification}
        />
      )}

      {/* Fall back to custom Survey Form Modal if SurveyMonkey fails to load */}
      {surveyFormVisible && (
        <SurveyForm
          onClose={closeSurveyForm}
          onNotification={handleShowNotification}
        />
      )}
    </div>
  );
} 