import React, { useState, useEffect } from 'react';
import "./Client.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const ClientDashboard = () => {
    const [providers, setProviders] = useState([]); // Proveedores mostrados
    const [clientName, setClientName] = useState('');
    const [searchTag, setSearchTag] = useState(''); // Para el input del buscador
    const [randomTags, setRandomTags] = useState([]); // Tags aleatorios
    const [providerServices, setProviderServices] = useState({}); // Servicios de proveedores

    useEffect(() => {
        fetchClientProfile(); // Cargar perfil del cliente
        fetchRandomTags(); // Cargar tags aleatorios
    }, []);

    // Fetch perfil del cliente
    const fetchClientProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) throw new Error('Error al obtener perfil');
            const data = await response.json();
            setClientName(data.name);
        } catch (error) {
            console.error('Error al obtener perfil:', error);
        }
    };

    // Fetch tags aleatorios
    const fetchRandomTags = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users/random-tags', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) throw new Error('Error al obtener tags aleatorios');
            const data = await response.json();
            setRandomTags(data.randomTags || []);
        } catch (error) {
            console.error('Error al cargar tags aleatorios:', error);
        }
    };

    // Buscar proveedores por tags del input
    const fetchProvidersBySearchTag = async (tag) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/filter?tags=${tag}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) throw new Error('Error al buscar proveedores');
            const data = await response.json();
            setProviders(data || []);
            fetchProviderServices(data); // Fetch services for these providers
        } catch (error) {
            console.error('Error al buscar proveedores:', error);
        }
    };

    // Fetch servicios para cada proveedor
    const fetchProviderServices = async (providers) => {
        try {
            // Obtener los servicios de cada proveedor por separado
            const servicesByProvider = {};

            for (const provider of providers) {
                const response = await fetch(`http://localhost:5000/api/services/provider/${provider._id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (!response.ok) throw new Error(`Error al obtener servicios del proveedor ${provider.name}`);
                const services = await response.json();
                servicesByProvider[provider._id] = services.slice(0, 2); // Solo los primeros 2 servicios
            }

            setProviderServices(servicesByProvider);
        } catch (error) {
            console.error('Error al obtener los servicios de los proveedores:', error);
        }
    };

    return (
        <div className="container mt-4">
            {/* Input de búsqueda */}
            <div className="custom-card mb-2">
                <div className="custom-card-header">
                    <h3 className="custom-card-title">
                        Busca el servicio que necesites, <br /> encuentra al proveedor ideal
                    </h3>
                </div>
                <div className="custom-card-body position-relative">
                    <input
                        type="text"
                        placeholder="¿En qué te ayudamos hoy? Ej. Sistema de riego"
                        className="custom-card-input form-control"
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchTag.trim()) {
                                fetchProvidersBySearchTag(searchTag.trim());
                            }
                        }}
                    />
                    <button
                        className="search-icon-btn"
                        onClick={() => searchTag.trim() && fetchProvidersBySearchTag(searchTag.trim())}
                    >
                        <i className="fas fa-search"></i>
                    </button>

                    {/* Tags aleatorios */}
                    <div className="tags-container mt-5">
                        {randomTags.length > 0 ? (
                            randomTags.map((tag, index) => (
                                <button
                                    key={index}
                                    className="btn btn-secondary me-2 mb-2"
                                    onClick={() => fetchProvidersBySearchTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))
                        ) : (
                            <p>Cargando accesos rápidos...</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Lista de proveedores */}
            <div className="providers-list">
                {providers.length > 0 ? (
                    providers.map((provider) => (
                        <div key={provider._id} className="provider-card d-flex">
                            {/* Columna izquierda */}
                            <div className="provider-info col-6">
                                <div className="provider-header d-flex align-items-center">
                                    <i className="fas fa-briefcase provider-icon me-3"></i>
                                    <div>
                                        <h3 className="provider-name">{provider.name}</h3>
                                        <p className="provider-description">{provider.description}</p>
                                        <div className="provider-rating">
                                            {"⭐".repeat(provider.rating || 0)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Columna derecha */}
                            <div className="provider-services col-6">
                                <ul className="service-list">
                                    {/* Mostrar los primeros 2 servicios */}
                                    {providerServices[provider._id] &&
                                        providerServices[provider._id].map((service, index) => (
                                            <li key={index} className="service-item d-flex align-items-center">
                                                <i className="fas fa-cogs service-icon me-2"></i>
                                                <span className="service-title flex-grow-1">{service.title}</span>
                                                <span className="service-price">{service.price} Gs.</span>
                                            </li>
                                        ))}
                                </ul>
                                <div className="tags mt-3">
                                    {provider.tags.map((tag, index) => (
                                        <span key={index} className="badge bg-info me-1">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No se encontraron proveedores.</p>
                )}
            </div>
        </div>
    );
};

export default ClientDashboard;



