import { useNavigate, Link } from 'react-router-dom';
import './Navigation.css';

function Navigation({ isAuthenticated, setAuth }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth(null);
    navigate('/login');
  };

  return (
    <nav className="nav-container">
      <div className="nav-brand">
        <Link to="/">HelPy</Link>
      </div>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <Link to="/provider/dashboard">Dashboard</Link>
            <button className="nav-button" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar Sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navigation;