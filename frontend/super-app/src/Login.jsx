import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const clientId = "522460567146-ubk3ojomopil8f68hl73jt1pj0jbbm68.apps.googleusercontent.com"; 

const Login = ({ onLoginSuccess }) => {
    const handleLoginSuccess = (response) => {
        console.log("Login Success:", response);
        const idToken = response.credential;
        authenticateUser(idToken);
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
                localStorage.setItem("userToken", data.token);
                localStorage.setItem("user", JSON.stringify(data.user)); // ✅ Store user in localStorage
                onLoginSuccess(data.user); // Update App.js state
            }
        } catch (error) {
            console.error("Authentication Error:", error);
        }
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div>
                <GoogleLogin onSuccess={handleLoginSuccess} onError={() => console.log("Login Failed")} />
            </div>
        </GoogleOAuthProvider>
    );
};

export default Login;
