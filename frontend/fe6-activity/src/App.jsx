import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard, ResumeBuilder, Login, Signup, Integrations } from './pages';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';
import { useState, useEffect } from 'react';

console.log('App component rendering');

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  console.log("App.jsx - Initial isAuthenticated state:", isAuthenticated);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const newAuthStatus = !!token;
      console.log("App.jsx - storage event - token:", token, "newAuthStatus:", newAuthStatus);
      setIsAuthenticated(newAuthStatus);
    };

    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  useEffect(() => {
    console.log("App.jsx - isAuthenticated state changed:", isAuthenticated);
  }, [isAuthenticated]);

  const logout = () => { // Simplified logout - no useNavigate for now
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    window.location.href = '/login'; // Temporary redirect using window.location
    console.log("App.jsx - Logout function called - isAuthenticated set to false (window.location)");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard logout={logout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
          />
          <Route
            path="/resume-builder"
            element={isAuthenticated ? <ResumeBuilder /> : <Navigate to="/login" />}
          />
          <Route
            path="/integrations"
            element={isAuthenticated ? <Integrations /> : <Navigate to="/login" />}
          />
         

          {/* Catch all route */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 