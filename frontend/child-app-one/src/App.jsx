import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

const App = () => {
    const [user, setUser] = useState(null);
    const appName = "App One"; // Change this for app2, app3

    useEffect(() => {
        // ✅ Load user from cookies
        const storedUser = Cookies.get("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // ✅ Redirect to Google OAuth Login if user is not found
            window.location.href = `https://superapp.vnrzone.site/auth/google`;
        }
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            {user ? (
                <>
                    <h1>Welcome to {appName}</h1>
                    <h3> User details available for you</h3>
                    <img src={user.picture} alt="User Profile" width="80" style={{ borderRadius: "50%" }} />
                    <p>Email: {user.email}</p>
                    <p>Email: {user.name}</p>
                </>
            ) : (
                <h1>Loading...</h1>
            )}
        </div>
    );
};

export default App;
