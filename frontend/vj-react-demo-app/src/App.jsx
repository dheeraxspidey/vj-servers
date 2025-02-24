import { Routes, Route } from "react-router-dom";
import ProtectedPage from "./ProtectedPage";
import Login from "./Login";

function App() {
    return (
        <Routes>
            <Route path="/" element={<ProtectedPage />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    );
}

export default App;
