'use client';

const STORAGE_KEY = 'docscompliance_user_profile';

let UserProfile = (function() {
  // Initialize from localStorage if available
  let loadFromStorage = () => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading profile from storage:', e);
    }
    return null;
  };

  // Save to localStorage
  let saveToStorage = (data) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving profile to storage:', e);
    }
  };

  // Initialize state from localStorage or defaults
  let storedData = loadFromStorage() || {};
  let user_name = storedData.user_name || "";
  let group_name = storedData.group_name || "";
  let user_email = storedData.user_email || "";
  let adminD = storedData.adminD || false;

  // Internal function to sync all data to storage
  let syncStorage = () => {
    saveToStorage({
      user_name,
      group_name,
      user_email,
      adminD
    });
  };

  let getName = function() {
    return user_name;
  };

  let setName = function(name) {
    user_name = name || "";
    syncStorage();
  };

  let getAdmin = function() {
    return adminD;
  };

  let setAdmin = function(admin) {
    adminD = Boolean(admin);
    syncStorage();
  };

  let getGName = function() {
    return group_name;
  };

  let setGName = function(Gname) {
    group_name = Gname || "";
    syncStorage();
  };

  let getEmail = function() {
    return user_email;
  };

  let setEmail = function(email) {
    user_email = email || "";
    syncStorage();
  };

  // Clear all session data
  let clearSession = function() {
    user_name = "";
    group_name = "";
    user_email = "";
    adminD = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Restore session from server (useful after page refresh)
  let restoreFromServer = async function() {
    const email = user_email;
    if (!email) {
      return { success: false, error: 'No email in session' };
    }

    try {
      const res = await fetch('/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error('Failed to restore session');
      }

      const authData = await res.json();
      
      if (!authData.authenticated) {
        clearSession();
        return { success: false, error: 'Session expired' };
      }

      // Fetch full user data to get name
      const userRes = await fetch('/api/auth/get-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.success && userData.data) {
          setName(userData.data.user_name || user_name);
          setAdmin(authData.admin || false);
          
          // Get group name if user has a group
          if (authData.hasGroup && authData.groupId) {
            const groupRes = await fetch('/api/group/get', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ groupId: authData.groupId }),
            });
            
            if (groupRes.ok) {
              const groupData = await groupRes.json();
              if (groupData.success && groupData.data) {
                setGName(groupData.data.group_name || "");
              }
            }
          } else {
            setGName("");
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error restoring session:', error);
      return { success: false, error: error.message };
    }
  };

  // Set all profile data at once (useful for login)
  let setProfile = function(profile) {
    if (profile.email !== undefined) user_email = profile.email || "";
    if (profile.name !== undefined) user_name = profile.name || "";
    if (profile.groupName !== undefined) group_name = profile.groupName || "";
    if (profile.admin !== undefined) adminD = Boolean(profile.admin);
    syncStorage();
  };

  return {
    getName: getName,
    setName: setName,
    getAdmin: getAdmin,
    setAdmin: setAdmin,
    getGName: getGName,
    setGName: setGName,
    getEmail: getEmail,
    setEmail: setEmail,
    restoreFromServer: restoreFromServer,
    clearSession: clearSession,
    setProfile: setProfile
  }

})();

export default UserProfile;
