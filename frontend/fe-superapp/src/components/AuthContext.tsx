import React, { createContext, useContext, useState } from 'react';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!(Cookies.get('auth_name') && Cookies.get('auth_email'))
  );

  const logout = () => {
    const isLocalhost = window.location.hostname === 'localhost';
    const cookieOptions = {
      path: '/',
      ...(isLocalhost ? {} : { domain: '.vnrzone.site' }),
    };

    Cookies.remove('userToken', cookieOptions);
    Cookies.remove('user', cookieOptions);
    Cookies.remove('auth_email', cookieOptions);
    Cookies.remove('auth_name', cookieOptions);
    Cookies.remove('auth_picture', cookieOptions);

    console.log('Cookies after logout:', {
      userToken: Cookies.get('userToken'),
      user: Cookies.get('user'),
      auth_email: Cookies.get('auth_email'),
      auth_name: Cookies.get('auth_name'),
      auth_picture: Cookies.get('auth_picture'),
    });

    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};