import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';

function ClientPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(false);
  const { slug } = useParams();

  useEffect(() => {
    const cargarData = async () => {
      try {
        const clientRes = await fetch(`${API_URL}/api/client-data/${slug}`);
        if (!clientRes.ok) {
          if (clientRes.status === 404) {
            throw new Error('El enlace del cliente no es válido o no se encontró.');
          }
          throw new Error('No se pudo conectar con el servidor.');
        }
        const clientData = await clientRes.json();
        setData(clientData);
      } catch (err) { 
        setError(err.message); 
      } finally { 
        setLoading(false); 
      }
    };
    cargarData();
  }, [slug]);

  const handleCopiar = () => {
    if (!data) return;
    const { datosFijos, cliente } = data;
    
    // --- ¡CAMBIO IMPORTANTE AQUÍ! ---
    // Actualizamos el texto a copiar para que coincida con el nuevo formato.
    const textoParaCopiar = `DATOS FISCALES
---------------------------------
Nombre/Razón Social: ${datosFijos.nombre}
RFC: ${datosFijos.rfc}
Domicilio Fiscal:
  Calle: ${datosFijos.calle}
  Número Exterior: ${datosFijos.num_ext}
  Colonia: ${datosFijos.colonia}
  Municipio / Localidad: ${datosFijos.municipio}
  Estado: ${datosFijos.estado}
  Código Postal (C.P.): ${datosFijos.cp}
Régimen Fiscal: ${datosFijos.regimen_fiscal}
Correo Electrónico: ${datosFijos.correo_electronico}
---------------------------------
USO DE CFDI: ${cliente.uso_cfdi_clave} - ${cliente.uso_cfdi_descripcion}
FORMA DE PAGO: ${cliente.forma_pago_clave} - ${cliente.forma_pago_descripcion}`;
    
    navigator.clipboard.writeText(textoParaCopiar).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  if (loading) {
    return <h1>Cargando información fiscal...</h1>;
  }
  if (error) {
    return <div className="error-message">{error}<br/><Link to="/login" style={{color: 'var(--primary-color)'}}>Volver al inicio</Link></div>;
  }
  if (!data) {
    return null; 
  }

  return (
    <div className="card">
      <h1>Datos Fiscales para: {data.cliente.name}</h1>
      <div className="data-section">
        <p><strong>Nombre/Razón Social:</strong> {data.datosFijos.nombre}</p>
        <p><strong>RFC:</strong> {data.datosFijos.rfc}</p>
        
        {/* --- ¡CAMBIO IMPORTANTE AQUÍ! --- */}
        {/* Reemplazamos el párrafo único por un bloque estructurado. */}
        <div className="address-block">
          <p><strong>Domicilio Fiscal:</strong></p>
          <div className="address-details">
            <p><strong>Calle:</strong> {data.datosFijos.calle}</p>
            <p><strong>Número Exterior:</strong> {data.datosFijos.num_ext}</p>
            <p><strong>Colonia:</strong> {data.datosFijos.colonia}</p>
            <p><strong>Municipio / Localidad:</strong> {data.datosFijos.municipio}</p>
            <p><strong>Estado:</strong> {data.datosFijos.estado}</p>
            <p><strong>Código Postal (C.P.):</strong> {data.datosFijos.cp}</p>
          </div>
        </div>
        
        <p><strong>Régimen Fiscal:</strong> {data.datosFijos.regimen_fiscal}</p>
        <p><strong>Correo Electrónico:</strong> {data.datosFijos.correo_electronico}</p>
        <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }}/>
        <p><strong>Uso de CFDI:</strong> {data.cliente.uso_cfdi_clave} - {data.cliente.uso_cfdi_descripcion}</p>
        <p><strong>Forma de Pago:</strong> {data.cliente.forma_pago_clave} - {data.cliente.forma_pago_descripcion}</p>
      </div>

      <div className="actions-container">
        {Boolean(data.cliente.attach_pdf) && (
          <a
            href={`${API_URL}/api/download/constancia`}
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Descargar Constancia de Situación Fiscal (PDF)
          </a>
        )}

        <button onClick={handleCopiar} className="btn btn-primary">
          {copiado ? '¡Datos de Texto Copiados!' : 'Copiar Información de Texto'}
        </button>
      </div>
    </div>
  );
}

export default ClientPage;