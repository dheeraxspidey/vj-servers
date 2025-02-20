import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginWithGoogle, setPassword, fetchUserProfile, logout as apiLogout } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile1 = useCallback(async (authToken) => {
    try {
      const userData = await fetchUserProfile(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile1(storedToken);
    }
    setLoading(false);
  }, [fetchUserProfile1]);

  const handleGoogleCallback = async (newToken, userData) => {
    try{
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const user = JSON.parse(decodeURIComponent(userData));
    setUser(user);
    }catch(err){
      console.log("error occurred at handleGoogleCallBack")
    }
  };

  const logout = () => {
    apiLogout();
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, token, loginWithGoogle, handleGoogleCallback, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
