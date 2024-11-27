import { useNavigate, Link } from 'react-router-dom';
import { FaCalendarAlt, FaSignOutAlt, FaBell } from 'react-icons/fa';
import './Navigation.css';

function Navigation({ isAuthenticated, setAuth, notifications, userRole }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth(null);
    navigate('/');
  };

  return (
    <nav className="nav-container">
      <div className="nav-brand">
        <h3>
          {/* Si el usuario está autenticado, redirigir al dashboard correspondiente */}
          <Link to={isAuthenticated ? (userRole === 'proveedor' ? '/provider/dashboard' : '/client/dashboard') : '/'} style={{ color: 'white' }}>
            HelPy
          </Link>

          {/* Si el rol no es 'cliente', mostrar el calendario */}
          {isAuthenticated && userRole === 'proveedor' && (
            <Link to="/calendar" style={{ marginLeft: '25px', color: 'white' }}>
              <FaCalendarAlt size={25} />
            </Link>
          )}
        </h3>
      </div>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            {/* Mostrar campana de notificaciones solo si no es un cliente */}
            {userRole !== 'cliente' && (
              <Link to="/notifications" className="notification-bell">
                <FaBell size={25} color="white" />
                {notifications > 0 && (
                  <span className="notification-count">{notifications}</span>
                )}
              </Link>
            )}

            {/* Botón de logout */}
            <button
              className="nav-button"
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <FaSignOutAlt size={25} color="white" />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white' }}>Iniciar Sesión</Link>
            <Link to="/register" style={{ color: 'white' }}>Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navigation;


