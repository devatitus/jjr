import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Single-user prototype route */}
        <Route path="/" element={<UserProfile />} />
        {/* Optional: QR link route if needed */}
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;

