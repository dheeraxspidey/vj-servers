import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false); // ✅ New state to show login message

  useEffect(() => {
    console.log("AuthContext: Checking for user token...");

    const storedToken = Cookies.get("token");
    const storedUser = Cookies.get("user");

    console.log("Stored Token:", storedToken);
    console.log("Stored User (Raw):", storedUser);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed User:", parsedUser);
        setUser(parsedUser);

        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Failed to parse user data from cookies:", error);
        Cookies.remove("user");
      }
    } else {
      console.log("AuthContext: No user found. Showing login message...");
      setNeedsLogin(true); // ✅ Instead of redirecting, show a message
    }

    setLoading(false);
  }, []);

  const logout = () => {
    console.log("AuthContext: Logging out user...");

    Cookies.remove("token");
    Cookies.remove("user");
    setToken(null);
    setUser(null);
    setNeedsLogin(true); // ✅ Show login message after logout
  };

  if (loading) return <div>Loading...</div>;

  if (needsLogin) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontSize: "18px" }}>
        <h2>🚀 Please login from SuperApp</h2>
        <p>Once logged in, refresh this page.</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
