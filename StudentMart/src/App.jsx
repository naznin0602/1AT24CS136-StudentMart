
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";

import Login from "./components/Login.jsx";
import Logout from "./components/Logout.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Profile from "./components/Profile.jsx";
import Edit from "./components/Edit.jsx";
import "./App.css";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);

  function handleLogin(data) {
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  }

  function updateUser(updatedUser) {
    setUser(updatedUser);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
        />

        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
        />

        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        <Route
          path="/logout"
          element={token ? <Logout onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/dashboard"
          element={
            token ? (
              <Dashboard token={token} user={user} onLogout={handleLogout} />
            ) : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/profile"
          element={
            token ? (
              <Profile token={token} user={user} onUserUpdate={updateUser} />
            ) : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/edit"
          element={
            token ? (
              <Edit token={token} user={user} onUserUpdate={updateUser} />
            ) : <Navigate to="/login" replace />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
