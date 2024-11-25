import { useNavigate, Link } from 'react-router-dom';
import { FaCalendarAlt, FaSignOutAlt, FaBell } from 'react-icons/fa';  
import './Navigation.css';

function Navigation({ isAuthenticated, setAuth, notifications, userRole }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth(null);
    navigate('/login');
  };

  return (
    <nav className="nav-container">
      <div className="nav-brand">
        <h3>
          HelPy
          {userRole !== 'cliente' && (
            <Link to="/calendar" style={{ marginLeft: '25px', color: 'white' }}>
              <FaCalendarAlt size={25} />
            </Link>
          )}
        </h3>
      </div>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            {userRole !== 'cliente' && (
              <Link to="/notifications" className="notification-bell">
                <FaBell size={25} color="white" />
                {notifications > 0 && (
                  <span className="notification-count">{notifications}</span>
                )}
              </Link>
            )}
        
            <button className="nav-button" onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <FaSignOutAlt size={25} color="white" />
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
