import { useEffect } from 'react';

export default function Notification({ message, type, show, onHide }) {
  useEffect(() => {
    if (show && message) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, message, onHide]);

  if (!show || !message) return null;

  return (
    <div className={`notification ${type === 'error' ? 'error' : 'success'} ${show ? 'show' : 'hide'}`}>
      {message}
    </div>
  );
} 