import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

const App = () => {
    const [user, setUser] = useState(null);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        // ✅ Load user from cookies
        const storedUser = Cookies.get("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // ✅ Show message for 3 seconds, then redirect to login
            setShowMessage(true);
            setTimeout(() => {
                window.location.href = "https://superapp.vnrzone.site/";
            }, 3000);
        }
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            {user ? (
                <>
                    <h1>Welcome to App Two</h1>
                    <img src={user.picture} alt="User Profile" width="80" style={{ borderRadius: "50%" }} />
                    <p>Email: {user.email}</p>
                    <p>Name: {user.name}</p>
                </>
            ) : showMessage ? (
                // ✅ Show message before redirecting
                <h2>🚀 Login required! Redirecting to SuperApp...</h2>
            ) : null}
        </div>
    );
};

export default App;
