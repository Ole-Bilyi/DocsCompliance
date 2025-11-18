'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserProfile from '@/app/session/UserProfile';
import Create from '@/components/group/create';

export default function CreatePage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      // First, try to restore session from server if email exists in localStorage
      const email = UserProfile.getEmail();
      if (email) {
        await UserProfile.restoreFromServer();
      }

      const currentEmail = UserProfile.getEmail();
      if (!currentEmail) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/auth/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentEmail }),
        });
        const authData = await res.json();

        if (!authData.authenticated) {
          UserProfile.clearSession();
          router.push('/login');
          return;
        }

        // Allow create page for authenticated users (they haven't created/joined a group yet)
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

  return <Create />;
}