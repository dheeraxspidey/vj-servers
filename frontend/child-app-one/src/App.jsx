import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/check-login";  // ✅ Flask SSO API

const App = ({ appName }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(API_URL, { withCredentials: true })
            .then((response) => {
                if (response.data.logged_in) {
                    setUser(response.data.user);
                } else {
                    setUser(null); // Explicitly set user to null if not authenticated
                }
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            window.location.href = `http://localhost:5173/login?redirect=${window.location.href}`;  // ✅ Redirect to common login
        }
    }, [user, loading]);

    if (loading) return <p>Loading...</p>;

    return user ? (
        <div>
            <h1>Hello {user}, Welcome to {appName}</h1>
        </div>
    ) : null;  // ✅ Prevent rendering when user is null
};

export default App;
