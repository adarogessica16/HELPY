import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css'; // Puedes personalizar estilos adicionales aquí

function AppointmentCalendar() {
    const [appointments, setAppointments] = useState([]);
    const [dateDetails, setDateDetails] = useState(null);

    // Fetch citas confirmadas al cargar el componente
    useEffect(() => {
        fetchConfirmedAppointments();
    }, []);

    // Función para obtener citas confirmadas
    const fetchConfirmedAppointments = async () => {
        const response = await fetch('http://localhost:5000/api/appointments/confirmed', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (response.ok) {
            const data = await response.json();
            // Convierte las fechas en objetos Date para evitar problemas con la comparación
            const formattedData = data.map((appointment) => ({
                ...appointment,
                date: new Date(appointment.date),  // Convierte la fecha a un objeto Date
            }));
            setAppointments(formattedData);
        } else {
            console.error("Error al obtener citas confirmadas");
        }
    };

    // Función para mostrar un punto en el calendario si hay citas
    const tileContent = ({ date }) => {
        const hasAppointments = appointments.some((appointment) => {
            const appointmentDate = new Date(appointment.date);
            // Comparar solo la fecha, ignorando la hora
            return appointmentDate.toDateString() === date.toDateString();
        });
        return hasAppointments ? <span className="dot"></span> : null;
    };

    // Manejar el clic en una fecha para mostrar los detalles de las citas
    const handleDateClick = (value) => {
        const details = appointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.date);
            // Comparar solo la fecha, ignorando la hora
            return appointmentDate.toDateString() === value.toDateString();
        });
        setDateDetails(details.length ? details : null);
    };

    // Aplicar clase CSS para fechas con citas
    const tileClassName = ({ date }) => {
        const hasAppointments = appointments.some((appointment) => {
            const appointmentDate = new Date(appointment.date);
            // Comparar solo la fecha, ignorando la hora
            return appointmentDate.toDateString() === date.toDateString();
        });
        return hasAppointments ? 'highlighted-date' : null;
    };

    return (
        <div className="appointments-calendar">
            <h2>Citas Confirmadas</h2>
            <Calendar
                onClickDay={handleDateClick}
                tileContent={tileContent}  // Mostrar puntos en el calendario
                tileClassName={tileClassName}  // Aplicar clase CSS para resaltar fechas
            />
            {dateDetails && (
                <div className="appointment-details">
                    <h3>Detalles para {dateDetails[0]?.date.toDateString()}</h3>
                    <ul>
                        {dateDetails.map((detail, index) => (
                            <li key={index}>
                                <strong>Servicio:</strong> {detail.service.title}
                                <br />
                                <strong>Cliente:</strong> {detail.client.name}
                                <br />
                                <strong>Notas:</strong> {detail.notes || "Sin notas"}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default AppointmentCalendar;

