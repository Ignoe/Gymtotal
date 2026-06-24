const CLAVE_SESION = 'gymtotal_admin_session';
const CREDENCIALES = {
  username: 'admin',
  password: 'gymtotal2026',
  nombre: 'Administrador GymTotal',
  rol: 'superadmin',
};

export const adminAuth = {
  login(username, password) {
    if (
      username.trim() === CREDENCIALES.username &&
      password === CREDENCIALES.password
    ) {
      const sesion = {
        username: CREDENCIALES.username,
        nombre: CREDENCIALES.nombre,
        rol: CREDENCIALES.rol,
        fechaLogin: new Date().toISOString(),
      };
      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
      return { success: true, sesion };
    }
    return { success: false, error: 'Usuario o contraseña incorrectos.' };
  },

  logout() {
    localStorage.removeItem(CLAVE_SESION);
  },

  isAuthenticated() {
    const raw = localStorage.getItem(CLAVE_SESION);
    if (!raw) return false;
    try {
      const sesion = JSON.parse(raw);
      return !!sesion?.username;
    } catch {
      return false;
    }
  },

  getSession() {
    const raw = localStorage.getItem(CLAVE_SESION);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
};
