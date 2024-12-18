import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ setAuth }) {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'proveedor', // Valor predeterminado
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseUrl}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setAuth(data.token, data.role);

        // Redirige al dashboard según el rol
        if (formData.role === 'proveedor') {
          navigate('/provider/dashboard');
        } else if (formData.role === 'cliente') {
          navigate('/client/dashboard');
        }
      } else {
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error de conexión');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className='login-title'>Inicia Sesión</h2>
        <p>
          O{' '}
          <span
            className="login-create-account-link"
            onClick={() => navigate('/register')}
          >
            Crea una cuenta
          </span>
        </p>
        {error && <div className="login-error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="login-email"
              placeholder="ejemplo@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="login-form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="login-password"
              placeholder="abc123"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="login-submit-button">Ingresar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
