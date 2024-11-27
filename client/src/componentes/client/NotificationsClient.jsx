import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './NotificationsClient.css';

function NotificationsClient() {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const baseUrl = import.meta.env.VITE_API_BASE_URL;


    useEffect(() => {
        // Solo hacer fetch si el filtro ha cambiado
        if (!isLoading) {
            fetchClientAppointments();
        }
    }, [filter]); // Dependencia de 'filter'

    const fetchClientAppointments = async () => {
        setIsLoading(true);  // Marca como cargando
        try {
            let url = `${baseUrl}/api/appointments/all`; // Ruta por defecto

            // URL según el filtro
            if (filter === 'pending') {
                url = `${baseUrl}/api/appointments/pending`;
            } else if (filter === 'confirmed') {
                url = `${baseUrl}/api/appointments/confirmed`;
            }

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            if (response.ok) {
                const data = await response.json();
                setAppointments(data);  // Actualiza las citas
            } else {
                console.error('Error fetching client appointments');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);  // Finaliza la carga
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return <span className="badge bg-success">Confirmado</span>;
            case 'pending':
                return <span className="badge bg-secondary">Pendiente</span>;
            default:
                return <span className="badge bg-light">Desconocido</span>;
        }
    };

    // Manejar el cambio de filtro
    const handleFilterChange = (newFilter) => {
        if (newFilter !== filter) {
            setFilter(newFilter);  // Solo cambia el filtro si es diferente al actual
        }
    };

    return (
        <div className="container py-4">
            <h2 className="text-center mb-4">Mis Agendamientos</h2>

            {/* Filtro de citas */}
            <div className="text-center mb-4">
                <button
                    className="btn btn-warning mx-2 tag-btn"
                    onClick={() => handleFilterChange('all')}>
                    Todos
                </button>
                <button
                    className="btn btn-secondary mx-2 tag-btn"
                    onClick={() => handleFilterChange('pending')}>
                    Pendientes
                </button>
                <button
                    className="btn btn-success mx-2 tag-btn"
                    onClick={() => handleFilterChange('confirmed')}>
                    Confirmadas
                </button>
            </div>

            {isLoading ? (
                <p className="text-center">Cargando tus agendamientos...</p>
            ) : appointments.length > 0 ? (
                <div className="table-responsive transition-opacity">
                    <table className="table table-striped table-bordered table-hover shadow-sm">
                        <thead className="thead-light">
                            <tr>
                                <th>Fecha</th>
                                <th>Servicio</th>
                                <th>Proveedor</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment) => (
                                <tr key={appointment._id}>
                                    <td>{appointment.date ? new Date(appointment.date).toLocaleString() : "Fecha no disponible"}</td>
                                    <td>{appointment?.service?.title || "Servicio no especificado"}</td>
                                    <td>{appointment?.service?.provider?.name || "No especificado"}</td>
                                    <td>{getStatusBadge(appointment.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center">No tienes agendamientos registrados.</p>
            )}
        </div>
    );
}

export default NotificationsClient;
