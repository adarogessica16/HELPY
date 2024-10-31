import { useState, useEffect } from 'react';
import ServiceList from './ServiceList';
import ServiceForm from './ServiceForm';
import './Provider.css';

function ProviderDashboard() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error al obtener servicios:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Panel de Proveedor</h2>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cerrar' : 'Agregar Servicio'}
        </button>
      </div>
      {showForm && (
        <ServiceForm
          onServiceAdded={() => {
            fetchServices();
            setShowForm(false);
          }}
        />
      )}
      <ServiceList services={services} onServiceUpdate={fetchServices} />
    </div>
  );
}

export default ProviderDashboard;
