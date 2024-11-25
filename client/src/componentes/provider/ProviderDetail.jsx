import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button, Form, Alert } from 'react-bootstrap';

function ProviderDetail() {
    const { profileId } = useParams(); // Obtiene el ID del perfil de la URL
    const [profileData, setProfileData] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false); // Control del modal
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

    // Abrir el modal de agendamiento
    const handleBookService = (service) => {
        setSelectedService(service); // Servicio seleccionado
        setShowModal(true); // Mostrar el modal
    };

    // Cerrar el modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedService(null); // Limpia el servicio seleccionado
        setAppointmentData({ date: '', notes: '' }); // Limpia los datos del formulario
    };

    // Manejar cambios en el formulario del modal
    const handleChange = (e) => {
        setAppointmentData({
            ...appointmentData,
            [e.target.name]: e.target.value,
        });
    };

    // Enviar datos del agendamiento al backend
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
            setShowModal(false); // Cierra el modal tras éxito
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
                    {/* Información del perfil */}
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

                    {/* Servicios del proveedor */}
                    <div className="services-section">
                        <h4>Servicios del Proveedor</h4>
                        {services.length > 0 ? (
                            services.map((service) => (
                                <div key={service._id} className="service-card">
                                    <h5>{service.title}</h5>
                                    <p>{service.description}</p>
                                    <p>Precio: {service.price} Gs.</p>
                                    {/* El botón mantiene el estilo original */}
                                    <button
                                        className="btn btn-warning" // No se cambia el estilo del botón
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

                    {/* Modal de agendamiento */}
                    {showModal && selectedService && (
                        <Modal show={showModal} onHide={handleCloseModal} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Agendar Servicio: {selectedService.title}</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                <Form onSubmit={handleSubmitAppointment}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha y Hora</Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            name="date"
                                            value={appointmentData.date}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Notas Adicionales</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="notes"
                                            value={appointmentData.notes}
                                            onChange={handleChange}
                                            placeholder="Agrega cualquier detalle importante..."
                                        />
                                    </Form.Group>

                                    {error && (
                                        <Alert variant="danger">
                                            {error}
                                        </Alert>
                                    )}

                                    <div className="d-flex justify-content-end gap-2">
                                        <Button variant="secondary" onClick={handleCloseModal}>
                                            Cancelar
                                        </Button>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Agendando...' : 'Agendar'}
                                        </Button>
                                    </div>
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


