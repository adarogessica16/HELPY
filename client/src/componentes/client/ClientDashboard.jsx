import React, { useState, useEffect } from 'react';
import "./Client.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
    const [providers, setProviders] = useState([]); 
    const [clientName, setClientName] = useState('');
    const [searchTag, setSearchTag] = useState(''); 
    const [randomTags, setRandomTags] = useState([]); 
    const [providerServices, setProviderServices] = useState({}); 
    const [filterHistory, setFilterHistory] = useState([]); 
    const navigate = useNavigate(); 

    useEffect(() => {
        fetchClientProfile(); 
        fetchRandomTags(); 
        fetchAllProviders(); 
    }, []);

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

    const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

    const fetchRandomTags = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users/random-tags', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) throw new Error('Error al obtener tags aleatorios');
            const data = await response.json();

            const uniqueTags = Array.from(
                new Set((data.randomTags || []).map((tag) => capitalize(tag.trim().toLowerCase())))
            );

            setRandomTags(uniqueTags);
        } catch (error) {
            console.error('Error al cargar tags aleatorios:', error);
        }
    };

    const fetchAllProviders = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users/all-providers', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) throw new Error('Error al obtener proveedores');
            const data = await response.json();
            setProviders(data || []);
            fetchProviderServices(data); 
        } catch (error) {
            console.error('Error al obtener proveedores:', error);
        }
    };

    const fetchProvidersBySearchTag = async (tag) => {
        try {
            setFilterHistory((prev) => [...prev, { providers, tag: searchTag }]); 

            const response = await fetch(`http://localhost:5000/api/users/filter?tags=${tag}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) throw new Error('Error al buscar proveedores');
            const data = await response.json();
            setProviders(data || []);
            fetchProviderServices(data); 
        } catch (error) {
            console.error('Error al buscar proveedores:', error);
        }
    };

    const fetchProviderServices = async (providers) => {
        try {
            const servicesByProvider = {};

            for (const provider of providers) {
                const response = await fetch(`http://localhost:5000/api/services/provider/${provider._id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (!response.ok) throw new Error(`Error al obtener servicios del proveedor ${provider.name}`);

                const services = await response.json();
                servicesByProvider[provider._id] = services.slice(0, 2); 
            }

            setProviderServices(servicesByProvider);
        } catch (error) {
            console.error('Error al obtener los servicios de los proveedores:', error);
        }
    };

    const handleGoBack = () => {
        fetchAllProviders();
        setFilterHistory([]);
    };

    // Función para mostrar las estrellas según el rating
    const renderStars = (rating) => {
        const filledStars = Math.round(rating); // Número de estrellas llenas
        const totalStars = 5; // Número total de estrellas
        let stars = '';

        // Agregar estrellas llenas (⭐)
        for (let i = 0; i < filledStars; i++) {
            stars += '⭐';
        }

        // Agregar estrellas vacías (☆)
        for (let i = filledStars; i < totalStars; i++) {
            stars += '☆';
        }

        // Agregar el número de estrellas (por ejemplo, "4/5")
        stars += ` (${filledStars}/${totalStars})`;

        return stars;
    };

    return (
        <div className="container mt-4">
            <div className="custom-cardC mb-2">
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
            {filterHistory.length > 0 && (
                <button
                    className="btn btn-secondary mt-2"
                    onClick={handleGoBack}
                >
                    <i className="fas fa-arrow-left me-1"></i> Volver al inicio
                </button>
            )}

            <div className="providers-list">
                {providers.length > 0 ? (
                    providers.map((provider) => (
                        <div key={provider._id} className="provider-cardC d-flex">
                            <div className="provider-info col-6">
                                <div className="provider-header d-flex align-items-center">
                                    {provider.logo && (
                                        <img
                                            src={`http://localhost:5000${provider.logo}`}
                                            alt={`${provider.name} Logo`}
                                            className="provider-logo me-2"
                                            style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                        />
                                    )}
                                    <div className="provider-rating">
                                        {renderStars(provider.rating)}  
                                    </div>
                                    <div>
                                        <h3 className="provider-name">{provider.name}</h3>
                                        <p className="provider-description">{provider.description}</p>
                                        <div className="provider-tagsC mt-3">
                                            {provider.tags.map((tag, index) => (
                                                <span key={index} className="badge bg-info me-1">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="provider-services col-6">
                                <ul className="service-list">
                                    {providerServices[provider._id] &&
                                        providerServices[provider._id].map((service, index) => (
                                            <li key={index} className="service-item d-flex align-items-center">
                                                {service.images && service.images.length > 0 && (
                                                    <img
                                                        src={`http://localhost:5000/${service.images[0]}`}
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
                                <button
                                className="btn btn-warning ver-mas-btnC"
                                onClick={() => navigate(`/profile/${provider._id}`)}
                            >
                                Ver más
                            </button>
                            </div>

                            
                        </div>
                    ))
                ) : (
                    <p>No hay proveedores disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default ClientDashboard;
