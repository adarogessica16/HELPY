import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import { FaUserAlt, FaBriefcase } from 'react-icons/fa'; // Importamos los iconos

function Register({ setAuth }) {
  const navigate = useNavigate();
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
      const response = await fetch('http://localhost:5000/api/users/register', {
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
    <div className="auth-container">
      <div className="auth-card2">
        <h2>Registrate</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              placeholder="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Contraseña</label>
            <input
              type="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <div className="role-selection">
            <div className={`role-button ${formData.role === 'cliente' ? 'selected' : ''}`} onClick={() => handleRoleSelect('cliente')}>
              <FaUserAlt size={20} />
              {formData.role === 'cliente' && <span className="checkmark">✓</span>}
              <p className={formData.role === 'cliente' ? 'role-text-selected' : 'role-text'}>Cliente</p>
            </div>
            <div className={`role-button ${formData.role === 'proveedor' ? 'selected' : ''}`} onClick={() => handleRoleSelect('proveedor')}>
              <FaBriefcase size={20} />
              {formData.role === 'proveedor' && <span className="checkmark">✓</span>}
              <p className={formData.role === 'proveedor' ? 'role-text-selected' : 'role-text'}>Proveedor</p>
            </div>
          </div>
          <button type="submit" className="register-button">Registrarse</button>
        </form>
        <p className='newSesion'>
          ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

