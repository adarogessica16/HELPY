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
        fetchAllProviders(); // Cargar todos los proveedores y sus servicios
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

    // Fetch todos los proveedores y sus servicios al inicio
    const fetchAllProviders = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users/all-providers', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) throw new Error('Error al obtener proveedores');
            const data = await response.json();
            setProviders(data || []);
            fetchProviderServices(data); // Cargar los servicios de todos los proveedores
        } catch (error) {
            console.error('Error al obtener proveedores:', error);
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

    const fetchProviderServices = async (providers) => {
        try {
            const servicesByProvider = {};
        
            for (const provider of providers) {
                console.log("Requesting services for provider ID:", provider._id); // Log para verificar el ID
                const response = await fetch(`http://localhost:5000/api/services/provider/${provider._id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (!response.ok) throw new Error(`Error al obtener servicios del proveedor ${provider.name}`);
        
                const services = await response.json();
                console.log(`Received services for provider ${provider._id}:`, services); // Log para verificar los servicios
        
                // Aquí se asegura que solo se guardan los primeros 2 servicios
                servicesByProvider[provider._id] = services.slice(0, 2); 
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
                                {/* Mostrar logo del proveedor */}
                                {provider.logo && (
                                    <img
                                    src={`http://localhost:5000/${provider.logo}`} // Ruta del logo del proveedor
                                    alt={`${provider.name} Logo`}
                                    className="provider-logo me-3"
                                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                    />
                                )} 
                                 <div className="rating-stars2">⭐⭐⭐⭐⭐</div>
                                <div>
                                    <h3 className="provider-name">{provider.name}</h3>
                                    <p className="provider-description">{provider.description}</p>
                                   
                                    <div className="provider-rating">
                                    {"⭐".repeat(provider.rating || 0)}
                                    </div>
                                
                                    <div className="provider-tags mt-3">
                                    {provider.tags.map((tag, index) => (
                                        <span key={index} className="badge bg-info me-1">
                                        {tag}
                                        </span>
                                    ))}
                                    </div>
                                </div>
                                </div>
                            </div>

                            {/* Columna derecha */}
                            <div className="provider-services col-6">
                                <ul className="service-list">
                                {providerServices[provider._id] &&
                                    providerServices[provider._id].map((service, index) => (
                                    <li key={index} className="service-item d-flex align-items-center">
                                        {service.images && service.images.length > 0 && (
                                        <img
                                            src={`http://localhost:5000/${service.images[0]}`} // Ruta de la imagen del servicio
                                            alt={service.title}
                                            className="service-image me-3"
                                            style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                        />
                                        )}
                                        <span className="service-title flex-grow-1">{service.title}</span>
                                        <span className="service-price">{service.price} Gs.</span>
                                    </li>
                                    ))}
                                </ul>
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
