import React, { useState, useEffect } from 'react';
import { GraduationCap, User, LogIn } from 'lucide-react';
import LoginModal from './LoginModal';

const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPicture, setUserPicture] = useState('');

  const handleLogin = (user: string, email: string, picture: string = '') => {
    setIsLoggedIn(true);
    setUsername(user);
    setUserEmail(email);
    if (picture) setUserPicture(picture);
    setIsLoginModalOpen(false);
    
    // Store login info in localStorage to persist across page refreshes
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', user);
    localStorage.setItem('userEmail', email);
    if (picture) localStorage.setItem('userPicture', picture);
    
    // Dispatch custom event to notify other components about login state change
    window.dispatchEvent(new Event('loginStateChanged'));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setUserEmail('');
    setUserPicture('');
    
    // Clear login info from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPicture');
    
    // Dispatch custom event to notify other components about login state change
    window.dispatchEvent(new Event('loginStateChanged'));
  };

  // Check for existing login on component mount
  useEffect(() => {
    const storedLoggedIn = localStorage.getItem('isLoggedIn');
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('userEmail');
    const storedPicture = localStorage.getItem('userPicture');
    
    if (storedLoggedIn === 'true' && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      if (storedEmail) setUserEmail(storedEmail);
      if (storedPicture) setUserPicture(storedPicture);
    }
  }, []);

  return (
    <header className="bg-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GraduationCap size={32} className="text-yellow-300" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">VNRVJIET Super App</h1>
              <p className="text-xs text-indigo-200">All college services in one place</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-indigo-100 hover:text-white transition-colors">Home</a>
            <a href="#" className="text-indigo-100 hover:text-white transition-colors">About</a>
            <a href="#" className="text-indigo-100 hover:text-white transition-colors">Contact</a>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-indigo-800 rounded-full px-3 py-1">
                  {userPicture ? (
                    <img 
                      src={userPicture} 
                      alt={username} 
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User size={16} className="text-indigo-200" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{username}</span>
                    {userEmail && (
                      <span className="text-xs text-indigo-300">{userEmail}</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <LogIn size={16} />
                <span>Login</span>
              </button>
            )}
          </nav>
          
          {/* Mobile login button */}
          <div className="md:hidden flex items-center space-x-2">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                {userPicture ? (
                  <img 
                    src={userPicture} 
                    alt={username} 
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="bg-indigo-800 rounded-full px-2 py-1">
                    <User size={14} className="text-indigo-200" />
                  </div>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded-lg text-xs transition-colors"
              >
                <LogIn size={14} />
                <span>Login</span>
              </button>
            )}
            
            <button className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)} 
          onLogin={handleLogin}
        />
      )}
    </header>
  );
};

export default Header;