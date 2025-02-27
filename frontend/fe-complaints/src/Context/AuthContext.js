import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, signInWithPopup, GithubAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import axios from "axios";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GithubAuthProvider();
provider.addScope("read:user");

// Create Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(localStorage.getItem("adminToken") ? { admin_id: "admin" } : null);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(localStorage.getItem("adminData") ? JSON.parse(localStorage.getItem("adminData")) : null); // Initialize with data from localStorage
  const baseUrl = process.env.REACT_APP_COMPLAINTS_APP_BE_URL;
  // Monitor auth state changes for GitHub users
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // GitHub Login
  const loginWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("GitHub Auth Error:", error);
    }
  };

  // Admin Login
  const loginAsAdmin = async (admin_id, password) => {
    try {
      const response = await axios.post(`${baseUrl}/admin-api/login`, {
        admin_id,
        password,
      });
      
      console.log(response);

      if (response.data.token) {
        setAdmin(response.data.adminData); // Store full admin details
        setAdminData(response.data.adminData); // Update the adminData state
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("adminData", JSON.stringify(response.data.adminData)); // Store admin details in localStorage
        return true;
      }

      return false;
    } catch (error) {
      console.error("Admin Login Error:", error);
      return false;
    }
  };

  // Logout (For Both User and Admin)
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
    setUser(null);
    setAdmin(null);
    setAdminData(null); // Clear adminData from state
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
  };

  return (
    <AuthContext.Provider value={{ user, admin, adminData, loginWithGithub, loginAsAdmin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
