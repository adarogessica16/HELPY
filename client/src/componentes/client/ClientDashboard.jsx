import React, { useState, useEffect } from 'react';
import ServiceList from '../services/ServiceList';

const ClientDashboard = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [clientName, setClientName] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        search: ''
    });

    useEffect(() => {
        fetchServices();
        fetchClientProfile();
    }, []);

    const fetchClientProfile = async () => {
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
            setClientName(data.name);
        } catch (error) {
            console.error('Error al obtener perfil:', error);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/services', {
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
            setError('Error al cargar los servicios: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = services.filter(service => {
        const matchesCategory = !filters.category || service.category === filters.category;
        const matchesSearch = !filters.search ||
            service.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            service.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            (service.provider && service.provider.name.toLowerCase().includes(filters.search.toLowerCase()));

        return matchesCategory && matchesSearch;
    });

    const handleContactProvider = async (serviceId) => {
        console.log('Contactando al proveedor del servicio:', serviceId);
    };

    return (
        <div className="container mt-4">
            <div className="card mb-4">
                <div className="card-header">
                    <h1 className="h4">Bienvenido, {clientName}</h1>
                </div>
                <div className="card-body">
                    <div className="d-flex justify-content-between mb-3">
                        <input
                            type="text"
                            placeholder="Buscar servicios..."
                            className="form-control me-2"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                        <select
                            className="form-select"
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        >
                            <option value="">Todas las categorías</option>
                            <option value="limpieza">Limpieza</option>
                            <option value="jardineria">Jardinería</option>
                            <option value="reparacion">Reparación</option>
                            <option value="mantenimiento">Mantenimiento</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-4">Cargando servicios...</div>
            ) : error ? (
                <div className="text-danger text-center py-4">{error}</div>
            ) : filteredServices.length === 0 ? (
                <div className="text-center py-4">No se encontraron servicios que coincidan con tu búsqueda.</div>
            ) : (
                <ServiceList
                    services={filteredServices}
                    userType="client"
                    onContactProvider={handleContactProvider}
                />
            )}
        </div>
    );
};

export default ClientDashboard;

