'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserProfile from './session/UserProfile';
import "./globals.css";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        // Sync with server to check if user has valid session
        await UserProfile.syncWithServer();
        
        if (UserProfile.getIsLoggedIn()) {
          // User has valid session - redirect to main page
          router.push('/mainPage');
        } else {
          // No valid session - redirect to login page
          router.push('/login');
        }
      } catch (error) {
        // If sync fails, redirect to login
        console.log('Session check failed, redirecting to login');
        router.push('/login');
      }
    };

    checkSessionAndRedirect();
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'var(--font-geist-sans)' 
    }}>
      <div>Checking your session...</div>
    </div>
  );
}