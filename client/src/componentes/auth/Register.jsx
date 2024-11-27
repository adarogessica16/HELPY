import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import { FaUserAlt, FaBriefcase } from 'react-icons/fa'; // Importamos los iconos

function Register({ setAuth }) {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cliente'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseUrl}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (response.ok) {
        setAuth(data.token, data.role);
        // Redirigir basado en el rol
        if (data.role === 'proveedor') {
          navigate('/provider/dashboard');
        } else {
          navigate('/client/dashboard');
        }
      } else {
        setError(data.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error al registrarse:', error);
      setError('Error de conexión');
    }
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  return (
    <div className="register-auth-container">
      <div className="register-auth-card">
        <h2>Registrate</h2>
        {error && <div className="register-error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="register-form-group">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              placeholder="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="register-form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="register-form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <div className="register-role-selection">
            <div className={`register-role-button ${formData.role === 'cliente' ? 'selected' : ''}`} onClick={() => handleRoleSelect('cliente')}>
              <FaUserAlt size={20} />
              {formData.role === 'cliente' && <span className="register-checkmark">✓</span>}
              <p className={formData.role === 'cliente' ? 'register-role-text-selected' : 'register-role-text'}>Cliente</p>
            </div>
            <div className={`register-role-button ${formData.role === 'proveedor' ? 'selected' : ''}`} onClick={() => handleRoleSelect('proveedor')}>
              <FaBriefcase size={20} />
              {formData.role === 'proveedor' && <span className="register-checkmark">✓</span>}
              <p className={formData.role === 'proveedor' ? 'register-role-text-selected' : 'register-role-text'}>Proveedor</p>
            </div>
          </div>
          <button type="submit" className="register-submit-button">Registrarse</button>
        </form>
        <p className='register-new-sesion'>
          ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
