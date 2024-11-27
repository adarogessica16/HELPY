import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ProviderDetail.css";

function ProviderDetail() {
    const { profileId } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [providerRating, setProviderRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [ratingSubmitting, setRatingSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [appointmentData, setAppointmentData] = useState({
        date: "",
        notes: "",
    });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        fetchProfileData();
        fetchProviderServices();
    }, [profileId]);

    const fetchProfileData = async () => {
        try {
            const response = await fetch(
                `${baseUrl}/api/users/profile/${profileId}`,
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
                `${baseUrl}/api/services/providers/${profileId}`,
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

    const handleBookService = (service) => {
        setSelectedService(service);
        setAppointmentData({ date: "", notes: "" }); // Limpia los datos
        setShowModal(true);
    };


    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedService(null); // Limpia el servicio seleccionado
        setAppointmentData({ date: "", notes: "" }); // Reinicia los datos de la cita
    };

    const handleChange = (e) => {
        setAppointmentData({
            ...appointmentData,
            [e.target.name]: e.target.value,
        });
    };
    const handleClose = () => {
        setIsModalOpen(false);  // Esto cerrará el modal
    };


    const handleSubmitAppointment = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${baseUrl}/api/appointments`, {
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

            toast.success("¡Cita agendada exitosamente!", {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: "#FFFFFF",
                    color: "#000000",
                    fontWeight: "bold",
                },
            });

            handleCloseModal(); // Cerrar el modal
        } catch (error) {
            console.error("Error al agendar la cita:", error);
            toast.error("Hubo un problema al agendar la cita.", {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: "#FFFFFF",
                    color: "#000000",
                    fontWeight: "bold",
                },
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleRatingChange = async (rating) => {
        try {
            if (ratingSubmitting) return;
            setRatingSubmitting(true);

            const response = await fetch(
                `${baseUrl}/api/users/${profileId}/rate`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ rating }),
                }
            );

            if (!response.ok) throw new Error("Error al enviar la valoración");

            const data = await response.json();
            setProviderRating(data.rating);
            setUserRating(rating);

            toast.success("¡Valoración enviada exitosamente!", {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: "#FFFFFF",
                    color: "#000000",
                    fontWeight: "bold",
                },
            });

            setIsModalOpen(false); // Cerrar el modal después de enviar la valoración
        } catch (error) {
            console.error("Error al enviar la valoración:", error);
            toast.error("Error al enviar la valoración. Por favor, intente nuevamente.", {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: "#FFFFFF",
                    color: "#000000",
                    fontWeight: "bold",
                },
            });
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


    return (
        <div className="profile-detail-container">
            {loading ? (
                <p>Cargando perfil y servicios...</p>
            ) : (
                <>
                    {profileData && (
                        <div className="profile-info-card2">
                            <div className="left-section2">
                                {profileData.logo && (
                                    <img
                                        src={profileData.logo}
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
                    )}

                    {isModalOpen && (
                        <Modal show={isModalOpen} onHide={handleClose} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Valorar al proveedor</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <RatingStars onRate={handleRatingChange} />
                            </Modal.Body>
                        </Modal>

                    )}

                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <div className="row g-4">
                                    {services.map((service) => (
                                        <div key={service._id} className="col-xl-3 col-lg-4 col-md-6">
                                            <div className="border rounded p-2 h-100">
                                                <div className="service-content d-flex">
                                                    <div className="service-image-container me-2" style={{ width: '30%' }}>
                                                        <img
                                                            src={service.images}
                                                            alt={service.title}
                                                            style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div className="service-details" style={{ width: '70%' }}>
                                                        <h5 className="service-title fs-6">{service.title}</h5>
                                                        <p className="service-description small mb-1">{service.description}</p>
                                                        <p className="price-detail mb-1">{service.price} Gs</p>
                                                        <button
                                                            className="btn btn-warning btn-sm"
                                                            onClick={() => handleBookService(service)}
                                                        >
                                                            Agendar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>


                    {showModal && selectedService && (
                        <Modal show={showModal} onHide={handleCloseModal} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>
                                    Agendar Servicio: {selectedService.title}
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form onSubmit={handleSubmitAppointment}>
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    <Form.Group controlId="date" className="mb-3">
                                        <Form.Label>Fecha y Hora</Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            name="date"
                                            value={appointmentData.date}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="notes" className="mb-3">
                                        <Form.Label>Notas adicionales</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="notes"
                                            value={appointmentData.notes}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                    <div className="d-flex justify-content-end">
                                        <Button
                                            variant="secondary"
                                            onClick={handleCloseModal}
                                            className="me-2"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            variant="warning"
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Agendando..." : "Agendar"}
                                        </Button>
                                    </div>
                                </Form>
                            </Modal.Body>
                        </Modal>
                    )}
                </>
            )}

            <ToastContainer />
        </div>
    );
}

export default ProviderDetail;

