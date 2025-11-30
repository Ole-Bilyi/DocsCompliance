"use client";

import React, { useState, useEffect } from "react";
import "../styles/SubscriptionBlocker.scss";
import UserProfile from "@/app/session/UserProfile";
import { useRouter } from "next/navigation";

export default function SubscriptionBlocker({ children }) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(true);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      // ✅ Check cached subscription access first
      const cachedAccess = UserProfile.getSubscriptionAccess();
      if (cachedAccess !== null) {
        console.log('✅ Using cached subscription access:', cachedAccess);
        setHasAccess(cachedAccess);
        setLoading(false);
        return;
      }

      const email = UserProfile.getEmail();
      if (!email) {
        setHasAccess(false);
        UserProfile.setSubscriptionAccess(false); // ✅ Cache the result
        setLoading(false);
        return;
      }

      const res = await fetch('/api/subscription/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await res.json();
      
      if (result.success) {
        // ✅ Cache the subscription access result
        UserProfile.setSubscriptionAccess(result.access);
        setHasAccess(result.access);
        
        if (!result.access) {
          // Get subscription info for display (don't cache this as it might change)
          const subRes = await fetch('/api/subscription/get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const subResult = await subRes.json();
          if (subResult.success) {
            setSubscriptionInfo(subResult.data);
          }
        }
      } else {
        setHasAccess(false);
        UserProfile.setSubscriptionAccess(false); // ✅ Cache the result
      }
    } catch (e) {
      console.error('Failed to check subscription:', e);
      setHasAccess(false);
      UserProfile.setSubscriptionAccess(false); // ✅ Cache the result
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="subscription-blocker__loading">
        <div>Loading...</div>
      </div>
    );
  }
  
  if (!hasAccess) {
    return (
      <div className="subscription-blocker">
        <div className="subscription-blocker__overlay">
          <div className="subscription-blocker__modal">
            <div className="subscription-blocker__icon">🔒</div>
            <h2 className="subscription-blocker__title">Subscription Required</h2>
            <p className="subscription-blocker__message">
              {subscriptionInfo?.subscription === 'trial' 
                ? 'Your trial period has expired. Upgrade to continue using DocsCompliance.'
                : 'Your subscription has expired. Please upgrade to continue using DocsCompliance.'}
            </p>
            <div className="subscription-blocker__features">
              <div className="subscription-blocker__feature">
                <span className="subscription-blocker__check">✓</span>
                <span>Unlimited contracts and dates</span>
              </div>
              <div className="subscription-blocker__feature">
                <span className="subscription-blocker__check">✓</span>
                <span>Advanced team collaboration</span>
              </div>
              <div className="subscription-blocker__feature">
                <span className="subscription-blocker__check">✓</span>
                <span>Priority support</span>
              </div>
            </div>
            <button 
              className="subscription-blocker__button"
              onClick={() => {
                if(UserProfile.getAdmin()) {
                  router.push('/billing');
                  return;
                } else{
                  alert('Please contact your administrator to upgrade your subscription.');
                }
              }}
            >
              Upgrade Now
            </button>
            <p className="subscription-blocker__contact">
              Need help? Contact your workspace administrator.
            </p>
          </div>
        </div>
        <div className="subscription-blocker__content">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}