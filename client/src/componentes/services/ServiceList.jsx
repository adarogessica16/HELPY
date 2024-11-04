import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function ServiceList({ services, onServiceUpdate, onServiceEdit, userType, onContactProvider }) {
    const deleteService = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/services/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al eliminar servicio');
            }

            onServiceUpdate();
        } catch (error) {
            console.error('Error al eliminar servicio:', error);
            alert('Error al eliminar servicio: ' + error.message);
        }
    };

    return (
        <div className="container">
            <div className="row">
                {services.map((service) => (
                    <div key={service._id} className="col-md-4 mb-4">
                        <div className="card h-100">
                            {service.images && service.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={`http://localhost:5000/${img}`}
                                    alt={service.title}
                                    className="card-img-top img-fluid"
                                />
                            ))}
                            <div className="card-body">
                                <h5 className="card-title">{service.title}</h5>
                                <p className="card-text">{service.description}</p>
                                <p className="card-text"><strong>Precio:</strong> {service.price} Gs</p>
                                <p className="card-text"><strong>Categoría:</strong> {service.category}</p>
                                
                                {userType === 'provider' ? (
                                    <div className="d-flex justify-content-between mt-3">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => onServiceEdit(service)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => {
                                                if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
                                                    deleteService(service._id);
                                                }
                                            }}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="btn btn-primary w-100 mt-3"
                                        onClick={() => onContactProvider(service._id)}
                                    >
                                        Contactar Proveedor
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ServiceList;


