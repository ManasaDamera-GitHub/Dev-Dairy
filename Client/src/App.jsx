import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/pages/Login';
import Signup from './Components/pages/Signup';
import Dashboard from './Components/pages/Dashboard';
import LogForm from './Components/pages/logForm';
import { useState } from 'react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Logout function to clear token and reset state
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // PrivateRoute to protect authenticated routes
  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={<Signup setToken={setToken} />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard handleLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <LogForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <PrivateRoute>
              <LogForm />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;