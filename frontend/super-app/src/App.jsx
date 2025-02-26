import React, { useState } from "react";
import Login from "./Login";
import SuperAppContent from "./SuperAppContent";

const App = () => {
  const [user, setUser] = useState(null);

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
