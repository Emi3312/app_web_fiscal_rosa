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
          // Si el status es 404, es un error específico. Para otros, un error genérico.
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
    const textoParaCopiar = `DATOS FISCALES
---------------------------------
Nombre/Razón Social: ${datosFijos.nombre}
RFC: ${datosFijos.rfc}
Domicilio: ${datosFijos.calle} No. Ext. ${datosFijos.num_ext}, Col. ${datosFijos.colonia}, ${datosFijos.municipio}, ${datosFijos.estado}, C.P. ${datosFijos.cp}
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

  // --- LÓGICA DE RENDERIZADO CORREGIDA ---
  
  // 1. Mostrar estado de carga
  if (loading) {
    return <h1>Cargando información fiscal...</h1>;
  }

  // 2. Mostrar estado de error
  if (error) {
    return <div className="error-message">{error}<br/><Link to="/login" style={{color: 'var(--primary-color)'}}>Volver al inicio</Link></div>;
  }

  // 3. ¡LA GUARDA DE SEGURIDAD! No renderizar nada si los datos aún no están listos.
  // Esto previene el error fatal.
  if (!data) {
    return null; // O un mensaje de "No hay datos disponibles". `null` es más seguro.
  }

  // 4. Si todo está bien, renderizar el componente.
  return (
    <div className="card">
      <h1>Datos Fiscales para: {data.cliente.name}</h1>
      <div className="data-section">
        <p><strong>Nombre/Razón Social:</strong> {data.datosFijos.nombre}</p>
        <p><strong>RFC:</strong> {data.datosFijos.rfc}</p>
        <p><strong>Domicilio Fiscal:</strong> {`${data.datosFijos.calle} No. Ext. ${data.datosFijos.num_ext}, Col. ${data.datosFijos.colonia}, ${data.datosFijos.municipio}, ${data.datosFijos.estado}, C.P. ${data.datosFijos.cp}`}</p>
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