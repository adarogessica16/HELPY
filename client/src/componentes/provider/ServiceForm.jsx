import { useState } from 'react';
import './Service.css'; 

function ServiceForm({ onServiceAdded, onClose, service }) {
    const [formData, setFormData] = useState({
        title: service ? service.title : '',
        description: service ? service.description : '',
        price: service ? service.price : '',
        category: service ? service.category : '',
        images: [] // Añadir el campo images como arreglo
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            images: Array.from(files).map(file => URL.createObjectURL(file)) // O manejar las URLs
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

            const response = await fetch('http://localhost:5000/api/services/service', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price)
                })
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error('La respuesta del servidor no es JSON válido');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear el servicio');
            }

            // Resetear el formulario y notificar éxito
            setFormData({
                title: '',
                description: '',
                price: '',
                category: '',
                images: []
            });
            
            onServiceAdded();
            
        } catch (error) {
            console.error('Error en la creación del servicio:', error);
            setError(error.message || 'Error al crear el servicio. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="service-form-container">
            <h3>Agregar Nuevo Servicio</h3>
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
                        {loading ? 'Creando...' : 'Crear Servicio'}
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