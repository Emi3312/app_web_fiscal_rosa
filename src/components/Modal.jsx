import React from 'react';

// Este componente recibe 3 props:
// isOpen: un booleano para mostrar/ocultar el modal.
// onClose: una función para cerrar el modal.
// children: el contenido que se mostrará dentro del modal.
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    // El 'backdrop' es el fondo semitransparente que cubre la página.
    // Al hacer clic en él, se cierra el modal.
    <div className="modal-backdrop" onClick={onClose}>
      {/* Evitamos que un clic dentro del modal se propague al backdrop */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* El botón para cerrar el modal */}
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>
        {/* Aquí se renderiza el contenido que pasamos al modal */}
        {children}
      </div>
    </div>
  );
}

export default Modal;