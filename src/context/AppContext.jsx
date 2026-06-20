import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { seedDatabaseIfEmpty } from '../utils/dbSeeder';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [assistance, setAssistance] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [plans, setPlans] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let unsubscribes = [];

    async function init() {
      // Seed if empty
      await seedDatabaseIfEmpty();

      if (!active) return;

      // Realtime subscription to Users
      const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setUsers(list);
      }, (err) => console.error('Error fetching users:', err));
      unsubscribes.push(unsubUsers);

      // Realtime subscription to Products
      const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setProducts(list);
      }, (err) => console.error('Error fetching products:', err));
      unsubscribes.push(unsubProducts);

      // Realtime subscription to Assistance Requests
      const unsubAssistance = onSnapshot(collection(db, 'assistance'), (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push(doc.data());
        });
        setAssistance(list);
      }, (err) => console.error('Error fetching assistance requests:', err));
      unsubscribes.push(unsubAssistance);

      // Realtime subscription to Purchases
      const unsubPurchases = onSnapshot(collection(db, 'purchases'), (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push(doc.data());
        });
        setPurchases(list);
      }, (err) => console.error('Error fetching purchases:', err));
      unsubscribes.push(unsubPurchases);

      // Realtime subscription to Plans
      const unsubPlans = onSnapshot(collection(db, 'plans'), (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        // Sort by duration in ascending order (Monthly -> Quarterly -> Yearly)
        list.sort((a, b) => (a.duracionDias || 0) - (b.duracionDias || 0));
        setPlans(list);
      }, (err) => console.error('Error fetching plans:', err));
      unsubscribes.push(unsubPlans);

      setLoading(false);
    }

    init();

    return () => {
      active = false;
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  // ── User CRUD ──────────────────────────────────────────────────────────────
  const findUserByDni = (dni) =>
    users.find((u) => u.dni === dni.trim()) || null;

  const findUserById = (id) =>
    users.find((u) => u.id === id) || null;

  const addUser = (userData) => {
    const id = `USR-${String(Date.now()).slice(-6)}`;
    const newUser = {
      id,
      habilitado: true,
      saldo: 0,
      rutina: [],
      historialPagos: [],
      fechaAlta: new Date().toISOString().slice(0, 10),
      ...userData,
    };
    
    setDoc(doc(db, 'users', id), newUser).catch((err) =>
      console.error('Error adding user to Firestore:', err)
    );
    
    return newUser;
  };

  const updateUser = (id, changes) => {
    updateDoc(doc(db, 'users', id), changes).catch((err) =>
      console.error('Error updating user in Firestore:', err)
    );
  };

  const toggleUserStatus = (id) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      updateDoc(doc(db, 'users', id), { habilitado: !user.habilitado }).catch((err) =>
        console.error('Error toggling user status in Firestore:', err)
      );
    }
  };

  const addPaymentToUser = (userId, payment) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return null;

    const newPayment = {
      id: `PAY-${String(Date.now()).slice(-6)}`,
      fecha: new Date().toISOString().slice(0, 10),
      metodo: 'terminal',
      ...payment,
    };

    updateDoc(doc(db, 'users', userId), {
      historialPagos: [...(user.historialPagos || []), newPayment],
      saldo: 0
    }).catch((err) => console.error('Error adding payment in Firestore:', err));

    return newPayment;
  };

  const saveRoutine = (userId, routine) => {
    updateDoc(doc(db, 'users', userId), { rutina: routine }).catch((err) =>
      console.error('Error saving routine in Firestore:', err)
    );
  };

  // ── Assistance ─────────────────────────────────────────────────────────────
  const addAssistanceRequest = (request) => {
    const id = `AST-${String(Date.now()).slice(-6)}`;
    const newReq = {
      id,
      fecha: new Date().toISOString(),
      estado: 'pendiente',
      atendidoPor: null,
      ...request,
    };
    
    setDoc(doc(db, 'assistance', id), newReq).catch((err) =>
      console.error('Error adding assistance request in Firestore:', err)
    );
    
    return newReq;
  };

  const updateAssistance = (id, changes) => {
    updateDoc(doc(db, 'assistance', id), changes).catch((err) =>
      console.error('Error updating assistance in Firestore:', err)
    );
  };

  // ── Cart & Shop ────────────────────────────────────────────────────────────
  const addToCart = (product, options = {}) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const key = `${product.id}-${JSON.stringify(options)}`;
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        if (existing.cantidad >= product.stock) return prev;
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

  const updateCartQty = (key, qty) => {
    setCart((prev) => {
      if (qty <= 0) {
        return prev.filter((item) => item.key !== key);
      }
      const item = prev.find((i) => i.key === key);
      if (!item) return prev;
      const targetQty = Math.min(qty, item.stock);
      return prev.map((i) =>
        i.key === key ? { ...i, cantidad: targetQty } : i
      );
    });
  };

  const clearCart = () => setCart([]);

  const checkout = (userId) => {
    const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    const id = `COMP-${String(Date.now()).slice(-6)}`;
    const purchase = {
      id,
      fecha: new Date().toISOString(),
      usuarioId: userId || 'anonimo',
      items: cart.map(item => ({
        id: item.id || '',
        nombre: item.nombre || '',
        precio: item.precio || 0,
        cantidad: item.cantidad || 0
      })),
      total,
    };
    
    setDoc(doc(db, 'purchases', id), purchase).catch((err) =>
      console.error('Error creating purchase in Firestore:', err)
    );

    // Update stock in Firestore for each purchased item
    cart.forEach((item) => {
      if (!item.id) return;
      const productRef = doc(db, 'products', item.id);
      const newStock = Math.max(0, (item.stock || 0) - item.cantidad);
      if (!isNaN(newStock)) {
        updateDoc(productRef, { stock: newStock }).catch((err) =>
          console.error(`Error updating stock for product ${item.id}:`, err)
        );
      }
    });
    
    clearCart();
    return purchase;
  };

  // Real-time cart stock synchronization
  useEffect(() => {
    if (products.length === 0 || cart.length === 0) return;
    let changed = false;
    const updatedCart = cart.map((item) => {
      const dbProd = products.find((p) => p.id === item.id);
      if (dbProd) {
        if (item.cantidad > dbProd.stock) {
          changed = true;
          return { ...item, cantidad: dbProd.stock, stock: dbProd.stock };
        }
        if (item.stock !== dbProd.stock) {
          changed = true;
          return { ...item, stock: dbProd.stock };
        }
      }
      return item;
    }).filter((item) => item.cantidad > 0);

    if (changed) {
      setCart(updatedCart);
    }
  }, [products]);

  const cartTotal = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <AppContext.Provider
      value={{
        // Data
        users,
        products,
        assistance,
        purchases,
        plans,
        cart,
        cartTotal,
        cartCount,
        currentUser,
        setCurrentUser,
        loading,
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
        updateCartQty,
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
