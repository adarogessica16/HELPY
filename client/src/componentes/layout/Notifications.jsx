import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Navigation.css';

function Notifications() {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${baseUrl}/api/appointments/pending`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            if (response.ok) {
                const data = await response.json();
                setAppointments(data);
            } else {
                toast.error('Error al cargar las citas', {
                    position: "top-right",
                    autoClose: 3000
                });
            }
        } catch (error) {
            toast.error('Error de conexión', {
                position: "top-right",
                autoClose: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const confirmAppointment = async (id) => {
        try {
            const response = await fetch(`${baseUrl}/api/appointments/confirm/${id}`, {
                method: 'PATCH',
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                toast.success('¡Cita confirmada exitosamente!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    style: {
                        background: "#FFFFFF",
                        color: "#000000",
                        fontWeight: "bold",
                        border: "1px solid #BDBDBD"
                    }
                });
                await fetchAppointments();
            } else {
                throw new Error('Error al confirmar la cita');
            }
        } catch (error) {
            toast.error('Error al confirmar la cita', {
                position: "top-right",
                autoClose: 3000
            });
        }
    };

    return (
        <div className="notifications-container">
            <h2 className="notifications-title">Citas Pendientes</h2>

            {isLoading ? (
                <p className="loading-text">Cargando citas pendientes...</p>
            ) : appointments.length > 0 ? (
                <div className="appointments-list">
                    {appointments.map(appointment => (
                        <div key={appointment._id} className="appointment-card">
                            <h3>{appointment?.service?.title || "Servicio no especificado"}</h3>
                            <p><strong>Cliente:</strong> {appointment?.client?.name || "No especificado"}</p>
                            <p><strong>Fecha:</strong> {appointment.date ? new Date(appointment.date).toLocaleString() : "Fecha no disponible"}</p>
                            <button 
                                className="confirm-button" 
                                onClick={() => confirmAppointment(appointment._id)}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Confirmando...' : 'Confirmar Cita'}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-appointments">No tienes citas pendientes.</p>
            )}

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
}

export default Notifications;
