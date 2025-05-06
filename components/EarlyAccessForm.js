import { useState } from 'react';
import { supabase } from '../utils/supabase';

export default function EarlyAccessForm({ onNotification }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      onNotification('Please enter a valid email address', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('early_access_subscribers')
        .insert([
          { 
            email,
            source: 'coming-soon-page',
            ip_address: '',
            user_agent: navigator.userAgent
          }
        ]);
      
      if (error) {
        if (error.code === '23505') {
          onNotification('You are already subscribed!', 'success');
          setIsSubscribed(true);
        } else {
          throw error;
        }
      } else {
        onNotification('Thank you for subscribing!', 'success');
        setIsSubscribed(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      onNotification('Failed to subscribe. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="text-center py-8 px-6 fade-in">
        <h2 className="text-2xl font-bold text-primary-400 mb-4">Thank You!</h2>
        <p className="text-gray-300">We'll notify you when LaunchAI goes live.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 email-form">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email for early access"
            className="flex-1 px-6 py-4 bg-primary-800/50 border border-primary-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-hover-effect px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg font-semibold text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            <span>{isSubmitting ? 'Processing...' : 'Get Early Access'}</span>
          </button>
        </div>
      </form>
    </div>
  );
} 