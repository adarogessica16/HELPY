import { useState, useEffect } from "react"; 
import ServiceList from "../services/ServiceList";
import ServiceForm from "../services/ServiceForm";
import "./Provider.css";
import { Modal, Button, Form, InputGroup, FormControl } from "react-bootstrap";

function ProviderDashboard() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState(null);
  const [providerName, setProviderName] = useState("");
  const [profileModalShow, setProfileModalShow] = useState(false);
  const [profileDescription, setProfileDescription] = useState("");
  const [profileTags, setProfileTags] = useState("");
  const [profileLogo, setProfileLogo] = useState(null);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchServices();
    fetchProviderProfile();
  }, []);

  const fetchProviderProfile = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener perfil");
      }
      const data = await response.json();
      setProviderName(data.name);
      setProfileData(data); // Almacenar datos del perfil
    } catch (error) {
      console.error("Error al obtener perfil:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/services/my-services",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error al obtener servicios");
      }
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error al obtener servicios:", error);
      alert("Error al obtener servicios: " + error.message);
    }
  };

  const handleServiceEdit = (service) => {
    setEditService(service);
    setShowForm(true);
  };

  const handleServiceDelete = async (serviceId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/services/${serviceId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Error al eliminar el servicio");
        }
        fetchServices(); // Actualiza la lista después de la eliminación
      } catch (error) {
        console.error("Error al eliminar el servicio:", error);
        alert("Error al eliminar el servicio: " + error.message);
      }
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditService(null);
  };

const handleProfileSave = async () => {
    const profileData = {
        description: profileDescription,
        tags: profileTags.split(","),
        logo: profileLogo,
    };

    try {
        const response = await fetch("http://localhost:5000/api/users/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(profileData),
        });

        if (!response.ok) {
            throw new Error("Error al actualizar el perfil");
        }

        const data = await response.json();
        setProfileData(data.profile); // Actualizar el estado con los datos guardados
        setProfileModalShow(false); // Cerrar el modal
    } catch (error) {
        console.error("Error al guardar el perfil:", error);
    }
};


  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileLogo(URL.createObjectURL(file)); // Previsualización de logo
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header d-flex justify-content-between align-items-center">

        <button
          className="edit-profile-button"
          onClick={() => setProfileModalShow(true)} // Mostrar modal de edición de perfil
        >
          Editar Perfil
        </button>
      </div>

      <Modal show={profileModalShow} onHide={() => setProfileModalShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formDescription">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={profileDescription}
                onChange={(e) => setProfileDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formTags">
              <Form.Label>Tags (separados por coma)</Form.Label>
              <Form.Control
                type="text"
                value={profileTags}
                onChange={(e) => setProfileTags(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formLogo">
              <Form.Label>Logo</Form.Label>
              <Form.Control
                type="file"
                onChange={handleLogoChange}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleProfileSave}>Guardar</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <div className="profile-card mt-4">
  {profileData && (
    <div className="profile-info-card">
      <div className="left-section">
        <h3 className="profile-name">{providerName}</h3>
        <p className="profile-description">{profileData.description}</p>
        <div className="tags">
          {profileData.tags &&
            profileData.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
        </div>
      </div>
      <div className="right-section">
        {profileData.logo && (
          <img
            src={profileData.logo}
            alt="Logo"
            className="profile-logo"
          />
        )}
        <div className="rating-stars">
          ⭐⭐⭐⭐⭐
        </div>
      </div>
    </div>
  )}
</div>

      <Modal show={showForm} onHide={closeForm} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editService ? "Editar Servicio" : "Agregar Servicio"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ServiceForm
            service={editService}
            onServiceAdded={() => {
              fetchServices();
              closeForm();
            }}
            onClose={closeForm}
          />
        </Modal.Body>
      </Modal>

       {/* Botón de Agregar Servicio antes de los servicios */}
        <div className="services-header d-flex justify-content-between align-items-center mt-4">
          <p className="services-title">Mis Servicios</p>
          <button
            variant="primary"
            className="add-service-button"
            onClick={() => { setEditService(null); setShowForm(true); }}
          >
            Agregar Servicio
          </button>
        </div>

        {/* Lista de Servicios */}
        <ServiceList
          services={services}
          onServiceUpdate={fetchServices}
          onServiceEdit={handleServiceEdit}
          onServiceDelete={handleServiceDelete} // Asegúrate de pasar la función aquí
          userType="provider"
        />
      </div>
  );
}

export default ProviderDashboard;
