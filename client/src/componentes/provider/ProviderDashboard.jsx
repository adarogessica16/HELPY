import { useState, useEffect } from "react";
import ServiceList from "../services/ServiceList";
import ServiceForm from "../services/ServiceForm";
import "./Provider.css";
import { Modal, Button } from "react-bootstrap";

function ProviderDashboard() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState(null);
  const [providerName, setProviderName] = useState("");

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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header d-flex justify-content-between align-items-center">
        <div className="provider-info">
          <h2>Proveedor</h2>
          <p>{providerName}</p>
        </div>
        <button
          variant="primary"
          className="add-service-button"
          onClick={() => { setEditService(null); setShowForm(true); }}
        >
          Agregar Servicio
        </button>
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

      <p className="mt-4">Mis Servicios</p>
      <ServiceList
        services={services}
        onServiceUpdate={fetchServices}
        onServiceEdit={handleServiceEdit}
        onServiceDelete={handleServiceDelete} // Proporcionar función de eliminación
        userType="provider"
      />
    </div>
  );
}

export default ProviderDashboard;
