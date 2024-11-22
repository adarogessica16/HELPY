import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function Login({ setAuth }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'proveedor', // Valor predeterminado
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      setAuth(data.token, data.role);  // Asegúrate de guardar el role en el estado

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
    <div className="auth-container">
     <h2>Iniciar Sesión</h2>
      <div className="auth-card">
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="ejemplo@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="abc123"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          
          <button type="submit" className="login-button">Iniciar Sesión</button>

        </form>
      </div>
    </div>
  );
}

export default Login;