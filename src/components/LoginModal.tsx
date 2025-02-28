import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';

interface GoogleUserInfo {
  name: string;
  email: string;
  picture?: string;
  hd?: string;
}

interface LoginModalProps {
  onClose: () => void;
  onLogin: (username: string, email: string, picture?: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setIsAuthenticated } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    const email = `${username}@edu.example.com`;
    Cookies.set('auth_name', username, { path: '/' });
    Cookies.set('auth_email', email, { path: '/' });
    setIsAuthenticated(true);
    onLogin(username, email);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userInfo: GoogleUserInfo = await response.json();
        console.log('User Info:', userInfo);

        const emailDomain = userInfo.email.split('@')[1];
        const isEduEmail =
          emailDomain.endsWith('.edu') ||
          userInfo.hd === 'vnrvjiet.in' ||
          emailDomain.includes('edu');

        if (!isEduEmail) {
          setError('Please use an educational email address to login');
          setIsLoading(false);
          return;
        }

        const isSecure = window.location.protocol === 'https:';
        const isLocalhost = window.location.hostname === 'localhost';
        const cookieOptions = {
          path: '/',
          secure: isSecure && !isLocalhost,
          sameSite: 'lax' as const,
          expires: 1,
          ...(isLocalhost ? {} : { domain: '.vnrzone.site' }),
        };

        try {
          Cookies.set('userToken', tokenResponse.access_token, cookieOptions);
          Cookies.set('user', JSON.stringify(userInfo), cookieOptions);
          Cookies.set('auth_email', userInfo.email, cookieOptions);
          Cookies.set('auth_name', userInfo.name, cookieOptions);
          Cookies.set('auth_picture', userInfo.picture || '', cookieOptions);

          console.log('Cookies set:', {
            userToken: Cookies.get('userToken'),
            user: Cookies.get('user'),
            auth_email: Cookies.get('auth_email'),
            auth_name: Cookies.get('auth_name'),
            auth_picture: Cookies.get('auth_picture'),
          });
        } catch (cookieError) {
          console.error('Error setting cookies:', cookieError);
          setError('Failed to set authentication cookies');
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);
        onLogin(userInfo.name, userInfo.email, userInfo.picture);
      } catch (err) {
        console.error('Error during Google login:', err);
        setError('Failed to login with Google. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google Login Error:', errorResponse);
      setError('Google login failed. Please try again.');
      setIsLoading(false);
    },
    scope: 'openid profile email',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center bg-indigo-700 text-white px-6 py-4">
          <h3 className="text-xl font-bold">Login to VNRVJIET Super App</h3>
          <button onClick={onClose} className="text-indigo-100 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username or Email
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your username or email"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 px-4 rounded-lg disabled:opacity-50"
            disabled={isLoading}
          >
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div className="text-center text-sm text-gray-500 mt-4">
            <p>Use your VNRVJIET Google account to sign in</p>
            <p className="mt-2">
              Don&apos;t have an account?{' '}
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;