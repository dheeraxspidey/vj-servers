import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "../../vj-react-demo-app/src/context/AuthContext"; // ✅ Use common SSO module

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <App appName="App Three" />
        </AuthProvider>
    </React.StrictMode>
);
