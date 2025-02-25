import React, { useState, useContext } from "react";
import { AuthProvider } from "../../vj-react-demo-app/src/context/AuthContext"; // ✅ Use common SSO module
import { AuthContext } from "../../vj-react-demo-app/src/context/AuthContext";

const APPS = [
    { name: "App One", url: "http://localhost:5174/", icon: "📁" },
    { name: "App Two", url: "http://localhost:5175/", icon: "📊" },
    { name: "App Three", url: "http://localhost:5176/", icon: "⚙️" },
    { name: "SSO Login", url: "http://localhost:5173/", icon: "🔑" },
];

const SuperAppContent = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeApp, setActiveApp] = useState(null);


    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* Top Bar */}
            <header style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#007bff", color: "white" }}>
                <h2>SuperApp</h2>
                <div>
                    {user ? (
                        <>
                            <span>👤 {user}</span>
                            <button onClick={logout} style={{ marginLeft: "10px", background: "#ff4d4d", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}>Logout</button>
                        </>
                    ) : (

                        <a href={`http://localhost:5173/login?redirect=${encodeURIComponent(window.location.href)}`} 
                        style={{ color: "white", textDecoration: "none" }}>
                            Login
                        </a>

                    )}
                </div>
            </header>

            {/* Main Page with App Icons */}
            {activeApp === null ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px", padding: "20px", textAlign: "center" }}>
                    {APPS.map((app) => (
                        <div key={app.url} style={{ cursor: "pointer", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", background: "#f8f9fa" }} onClick={() => setActiveApp(app.url)}>
                            <div style={{ fontSize: "40px" }}>{app.icon}</div>
                            <p>{app.name}</p>
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