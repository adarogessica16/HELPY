import React, { useState, useEffect } from 'react';
import './Navigation.css';

function Notifications() {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/appointments/pending', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (response.ok) {
            const data = await response.json();
            setAppointments(data);
        } else {
            console.error('Error fetching appointments');
        }
        setIsLoading(false);
    };

    const confirmAppointment = async (id) => {
        const response = await fetch(`http://localhost:5000/api/appointments/confirm/${id}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (response.ok) {
            alert('Cita confirmada');
            fetchAppointments();
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
                                onClick={() => confirmAppointment(appointment._id)}>
                                Confirmar Cita
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-appointments">No tienes citas pendientes.</p>
            )}
        </div>
    );
}

export default Notifications;