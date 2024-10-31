function ServiceList({ services, onServiceUpdate }) {
    const deleteService = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/services/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al eliminar servicio');
            }

            onServiceUpdate();
        } catch (error) {
            console.error('Error al eliminar servicio:', error);
            alert('Error al eliminar servicio: ' + error.message);
        }
    };

    return (
        <div className="services-list">
            {services.map((service) => (
                <div key={service._id} className="service-card">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <p className="price">Precio: ${service.price}</p>
                    <p className="category">Categoría: {service.category}</p>
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
            ))}
        </div>
    );
}

export default ServiceList;