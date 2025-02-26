import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const clientId = "522460567146-ubk3ojomopil8f68hl73jt1pj0jbbm68.apps.googleusercontent.com"; 

const Login = ({ onLoginSuccess }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Load stored user from local storage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLoginSuccess = (response) => {
        console.log("Login Success:", response);
        const idToken = response.credential; // JWT Token from Google
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
                localStorage.setItem("user", JSON.stringify(data.user)); // Store user data
                setUser(data.user); // Update local state
                onLoginSuccess(data.user); // Pass to parent
            }
        } catch (error) {
            console.error("Authentication Error:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div>
                {user ? (
                    <div>
                        <p>Welcome, {user.name}</p>
                        <img src={user.picture} alt="Profile" width="50" />
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                ) : (
                    <GoogleLogin onSuccess={handleLoginSuccess} onError={() => console.log("Login Failed")} />
                )}
            </div>
        </GoogleOAuthProvider>
    );
};

export default Login;
