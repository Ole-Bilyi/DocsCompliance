// app/join/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserProfile from '@/app/session/UserProfile';
import Join from '@/components/group/join';

export default function JoinPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First sync with server to get current user data
        await UserProfile.syncWithServer()

        const currentEmail = UserProfile.getEmail();
        if (!currentEmail) {
          router.push('/login');
          return;
        }

        // Now call the check endpoint with the email
        const res = await fetch('/api/auth/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentEmail })
        });

        const authData = await res.json();

        if (!authData.authenticated) {
          UserProfile.clearSession();
          router.push('/login');
          return;
        }

        // Allow join page even if they already have a group
        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        UserProfile.clearSession();
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthorized === null) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return <Join />;
}