import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Calendar.css';

function AppointmentCalendar() {
    const [appointments, setAppointments] = useState([]);
    const [serviceHistory, setServiceHistory] = useState([]);
    const [dateDetails, setDateDetails] = useState(null);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        fetchConfirmedAppointments();
        fetchServiceHistory();
    }, []);

    const fetchConfirmedAppointments = async () => {
        const response = await fetch(`${baseUrl}/api/appointments/confirmed`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (response.ok) {
            const data = await response.json();
            const formattedData = data.map((appointment) => ({
                ...appointment,
                date: new Date(appointment.date),
            }));
            setAppointments(formattedData);
        } else {
            console.error("Error al obtener citas confirmadas");
        }
    };

    const fetchServiceHistory = async () => {
        const response = await fetch(`${baseUrl}/api/appointments/confirmed`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (response.ok) {
            const data = await response.json();
            setServiceHistory(data);
        } else {
            console.error("Error al obtener el historial de servicios");
        }
    };

    const tileContent = ({ date }) => {
        const hasAppointments = appointments.some((appointment) => {
            const appointmentDate = new Date(appointment.date);
            return appointmentDate.toDateString() === date.toDateString();
        });
        return hasAppointments ? <span className="dot"></span> : null;
    };

    const handleDateClick = (value) => {
        const details = appointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.date);
            return appointmentDate.toDateString() === value.toDateString();
        });
        setDateDetails(details.length ? details : null);
    };

    const tileClassName = ({ date }) => {
        const hasAppointments = appointments.some((appointment) => {
            const appointmentDate = new Date(appointment.date);
            return appointmentDate.toDateString() === date.toDateString();
        });
        return hasAppointments ? 'highlighted-date' : null;
    };

    return (
        <div className="container py-4">
            <h2 className="text-center mb-4">Citas Confirmadas</h2>

            <div className="row g-4">
                {/* Columna del Calendario */}
                <div className="col-lg-6">
                    <div className="card h-100 border-0">
                        <div className="card-header">
                            <h3 className="card-title h5 mb-0 text-dark">Calendario de Citas</h3>
                        </div>
                        <div className="card-body">
                            <Calendar
                                onClickDay={handleDateClick}
                                tileContent={tileContent}
                                tileClassName={tileClassName}
                                className="w-100 border-0"
                            />

                            {dateDetails && (
                                <div className="mt-4">
                                    <div className="alert" style={{ backgroundColor: '#FFF8DC', border: 'none' }}>
                                        <h4 className="h6">
                                            Detalles para {dateDetails[0]?.date.toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </h4>
                                    </div>
                                    <div className="list-group">
                                        {dateDetails.map((detail, index) => (
                                            <div key={index} className="list-group-item list-group-item-action border-0 mb-2"
                                                style={{ backgroundColor: '#FFFAF0' }}>
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="badge" style={{ backgroundColor: '#FFD700' }}>
                                                        {detail.service?.title || 'No especificado'}
                                                    </span>
                                                    <small className="text-muted">
                                                        {new Date(detail.date).toLocaleTimeString('es-ES', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </small>
                                                </div>
                                                <p className="mb-1"><strong>Cliente:</strong> {detail.client.name}</p>
                                                {detail.notes && (
                                                    <small className="text-muted d-block">
                                                        <strong>Notas:</strong> {detail.notes}
                                                    </small>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna del Historial */}
                <div className="col-lg-6">
                    <div className="card h-100 border-0">
                        <div className="card-header">
                            <h3 className="card-title h5 mb-0 text-dark">Historial de Servicios</h3>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr style={{ backgroundColor: '#FFF8DC' }}>
                                            <th>Fecha</th>
                                            <th>Servicio</th>
                                            <th>Cliente</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {serviceHistory.map((entry, index) => (
                                            <tr key={index} className="align-middle">
                                                <td>
                                                    <span className="badge" style={{ backgroundColor: '#FFD700' }}>
                                                        {new Date(entry.date).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td>{entry.service?.title || 'No especificado'}</td>
                                                <td>{entry.client.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppointmentCalendar;



