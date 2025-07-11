import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';
import Modal from '../components/Modal';

// Función helper para obtener las cabeceras de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

function AdminPage() {
  // --- Estados del Componente ---
  const [clients, setClients] = useState([]);
  const [usosCFDI, setUsosCFDI] = useState([]);
  const [formasPago, setFormasPago] = useState([]);
  const [clientName, setClientName] = useState('');
  const [selectedUso, setSelectedUso] = useState('');
  const [selectedForma, setSelectedForma] = useState('');
  const [attachPdf, setAttachPdf] = useState(false); // Estado para el checkbox
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '', url: '' });

  // Estado para manejar la confirmación de borrado
  const [clientToDelete, setClientToDelete] = useState(null);

  // --- Lógica de Efectos y Navegación ---
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();
        const [clientsRes, usosRes, formasRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/clients`, { headers }),
          fetch(`${API_URL}/api/usos-cfdi`),
          fetch(`${API_URL}/api/formas-pago`),
        ]);

        if (clientsRes.status === 401 || clientsRes.status === 403) {
          setError('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
          setTimeout(handleLogout, 2000);
          return;
        }

        setClients(await clientsRes.json());
        const usosData = await usosRes.json();
        const formasData = await formasRes.json();
        setUsosCFDI(usosData);
        setFormasPago(formasData);

        if (usosData.length > 0) setSelectedUso(usosData[0].id);
        if (formasData.length > 0) setSelectedForma(formasData[0].id);
      } catch (err) {
        setError('Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [handleLogout]);

  // --- Manejadores de Eventos ---

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin/clients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          name: clientName, 
          usoCfdiId: selectedUso, 
          formaPagoId: selectedForma, 
          attachPdf // Enviamos el estado del checkbox
        }),
      });
      if (!res.ok) throw new Error('No se pudo crear el cliente.');

      const { slug } = await res.json();
      const newUrl = `${window.location.origin}/cliente/${slug}`;

      setModalContent({
        title: '¡Enlace Creado con Éxito!',
        body: `El enlace para "${clientName}" es:`,
        url: newUrl,
      });
      setIsModalOpen(true);

      const updatedClientsRes = await fetch(`${API_URL}/api/admin/clients`, { headers: getAuthHeaders() });
      setClients(await updatedClientsRes.json());
      setClientName('');
      setAttachPdf(false); // Reseteamos el checkbox
    } catch (err) {
      setModalContent({ title: 'Error', body: err.message, url: '' });
      setIsModalOpen(true);
    }
  };

  const handleCopyLink = (slug, clientName) => {
    const url = `${window.location.origin}/cliente/${slug}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setModalContent({
          title: 'Enlace Copiado',
          body: `Se ha copiado el enlace para "${clientName}" al portapapeles.`,
          url: url,
        });
        setIsModalOpen(true);
      })
      .catch(() => {
        setModalContent({
          title: 'Error al Copiar',
          body: 'No se pudo copiar el enlace automáticamente. Por favor, cópialo de forma manual.',
          url: url,
        });
        setIsModalOpen(true);
      });
  };

  const requestDeleteClient = (client) => {
    setClientToDelete(client);
    setModalContent({
      title: 'Confirmar Eliminación',
      body: `¿Estás seguro de que quieres eliminar el enlace para "${client.name}"? Esta acción no se puede deshacer.`
    });
    setIsModalOpen(true);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/clients/${clientToDelete.id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!res.ok) throw new Error('No se pudo eliminar el cliente.');
      
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      closeModal();
    } catch (err) {
      setModalContent({ title: 'Error', body: err.message });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setClientToDelete(null);
  };
  
  // --- Renderizado del Componente ---

  if (loading) return <h1>Cargando panel...</h1>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <>
      <div className="card">
        <header className="admin-header">
          <h1>Panel de Administración</h1>
          <button onClick={handleLogout} className="btn-secondary">Cerrar Sesión</button>
        </header>
        <section>
          <h2>Crear Nuevo Enlace</h2>
          <form onSubmit={handleCreateClient}>
            <div className="form-group">
              <label>Nombre del Cliente</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ej: Mi Cliente Importante" required />
            </div>
            <div className="form-group">
              <label>Uso de CFDI por defecto:</label>
              <select value={selectedUso} onChange={(e) => setSelectedUso(e.target.value)} required>
                {usosCFDI.map(uso => <option key={uso.id} value={uso.id}>{uso.clave} - {uso.descripcion}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Forma de Pago por defecto:</label>
              <select value={selectedForma} onChange={(e) => setSelectedForma(e.target.value)} required>
                {formasPago.map(forma => <option key={forma.id} value={forma.id}>{forma.clave} - {forma.descripcion}</option>)}
              </select>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="attach-pdf"
                checked={attachPdf}
                onChange={(e) => setAttachPdf(e.target.checked)}
              />
              <label htmlFor="attach-pdf">
                Adjuntar Constancia de Situación Fiscal al enlace del cliente.
              </label>
            </div>
            <button type="submit" className="btn-primary" style={{marginTop: '1rem'}}>Crear Enlace</button>
          </form>
        </section>
        <section>
          <h2>Enlaces Existentes</h2>
          <div className="client-list">
            {clients.length > 0 ? (
              <ul>
                {clients.map(client => (
                  <li key={client.id}>
                    <span className="client-name">{client.name}</span>
                    <div className="client-actions">
                      <button onClick={() => handleCopyLink(client.slug, client.name)} className="btn-secondary">Copiar</button>
                      <button onClick={() => requestDeleteClient(client)} className="btn-danger">Eliminar</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p>Aún no has creado ningún enlace.</p>}
          </div>
        </section>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h3>{modalContent.title}</h3>
        <p>{modalContent.body}</p>
        {modalContent.url && <p style={{ fontWeight: 'bold', color: 'var(--primary-color)', wordBreak: 'break-all' }}>{modalContent.url}</p>}
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          {clientToDelete ? (
            <>
              <button className="btn-secondary" onClick={closeModal}>Cancelar</button>
              <button className="btn-danger" onClick={confirmDeleteClient}>Sí, Eliminar</button>
            </>
          ) : (
            <button className="btn-primary" onClick={closeModal}>Aceptar</button>
          )}
        </div>
      </Modal>
    </>
  );
}

export default AdminPage;