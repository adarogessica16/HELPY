      { /* */}
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './componentes/auth/Login';
import Register from './componentes/auth/Register';
import ProviderDashboard from './componentes/provider/ProviderDashboard';
import ClientDashboard from './componentes/client/ClientDashboard';
import Navigation from './componentes/layout/Navigation';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Verificar autenticación al cargar
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  const setAuth = (token, role) => {
    if (token && role) {
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      setIsAuthenticated(true);
      setUserRole(role);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      setIsAuthenticated(false);
      setUserRole(null);
    }
  };

  return (
    <Router>
      <div className="app">
        <Navigation isAuthenticated={isAuthenticated} setAuth={setAuth} userRole={userRole} />
        <Routes>
          <Route path="/login" element={
            !isAuthenticated ? 
            <Login setAuth={setAuth} /> : 
            <Navigate to={userRole === 'proveedor' ? '/provider/dashboard' : '/client/dashboard'} />
          } />
          <Route path="/register" element={
            !isAuthenticated ? 
            <Register setAuth={setAuth} /> : 
            <Navigate to={userRole === 'proveedor' ? '/provider/dashboard' : '/client/dashboard'} />
          } />
          <Route path="/provider/dashboard" element={
            isAuthenticated && userRole === 'proveedor' ? 
            <ProviderDashboard /> : 
            <Navigate to="/login" />
          } />
          <Route path="/client/dashboard" element={
            isAuthenticated && userRole === 'cliente' ? 
            <ClientDashboard /> : 
            <Navigate to="/login" />
          } />
          <Route path="/" element={
            isAuthenticated ? 
            <Navigate to={userRole === 'proveedor' ? '/provider/dashboard' : '/client/dashboard'} /> : 
            <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;