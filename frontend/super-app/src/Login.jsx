import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const clientId = "YOUR_GOOGLE_CLIENT_ID"; // Replace with your Client ID

const Login = ({ onLoginSuccess }) => {
  const handleLoginSuccess = (response) => {
    console.log("Login Success:", response);
    const idToken = response.credential; // Get JWT Token from Google
    authenticateUser(idToken);
  };

  const handleLoginFailure = () => {
    console.log("Login Failed");
  };

  const authenticateUser = async (idToken) => {
    try {
      const res = await fetch("http://localhost:5000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem("userToken", data.token); // Store token for session
        onLoginSuccess(data.user); // Pass user data to parent component
      }
    } catch (error) {
      console.error("Authentication Error:", error);
    }
  };

  return (
    <div>
      <h2>Campus App Login</h2>
      <GoogleOAuthProvider clientId={clientId}>
        <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginFailure} />
      </GoogleOAuthProvider>
    </div>
  );
};

export default Login;
