import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Login from "./Login"; // ✅ Import Login component

const APPS = [
    { name: "App One", url: "https://app1.vnrzone.site/", icon: "📁" },
    { name: "App Two", url: "https://app2.vnrzone.site/", icon: "📊" },
    { name: "App Three", url: "https://app1.vnrzone.site/", icon: "📊" },
];

const SuperAppContent = () => {
    const [user, setUser] = useState(null);
    const [activeApp, setActiveApp] = useState(null);
    const [showLogin, setShowLogin] = useState(false); // ✅ Track if login button was clicked

    useEffect(() => {
        // ✅ Load user from cookies instead of forcing login
        const storedUser = Cookies.get("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        Cookies.remove("userToken", { domain: ".vnrzone.site" });
        Cookies.remove("user", { domain: ".vnrzone.site" });
        setUser(null); // ✅ Clear user state
        window.location.reload();
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden" }}>
            {/* ✅ Header Section */}
            <header style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#007bff", color: "white", width: "100%", boxSizing: "border-box" }}>
            <h2 
                onClick={() => window.location.reload()} 
                style={{ cursor: "pointer" }}
            >
                SuperApp
            </h2>

                <div>
                    {user ? (
                        <>
                            <span>👤 {user.name}</span>
                            <button
                                onClick={handleLogout}
                                style={{
                                    marginLeft: "10px",
                                    background: "#ff4d4d",
                                    color: "white",
                                    border: "none",
                                    padding: "5px 10px",
                                    cursor: "pointer",
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Login onLoginSuccess={setUser} /> // ✅ Show Google Login Popup
                    )}
                </div>
            </header>

            {/* ✅ App Selection Grid / Embedded App View */}
            {activeApp === null ? (
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", 
                    gap: "20px", 
                    padding: "20px", 
                    textAlign: "center", 
                    width: "100vw", 
                    maxWidth: "100%", 
                    margin: "0 auto",
                    boxSizing: "border-box"
                }}>
                    {APPS.map((app) => (
                        <div 
                            key={app.url} 
                            role="button" 
                            tabIndex="0" 
                            onClick={() => setActiveApp(app.url)}
                            onKeyPress={(e) => e.key === "Enter" && setActiveApp(app.url)}
                            style={{ 
                                cursor: "pointer", 
                                padding: "20px", 
                                border: "1px solid #ccc", 
                                borderRadius: "10px", 
                                background: "#f8f9fa",
                                display: "flex", 
                                flexDirection: "column", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                minWidth: "120px", 
                                minHeight: "120px", 
                                width: "100%",
                                boxSizing: "border-box"
                            }} 
                        >
                            <div style={{ fontSize: "40px" }}>{app.icon}</div>
                            <p style={{ fontSize: "14px", marginTop: "10px" }}>{app.name}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <iframe
                    src={activeApp}
                    title="Embedded App"
                    width="100%"
                    height="100%"
                    style={{ border: "none", flexGrow: 1 }}
                />
            )}
        </div>
    );
};

export default SuperAppContent;
