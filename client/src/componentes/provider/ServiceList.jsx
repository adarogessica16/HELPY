function ServiceList({ services, onServiceUpdate, onServiceEdit }) {
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
        <div className="service-list">
            {services.map((service) => (
                <div key={service._id} className="service-card">
                    {service.images && service.images.map((img, index) => (
                        <img key={index} src={img} alt={service.title} className="service-image" />
                    ))}
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <p className="price">Precio: {service.price} Gs</p>
                    <p className="category">Categoría: {service.category}</p>
                    <div className="service-actions">
                        <button 
                            className="edit-button"
                            onClick={() => onServiceEdit(service)}
                        >
                            Editar
                        </button>
                        <button 
                            className="delete-button"
                            onClick={() => {
                                if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
                                    deleteService(service._id);
                                }
                            }}
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ServiceList;
