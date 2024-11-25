import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './componentes/auth/Login';
import Register from './componentes/auth/Register';
import ProviderDashboard from './componentes/provider/ProviderDashboard';
import ClientDashboard from './componentes/client/ClientDashboard';
import Navigation from './componentes/layout/Navigation';
import ProviderDetail from './componentes/provider/ProviderDetail';
import Notifications from './componentes/layout/Notifications';
import AppointmentCalendar from './componentes/layout/AppointmentCalendar';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation(); // Hook para obtener la ubicación actual

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

  // Definir rutas donde no quieres mostrar el Navbar
  const hideNavbarRoutes = ['/login', '/register'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="app">
      {shouldShowNavbar && (
        <Navigation
          isAuthenticated={isAuthenticated}
          setAuth={setAuth}
          userRole={userRole}
        />
      )}
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ?
              <Login setAuth={setAuth} /> :
              <Navigate to={userRole === 'proveedor' ? '/provider/dashboard' : '/client/dashboard'} />
          }
        />

        <Route
          path="/register"
          element={
            !isAuthenticated ?
              <Register setAuth={setAuth} /> :
              <Navigate to={userRole === 'proveedor' ? '/provider/dashboard' : '/client/dashboard'} />
          }
        />
        <Route
          path="/profile/:profileId"
          element={<ProviderDetail />}
        />
        <Route
          path="/notifications"
          element={<Notifications />}
        />
        <Route path="/calendar" 
        element={<AppointmentCalendar />} />

        <Route
          path="/provider/dashboard"
          element={
            isAuthenticated && userRole === 'proveedor' ?
              <ProviderDashboard /> :
              <Navigate to="/login" />
          }
        />

        <Route
          path="/client/dashboard"
          element={
            isAuthenticated && userRole === 'cliente' ?
              <ClientDashboard /> :
              <Navigate to="/login" />
          }
        />

        <Route
          path="/"
          element={
            isAuthenticated ?
              <Navigate to={userRole === 'proveedor' ? '/provider/dashboard' : '/client/dashboard'} /> :
              <Navigate to="/login" />
          }
        />
      </Routes>
    </div>
  );
}

export default App;