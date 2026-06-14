// ─── Admin Auth Middleware ───────────────────────────────────────────────────
// Gestiona la sesión del administrador en localStorage.
// Credenciales demo: usuario "admin" / contraseña "gymtotal2026"

const ADMIN_KEY = 'gymtotal_admin_session';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'gymtotal2026',
  nombre: 'Administrador GymTotal',
  rol: 'superadmin',
};

export const adminAuth = {
  /**
   * Intenta iniciar sesión con las credenciales proporcionadas.
   * @returns {{ success: boolean, error?: string }}
   */
  login(username, password) {
    if (
      username.trim() === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const session = {
        username: ADMIN_CREDENTIALS.username,
        nombre: ADMIN_CREDENTIALS.nombre,
        rol: ADMIN_CREDENTIALS.rol,
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem(ADMIN_KEY, JSON.stringify(session));
      return { success: true, session };
    }
    return { success: false, error: 'Usuario o contraseña incorrectos.' };
  },

  /**
   * Cierra la sesión activa del administrador.
   */
  logout() {
    localStorage.removeItem(ADMIN_KEY);
  },

  /**
   * Verifica si hay una sesión de admin activa.
   * @returns {boolean}
   */
  isAuthenticated() {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return false;
    try {
      const session = JSON.parse(raw);
      return !!session?.username;
    } catch {
      return false;
    }
  },

  /**
   * Devuelve los datos de la sesión activa, o null si no hay sesión.
   * @returns {object|null}
   */
  getSession() {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
};
