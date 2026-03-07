import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Scholarships from './pages/Scholarships';
import AdminAddScholarship from "./pages/AdminAddScholarship";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Benefits from "./pages/Benefits";
import AdminAddBenefit from "./pages/AdminAddBenefit";


// Protected Route Component
const ProtectedRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  

  return (
    <div className="App min-h-screen bg-gray-50">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute user={user}>
                <Documents user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scholarships"
            element={
              <ProtectedRoute user={user}>
                <Scholarships user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
  path="/benefits"
  element={
    <ProtectedRoute user={user}>
      <Benefits user={user} onLogout={handleLogout} />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/add-benefit"
  element={<AdminAddBenefit />}
/>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/admin/add-scholarship" element={<AdminAddScholarship />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
