import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminAuth } from '../../middleware/adminAuth';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const result = adminAuth.login(form.username, form.password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg">
        <div className="login-orb-1" />
        <div className="login-orb-2" />
      </div>

      <div className="admin-login-card anim-fade-in-scale">
        <div className="admin-login-logo">
          <div className="login-badge">GT</div>
          <div>
            <div className="login-brand">GYMTOTAL</div>
            <div className="login-subbrand">Panel de Administración</div>
          </div>
        </div>

        <h1 className="login-title">Iniciar sesión</h1>
        <p className="login-sub">Acceso restringido al personal autorizado</p>

        {error && (
          <div className="login-error anim-fade-in">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              className="form-input"
              placeholder="admin"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              autoComplete="username"
              id="input-admin-user"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="pw-wrapper">
              <input
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
                id="input-admin-pw"
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                {showPw ? '👁' : '🙈'}
              </button>
            </div>
          </div>

          <div className="login-hint">
            <span>💡 Demo: usuario <code>admin</code> / contraseña <code>gymtotal2026</code></span>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} id="btn-admin-login">
            {loading ? <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Verificando...</> : 'Ingresar al panel'}
          </button>
        </form>

        <a href="/" className="login-back-link">← Volver al totem</a>
      </div>
    </div>
  );
}
