import { useState, useEffect } from 'react';
import ServiceList from './ServiceList';
import ServiceForm from './ServiceForm';
import './Provider.css';

function ProviderDashboard() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState(null);
  const [providerName, setProviderName] = useState('');

  useEffect(() => {
    fetchServices();
    fetchProviderProfile();
  }, []);

  const fetchProviderProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Error al obtener perfil');
      }
      const data = await response.json();
      setProviderName(data.name);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services/my-services', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Error al obtener servicios');
      }
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      alert('Error al obtener servicios: ' + error.message);
    }
  };

  const handleServiceEdit = (service) => {
    setEditService(service);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditService(null);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="provider-info">
          <h2>Proveedor</h2>
          <p>{providerName}</p>
        </div>
        <button 
          onClick={() => { 
            setEditService(null);
            setShowForm(true);
          }}
          className="add-service-button"
        >
          Agregar Servicio
        </button>
      </div>
      
      {showForm && (
        <ServiceForm
          service={editService}
          onServiceAdded={() => {
            fetchServices();
            closeForm();
          }}
          onClose={closeForm} 
        />
      )} <p>Mis Servicios</p>
      <ServiceList services={services} onServiceUpdate={fetchServices} onServiceEdit={handleServiceEdit} />
    </div>
  );
}

export default ProviderDashboard;

