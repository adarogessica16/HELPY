import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ProviderDetail() {
    const { profileId } = useParams(); // Obtiene el ID del perfil de la URL
    const [profileData, setProfileData] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfileData();
        fetchProviderServices();
    }, [profileId]);

    const fetchProfileData = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/users/profile/${profileId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Error al obtener el perfil");
            }

            const data = await response.json();
            setProfileData(data);
        } catch (error) {
            console.error("Error al obtener perfil:", error);
        }
    };

    const fetchProviderServices = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/services/provider/${profileId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Error al obtener servicios");
            }

            const data = await response.json();
            setServices(data);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener servicios:", error);
        }
    };

    const handleBookService = (serviceId) => {
        // Lógica para agendar el servicio
        alert(`Servicio ${serviceId} agendado exitosamente!`);
    };

    return (
        <div className="profile-detail-container">
            {loading ? (
                <p>Cargando perfil y servicios...</p>
            ) : (
                <>
                    {profileData ? (
                        <div className="profile-info-card">
                            <div className="left-section">
                                <h3 className="profile-name">{profileData.name}</h3>
                                <p className="profile-description">{profileData.description}</p>
                                <div className="tags">
                                    {profileData.tags &&
                                        profileData.tags.map((tag, index) => (
                                            <span key={index} className="tag">
                                                {tag}
                                            </span>
                                        ))}
                                </div>
                            </div>
                            <div className="right-section">
                                {profileData.logo && (
                                    <img
                                        src={`http://localhost:5000${profileData.logo}`}
                                        alt="Logo"
                                        className="profile-logo"
                                    />
                                )}
                                <div className="rating-stars">⭐⭐⭐⭐⭐</div>
                            </div>
                        </div>
                    ) : (
                        <p>Perfil no encontrado</p>
                    )}

                    <div className="services-section">
                        <h4>Servicios del Proveedor</h4>
                        {services.length > 0 ? (
                            services.map((service) => (
                                <div key={service._id} className="service-card">
                                    <h5>{service.title}</h5>
                                    <p>{service.description}</p>
                                    <p>Precio: ${service.price}</p>
                                    <button onClick={() => handleBookService(service._id)}>
                                        Agendar
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No hay servicios disponibles.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default ProviderDetail;
