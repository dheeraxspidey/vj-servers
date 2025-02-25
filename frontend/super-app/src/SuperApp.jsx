import React, { useState, useContext } from "react";
import { AuthProvider, AuthContext } from "../../vj-react-demo-app/src/context/AuthContext";

const APPS = [
    { name: "App One", url: "http://localhost:5174/", icon: "📁" },
    { name: "App Two", url: "http://localhost:5175/", icon: "📊" },
    { name: "App Three", url: "http://localhost:5176/", icon: "⚙️" },
    { name: "Calendar", url: "http://localhost:5174/", icon: "📅" },
    { name: "Chat", url: "http://localhost:5174/", icon: "💬" },
    { name: "Music", url: "http://localhost:5174/", icon: "🎵" },
    { name: "Video", url: "http://localhost:5175/", icon: "📹" },
    { name: "Notes", url: "http://localhost:5175/", icon: "📝" },
    { name: "Finance", url: "http://localhost:5175/", icon: "💰" },
    { name: "Shopping", url: "http://localhost:5175/", icon: "🛒" },
    { name: "Weather", url: "http://localhost:5175/", icon: "🌦️" },
    { name: "Maps", url: "http://localhost:5175/", icon: "🗺️" },
    { name: "Mail", url: "http://localhost:5176/", icon: "📧" },
    { name: "Health", url: "http://localhost:5176/", icon: "🏥" },
    { name: "Fitness", url: "http://localhost:5176/", icon: "🏋️" },
    { name: "News", url: "http://localhost:5176/", icon: "📰" }
];

const SuperAppContent = () => {
    const { user, logout, loading } = useContext(AuthContext);
    const [activeApp, setActiveApp] = useState(null);

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw" }}>
        <header style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#007bff", color: "white", width: "100%" }}>
            <h2>SuperApp</h2>
                <div>
                    {user ? (
                        <>
                            <span>👤 {user}</span>
                            <button
                                onClick={logout}
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
                        <a href={`http://localhost:5173/login?redirect=${encodeURIComponent(window.location.href)}`} style={{ color: "white", textDecoration: "none" }}>Login</a>
                    )}
                </div>
            </header>

            {activeApp === null ? (
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", 
                    gap: "15px", 
                    padding: "20px", 
                    textAlign: "center" 
                }}>
                    {APPS.map((app) => (
                        <div key={app.url} 
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
                                minWidth: "100px", 
                                minHeight: "100px" 
                            }} 
                            onClick={() => setActiveApp(app.url)}>
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

const SuperApp = () => {
    return (
        <AuthProvider>
            <SuperAppContent />
        </AuthProvider>
    );
};

export default SuperApp;
