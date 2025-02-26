import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

const App = () => {
    const [user, setUser] = useState(null);
    const [isInIframe, setIsInIframe] = useState(window.self !== window.top);

    useEffect(() => {
        // ✅ Load user from cookies
        const storedUser = Cookies.get("user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));

            // ✅ Send a message to SuperApp to refresh iFrame
            if (isInIframe) {
                console.log("Notifying SuperApp to refresh iFrame...");
                window.parent.postMessage({ action: "refreshIframe" }, "*");
            } else {
                console.log("Refreshing full page...");
                window.location.reload(); // ✅ Refresh the entire page if opened directly
            }
        }
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            {user ? (
                <>
                    <h1>Welcome {user.name}, to App One</h1>
                    <img src={user.picture} alt="User Profile" width="80" style={{ borderRadius: "50%" }} />
                    <p>Email: {user.email}</p>
                    {isInIframe && <p>📌 You are viewing this inside SuperApp</p>}
                </>
            ) : isInIframe ? (
                <h2>🛑 Please log in from SuperApp</h2>
            ) : (
                <h2>🚀 Login required! Redirecting to SuperApp...</h2>
            )}
        </div>
    );
};

export default App;
