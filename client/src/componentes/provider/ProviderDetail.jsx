import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import "./ProviderDetail.css";

function ProviderDetail() {
    const { profileId } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [providerRating, setProviderRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [ratingSubmitting, setRatingSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado del modal de valoración
    const [successMessage, setSuccessMessage] = useState(""); // Mensaje de éxito
    const [showModal, setShowModal] = useState(false); // Control del modal de agendamiento
    const [selectedService, setSelectedService] = useState(null); // Servicio seleccionado para agendar
    const [appointmentData, setAppointmentData] = useState({
        date: '',
        notes: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            setProviderRating(data.rating || 0);
            setUserRating(data.userRating || 0);
        } catch (error) {
            console.error("Error al obtener perfil:", error);
        }
    };

    const fetchProviderServices = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/services/providers/${profileId}`,
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

    const handleRatingChange = async (rating) => {
        try {
            if (ratingSubmitting) return;
            setRatingSubmitting(true);
            setSuccessMessage(""); // Reiniciar mensaje de éxito

            const response = await fetch(
                `http://localhost:5000/api/users/${profileId}/rate`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ rating }),
                }
            );

            if (!response.ok) {
                throw new Error("Error al enviar la valoración");
            }

            const data = await response.json();
            setProviderRating(data.rating);
            setUserRating(rating);
            setSuccessMessage("Valoración enviada con éxito");
        } catch (error) {
            console.error("Error al enviar la valoración:", error);
            setSuccessMessage("Error al enviar la valoración. Por favor, intente nuevamente.");
        } finally {
            setRatingSubmitting(false);
        }
    };

    const RatingStars = ({ onRate }) => (
        <div className="rating-stars2">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`star ${star <= userRating ? "filled" : ""}`}
                    onClick={() => !ratingSubmitting && onRate(star)}
                    style={{
                        cursor: ratingSubmitting ? "not-allowed" : "pointer",
                        opacity: ratingSubmitting ? 0.7 : 1,
                    }}
                >
                    ⭐
                </span>
            ))}
        </div>
    );

    const ModalRating = ({ isOpen, onClose, onRate }) => (
        isOpen && (
            <div className="modal-overlay">
                <div className="modal-content2">
                    <h4>Valorar al proveedor</h4>
                    {successMessage ? (
                        <p className="success-message">{successMessage}</p>
                    ) : (
                        <RatingStars onRate={onRate} />
                    )}
                    <button
                        onClick={() => {
                            setSuccessMessage(""); // Reiniciar mensaje
                            onClose();
                        }}
                        className="close-modal-button"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        )
    );

    const handleBookService = (service) => {
        setSelectedService(service);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedService(null);
        setAppointmentData({ date: '', notes: '' });
    };

    const handleChange = (e) => {
        setAppointmentData({
            ...appointmentData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmitAppointment = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:5000/api/appointments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    serviceId: selectedService._id,
                    date: appointmentData.date,
                    notes: appointmentData.notes,
                }),
            });

            if (!response.ok) throw new Error("Error al agendar la cita");

            alert("Cita agendada exitosamente.");
            setShowModal(false);
        } catch (error) {
            console.error("Error al agendar la cita:", error);
            setError("Hubo un problema al agendar la cita.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="profile-detail-container">
            {loading ? (
                <p>Cargando perfil y servicios...</p>
            ) : (
                <>
                    {profileData ? (
                        <div className="profile-info-card2">
                            <div className="left-section2">
                                {profileData.logo && (
                                    <img
                                        src={`http://localhost:5000${profileData.logo}`}
                                        alt="Logo"
                                        className="profile-logo2"
                                    />
                                )}
                            </div>
                            <div className="right-section2">
                                <h3 className="profile-name">{profileData.name}</h3>
                                <p className="profile-description">{profileData.description}</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="rate-button"
                                >
                                    Valorar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p>Perfil no encontrado</p>
                    )}

                    <ModalRating
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onRate={(rating) => handleRatingChange(rating)}
                    />

                    <div className="services-section2">
                        {services.length > 0 ? (
                            services.map((service) => (
                                <div key={service._id} className="service-card2">
                                    <h5>{service.title}</h5>
                                    <p>{service.description}</p>
                                    <p className="price-Detail">{service.price} Gs</p>
                                    {service.images && service.images.length > 0 && service.images.map((img, index) => (
                                        <img
                                            key={index}
                                            src={`http://localhost:5000/${img}`}
                                            alt={service.title}
                                            className="service-image me-3"
                                            style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                        />
                                    ))}
                                    <button
                                        className="btn btn-warning"
                                        onClick={() => handleBookService(service)}
                                    >
                                        Agendar
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No hay servicios disponibles.</p>
                        )}
                    </div>

                    {showModal && selectedService && (
                        <Modal show={showModal} onHide={handleCloseModal} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Agendar Servicio: {selectedService.title}</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                <Form onSubmit={handleSubmitAppointment}>
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    <Form.Group controlId="date">
                                        <Form.Label>Fecha</Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            name="date"
                                            value={appointmentData.date}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="notes">
                                        <Form.Label>Notas</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="notes"
                                            value={appointmentData.notes}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Agendando..." : "Agendar Cita"}
                                    </Button>
                                </Form>
                            </Modal.Body>
                        </Modal>
                    )}
                </>
            )}
        </div>
    );
}

export default ProviderDetail;
