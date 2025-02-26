import React, { useState, useEffect } from "react";
import Login from "./Login";
import SuperAppContent from "./SuperAppContent";

const App = () => {
  const [user, setUser] = useState(null);

  // ✅ Load user from localStorage when the app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Parse and set the user
    }
  }, []);

  return (
    <div>
      {!user ? (
        <Login onLoginSuccess={setUser} />
      ) : (
        <SuperAppContent user={user} />
      )}
    </div>
  ); 
};

export default App;
