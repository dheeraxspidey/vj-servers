import React, { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard"; // Create a dashboard component

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <div>
      {!user ? (
        <Login onLoginSuccess={setUser} />
      ) : (
        <Dashboard user={user} />
      )}
    </div>
  ); 
};

export default App;
