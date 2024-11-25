import React, { useState, useEffect } from 'react';

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
            <h2>Notificaciones de Citas Pendientes</h2>

            {isLoading ? (
                <p>Cargando citas pendientes...</p>
            ) : appointments.length > 0 ? (
                <ul>
                    {appointments.map(appointment => (
                        <li key={appointment._id}>
                            <p><strong>Cliente:</strong> {appointment.client.name}</p>
                            <p><strong>Servicio:</strong> {appointment.service.title}</p>
                            <p><strong>Fecha:</strong> {new Date(appointment.date).toLocaleString()}</p>
                            <button onClick={() => confirmAppointment(appointment._id)}>
                                Confirmar Cita
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No tienes citas pendientes.</p>
            )}
        </div>
    );
}

export default Notifications;