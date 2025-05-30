import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TestSupabase() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to homepage
    router.replace('/');
  }, [router]);
  
  return (
    <div>
      <p>Redirecting to homepage...</p>
    </div>
  );
} 