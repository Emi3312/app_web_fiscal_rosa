import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error('Las credenciales son incorrectas.');
      const { token } = await response.json();
      localStorage.setItem('token', token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // El <div className="card"> es ahora el elemento principal
  return (
    <div className="card login-card">
      <h1>Portal Fiscal ORPE</h1>
      <p>Inicia sesión para administrar los enlaces de clientes.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuario</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;