import React, { useState, useEffect } from 'react';
import "./Client.css";
import '@fortawesome/fontawesome-free/css/all.min.css';


const ClientDashboard = () => {
    const [providers, setProviders] = useState([]); // Proveedores mostrados
    const [clientName, setClientName] = useState('');
    const [searchTag, setSearchTag] = useState(''); // Para el input del buscador
    const [randomTags, setRandomTags] = useState([]); // Tags aleatorios

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
        } catch (error) {
            console.error('Error al buscar proveedores:', error);
        }
    };

    // Buscar proveedores al hacer clic en un tag aleatorio
    const fetchProvidersByRandomTag = async (tag) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/random-tags?tag=${tag}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) throw new Error('Error al buscar proveedores por tag aleatorio');
            const data = await response.json();
            setProviders(data.providers || []);
        } catch (error) {
            console.error('Error al buscar proveedores por tag aleatorio:', error);
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
                    {/* Campo de búsqueda */}
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
                            onClick={() => fetchProvidersByRandomTag(tag)}
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
                        <div key={provider._id} className="provider-card">
                            <h3>{provider.name}</h3>
                            <p>{provider.description}</p>
                            <div className="tags">
                                {provider.tags.map((tag, index) => (
                                    <span key={index} className="badge bg-info me-1">
                                        {tag}
                                    </span>
                                ))}
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
