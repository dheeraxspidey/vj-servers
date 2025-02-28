// auth-utils.ts
import Cookies from 'js-cookie';

interface AuthUser {
  name: string;
  email: string;
  picture?: string;
  isAuthenticated: boolean;
}

// Function to check if user is authenticated
export const checkAuth = (): AuthUser => {
  // Try to get auth info from cookies first
  let name = Cookies.get('auth_name');
  let email = Cookies.get('auth_email');
  let picture = Cookies.get('auth_picture');
  
  // If not in cookies, try localStorage as fallback
  if (!name || !email) {
    name = localStorage.getItem('auth_name') || '';
    email = localStorage.getItem('auth_email') || '';
    picture = localStorage.getItem('auth_picture') || undefined;
  }
  
  return {
    name,
    email,
    picture,
    isAuthenticated: !!(name && email)
  };
};

// Function to logout
export const logout = () => {
  // Clear cookies
  Cookies.remove('auth_name', { path: '/' });
  Cookies.remove('auth_email', { path: '/' });
  Cookies.remove('auth_picture', { path: '/' });
  
  // Clear localStorage
  localStorage.removeItem('auth_name');
  localStorage.removeItem('auth_email');
  localStorage.removeItem('auth_picture');
  
  // Reload the page to clear any state
  window.location.reload();
};

// Function for iframe communication
export const setupIframeAuth = () => {
  // Listen for auth requests from iframes
  window.addEventListener('message', (event) => {
    // Make sure you validate the origin to prevent security issues
    // Only respond to trusted domains
    const trustedOrigins = [
      'https://yourdomain.com', 
      'https://subdomain.yourdomain.com'
      // Add all your trusted domains here
    ];
    
    if (trustedOrigins.includes(event.origin) && event.data === 'REQUEST_AUTH_STATUS') {
      // Send auth data to the iframe
      const authData = checkAuth();
      event.source?.postMessage({
        type: 'AUTH_STATUS',
        data: authData
      }, event.origin as any);
    }
  });
};