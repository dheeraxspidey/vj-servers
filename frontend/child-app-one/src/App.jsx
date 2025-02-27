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
        } else {

            // ✅ Show message for 5 seconds, then redirect to login
            if (!isInIframe) {
                console.log("Refreshing full page...");
                setTimeout(() => {
                    window.location.href = "https://superapp.vnrzone.site/";
                }, 10000);                
            }            
        }
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            {user ? (
                <>
                    <h1>Welcome to App One</h1>
                    <img src={user.picture} alt="User Profile" width="80" style={{ borderRadius: "50%" }} />
                    <p>Email: {user.email}</p>
                    <p>Name: {user.name}</p>
                </>
            ) :
            (isInIframe ? 
                (<div><h2>🛑 Please Sign in from SuperApp</h2><h3> then click on the 'SuperApp' to reload</h3></div>)
                : (<div><h2>🚀 Login required! Please Signin from SuperApp and come back...</h2> <h3> Redirecting you to Super app </h3></div>)
            )}
        </div>
    );
};

export default App;

