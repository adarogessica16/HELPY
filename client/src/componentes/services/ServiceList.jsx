import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaTrashAlt, FaPen } from 'react-icons/fa';
import "./ServiceList.css";

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
                    <div key={service._id} className="col-md-4 mb-1">
                        <div className="card h-100 p-3 border border-dark">
                            <div className="row g-0">
                                <div className="col-md-4 d-flex justify-content-center align-items-start" style={{ padding: 0, marginTop: '20px' }}>
                                    {service.images && service.images.map((img, index) => (
                                        <img
                                            key={index}
                                            src={`http://localhost:5000/${img}`}
                                            alt={service.title}
                                            className="card-img-top img-fluid"
                                            style={{ objectFit: 'cover', width: '100%', height: '100px' }}
                                        />
                                    ))}
                                </div>
                                <div className="col-md-8">
                                    <div className="card-body">
                                        <h5 className="card-title text-center">{service.title}</h5>
                                        <p className="card-text">{service.description}</p>
                                        <div className="d-flex justify-content-between align-items-center">
                                        <p className="card-text mb-0 ms-auto text-end">{service.price} Gs</p>
                                        </div>
                                        {userType === 'provider' && (
                                            <div className="button-group mt-3 d-flex justify-content-end">
                                                <button
                                                    className="btn btn-white me-2"
                                                    onClick={() => onServiceEdit(service)}
                                                >
                                                    <FaPen className="icon-edit" />
                                                </button>
                                                <button
                                                    className="btn btn-white"
                                                    onClick={() => {
                                                        if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
                                                            deleteService(service._id);
                                                        }
                                                    }}
                                                >
                                                    <FaTrashAlt className="icon-delete" />
                                                </button>
                                            </div>
                                        )}
                                        {userType !== 'provider' && (
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
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ServiceList;
