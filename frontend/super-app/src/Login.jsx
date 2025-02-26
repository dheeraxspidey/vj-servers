import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const clientId = "522460567146-ubk3ojomopil8f68hl73jt1pj0jbbm68.apps.googleusercontent.com"; 

const Login = ({ onLoginSuccess }) => {
  const handleLoginSuccess = (response) => {
    console.log("Login Success:", response);
    const idToken = response.credential;
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
      console.log("User Authenticated:", data);
      localStorage.setItem("userToken", data.token);
      onLoginSuccess(data.user);
    } catch (error) {
      console.error("Authentication Error:", error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div>
        <h2>Campus App Login</h2>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginFailure}
          redirect_uri="http://superapp.vnrzone.site/auth/callback" // Ensure this matches Google Console
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
