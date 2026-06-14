import { createContext, useContext, useState, useEffect } from 'react';
import usersData from '../data/users.json';
import productsData from '../data/products.json';
import assistanceData from '../data/assistance_requests.json';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  users: 'gymtotal_users',
  assistance: 'gymtotal_assistance',
  purchases: 'gymtotal_purchases',
};

function loadOrInit(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function persist(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => loadOrInit(STORAGE_KEYS.users, usersData));
  const [assistance, setAssistance] = useState(() => loadOrInit(STORAGE_KEYS.assistance, assistanceData));
  const [purchases, setPurchases] = useState(() => loadOrInit(STORAGE_KEYS.purchases, []));
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { persist(STORAGE_KEYS.users, users); }, [users]);
  useEffect(() => { persist(STORAGE_KEYS.assistance, assistance); }, [assistance]);
  useEffect(() => { persist(STORAGE_KEYS.purchases, purchases); }, [purchases]);

  // ── User CRUD ──────────────────────────────────────────────────────────────
  const findUserByDni = (dni) =>
    users.find((u) => u.dni === dni.trim()) || null;

  const findUserById = (id) =>
    users.find((u) => u.id === id) || null;

  const addUser = (userData) => {
    const newUser = {
      id: `USR-${String(Date.now()).slice(-6)}`,
      habilitado: true,
      saldo: 0,
      rutina: [],
      historialPagos: [],
      fechaAlta: new Date().toISOString().slice(0, 10),
      ...userData,
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id, changes) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...changes } : u))
    );
  };

  const toggleUserStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, habilitado: !u.habilitado } : u))
    );
  };

  const addPaymentToUser = (userId, payment) => {
    const newPayment = {
      id: `PAY-${String(Date.now()).slice(-6)}`,
      fecha: new Date().toISOString().slice(0, 10),
      metodo: 'terminal',
      ...payment,
    };
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, historialPagos: [...(u.historialPagos || []), newPayment], saldo: 0 }
          : u
      )
    );
    return newPayment;
  };

  const saveRoutine = (userId, routine) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, rutina: routine } : u))
    );
  };

  // ── Assistance ─────────────────────────────────────────────────────────────
  const addAssistanceRequest = (request) => {
    const newReq = {
      id: `AST-${String(Date.now()).slice(-6)}`,
      fecha: new Date().toISOString(),
      estado: 'pendiente',
      atendidoPor: null,
      ...request,
    };
    setAssistance((prev) => [...prev, newReq]);
    return newReq;
  };

  const updateAssistance = (id, changes) => {
    setAssistance((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...changes } : a))
    );
  };

  // ── Cart & Shop ────────────────────────────────────────────────────────────
  const addToCart = (product, options = {}) => {
    setCart((prev) => {
      const key = `${product.id}-${JSON.stringify(options)}`;
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...product, key, cantidad: 1, options }];
    });
  };

  const removeFromCart = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => setCart([]);

  const checkout = (userId) => {
    const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    const purchase = {
      id: `COMP-${String(Date.now()).slice(-6)}`,
      fecha: new Date().toISOString(),
      usuarioId: userId || 'anonimo',
      items: [...cart],
      total,
    };
    setPurchases((prev) => [...prev, purchase]);
    clearCart();
    return purchase;
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <AppContext.Provider
      value={{
        // Data
        users,
        products: productsData,
        assistance,
        purchases,
        cart,
        cartTotal,
        cartCount,
        currentUser,
        setCurrentUser,
        // User ops
        findUserByDni,
        findUserById,
        addUser,
        updateUser,
        toggleUserStatus,
        addPaymentToUser,
        saveRoutine,
        // Assistance ops
        addAssistanceRequest,
        updateAssistance,
        // Shop ops
        addToCart,
        removeFromCart,
        clearCart,
        checkout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
