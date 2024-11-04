import { useState, useEffect } from 'react';
import './Service.css';

function ServiceForm({ onServiceAdded, onClose, service }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        images: [] // Mantener el campo de imágenes como un arreglo
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Usar useEffect para inicializar el formulario en caso de que se edite un servicio
    useEffect(() => {
        if (service) {
            setFormData({
                title: service.title || '',
                description: service.description || '',
                price: service.price || '',
                category: service.category || '',
                images: [] // Imágenes no se pueden pre-cargar desde la API
            });
        }
    }, [service]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: name === 'price' ? (value === '' ? '' : parseFloat(value)) : value
        }));
    };

    // Manejar cambio de imágenes
    const handleImagesChange = (e) => {
        const { files } = e.target;
        setFormData(prevState => ({
            ...prevState,
            images: Array.from(files) // Guardar los archivos directamente
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validación básica
            if (!formData.title || !formData.description || !formData.price || !formData.category) {
                throw new Error('Todos los campos son requeridos');
            }

            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', parseFloat(formData.price));
            formDataToSend.append('category', formData.category);
            formData.images.forEach(image => {
                formDataToSend.append('images', image);
            });

            const method = service ? 'PUT' : 'POST'; // Determinar el método
            const url = service
                ? `http://localhost:5000/api/services/${service._id}` // URL para actualizar
                : 'http://localhost:5000/api/services/service'; // URL para crear

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Mantener la autorización
                },
                body: formDataToSend // Enviar FormData
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error('La respuesta del servidor no es JSON válido');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al guardar el servicio');
            }

            // Resetear el formulario y notificar éxito
            setFormData({
                title: '',
                description: '',
                price: '',
                category: '',
                images: []
            });

            onServiceAdded(); // Llamar función para refrescar la lista

        } catch (error) {
            console.error('Error en la creación/edición del servicio:', error);
            setError(error.message || 'Error al guardar el servicio. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="service-form-container">
            <h3>{service ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}</h3>
            {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Título del Servicio:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descripción:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="price">Precio:</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Categoría:</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selecciona una categoría</option>
                        <option value="limpieza">Limpieza</option>
                        <option value="jardineria">Jardinería</option>
                        <option value="reparacion">Reparación</option>
                        <option value="mantenimiento">Mantenimiento</option>
                        <option value="otros">Otros</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="images">Imagen:</label>
                    <input
                        type="file"
                        id="images"
                        name="images"
                        onChange={handleImagesChange}
                        multiple
                    />
                </div>

                <div className="form-buttons">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={loading ? 'loading' : ''}
                    >
                        {loading ? 'Guardando...' : (service ? 'Actualizar Servicio' : 'Crear Servicio')}
                    </button>

                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="close-button"
                    >
                        Cerrar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ServiceForm;


