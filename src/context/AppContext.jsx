import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
//import { sembrarBaseSiEstaVacia } from '../utils/dbSeeder';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [compras, setCompras] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    let desuscripciones = [];

    async function init() {
      //await sembrarBaseSiEstaVacia();
      if (!activo) return;

      desuscripciones.push(
        onSnapshot(collection(db, 'users'), (snap) => {
          setUsuarios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }, (err) => console.error('Error usuarios:', err))
      );

      desuscripciones.push(
        onSnapshot(collection(db, 'products'), (snap) => {
          setProductos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }, (err) => console.error('Error productos:', err))
      );

      desuscripciones.push(
        onSnapshot(collection(db, 'assistance'), (snap) => {
          setAsistencias(snap.docs.map((d) => d.data()));
        }, (err) => console.error('Error asistencias:', err))
      );

      desuscripciones.push(
        onSnapshot(collection(db, 'purchases'), (snap) => {
          setCompras(snap.docs.map((d) => d.data()));
        }, (err) => console.error('Error compras:', err))
      );

      desuscripciones.push(
        onSnapshot(collection(db, 'plans'), (snap) => {
          const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          lista.sort((a, b) => (a.duracionDias || 0) - (b.duracionDias || 0));
          setPlanes(lista);
        }, (err) => console.error('Error planes:', err))
      );

      setCargando(false);
    }

    init();
    return () => {
      activo = false;
      desuscripciones.forEach((unsub) => unsub());
    };
  }, []);

  const buscarPorDni = (dni) =>
    usuarios.find((u) => u.dni === dni.trim()) || null;

  const buscarPorId = (id) =>
    usuarios.find((u) => u.id === id) || null;

  const agregarUsuario = (datos) => {
    const id = `USR-${String(Date.now()).slice(-6)}`;
    const nuevoUsuario = {
      id,
      habilitado: true,
      saldo: 0,
      rutina: [],
      historialPagos: [],
      fechaAlta: new Date().toISOString().slice(0, 10),
      ...datos,
    };
    setDoc(doc(db, 'users', id), nuevoUsuario).catch((err) =>
      console.error('Error al agregar usuario:', err)
    );
    return nuevoUsuario;
  };

  const actualizarUsuario = (id, cambios) => {
    updateDoc(doc(db, 'users', id), cambios).catch((err) =>
      console.error('Error al actualizar usuario:', err)
    );
  };

  const cambiarEstadoUsuario = (id) => {
    const usuario = usuarios.find((u) => u.id === id);
    if (usuario) {
      updateDoc(doc(db, 'users', id), { habilitado: !usuario.habilitado }).catch((err) =>
        console.error('Error al cambiar estado del usuario:', err)
      );
    }
  };

  const agregarPagoAUsuario = (idUsuario, pago) => {
    const usuario = usuarios.find((u) => u.id === idUsuario);
    if (!usuario) return null;

    const nuevoPago = {
      id: `PAY-${String(Date.now()).slice(-6)}`,
      fecha: new Date().toISOString().slice(0, 10),
      metodo: 'terminal',
      ...pago,
    };

    updateDoc(doc(db, 'users', idUsuario), {
      historialPagos: [...(usuario.historialPagos || []), nuevoPago],
      saldo: 0
    }).catch((err) => console.error('Error al guardar pago:', err));

    return nuevoPago;
  };

  const guardarRutina = (idUsuario, rutina) => {
    updateDoc(doc(db, 'users', idUsuario), { rutina }).catch((err) =>
      console.error('Error al guardar rutina:', err)
    );
  };

  const agregarSolicitudAsistencia = (solicitud) => {
    const id = `AST-${String(Date.now()).slice(-6)}`;
    const nuevaSolicitud = {
      id,
      fecha: new Date().toISOString(),
      estado: 'pendiente',
      atendidoPor: null,
      ...solicitud,
    };
    setDoc(doc(db, 'assistance', id), nuevaSolicitud).catch((err) =>
      console.error('Error al agregar solicitud:', err)
    );
    return nuevaSolicitud;
  };

  const actualizarAsistencia = (id, cambios) => {
    updateDoc(doc(db, 'assistance', id), cambios).catch((err) =>
      console.error('Error al actualizar asistencia:', err)
    );
  };

  const agregarAlCarrito = (producto, opciones = {}) => {
    if (producto.stock <= 0) return;
    setCarrito((prev) => {
      const clave = `${producto.id}-${JSON.stringify(opciones)}`;
      const existente = prev.find((item) => item.key === clave);
      if (existente) {
        if (existente.cantidad >= producto.stock) return prev;
        return prev.map((item) =>
          item.key === clave ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...producto, key: clave, cantidad: 1, opciones }];
    });
  };

  const quitarDelCarrito = (clave) => {
    setCarrito((prev) => prev.filter((item) => item.key !== clave));
  };

  const actualizarCantidad = (clave, cantidad) => {
    setCarrito((prev) => {
      if (cantidad <= 0) return prev.filter((item) => item.key !== clave);
      const item = prev.find((i) => i.key === clave);
      if (!item) return prev;
      return prev.map((i) =>
        i.key === clave ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i
      );
    });
  };

  const vaciarCarrito = () => setCarrito([]);

  const finalizarCompra = (idUsuario) => {
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    const id = `COMP-${String(Date.now()).slice(-6)}`;
    const compra = {
      id,
      fecha: new Date().toISOString(),
      usuarioId: idUsuario || 'anonimo',
      items: carrito.map(item => ({
        id: item.id || '',
        nombre: item.nombre || '',
        precio: item.precio || 0,
        cantidad: item.cantidad || 0
      })),
      total,
    };

    setDoc(doc(db, 'purchases', id), compra).catch((err) =>
      console.error('Error al guardar compra:', err)
    );

    carrito.forEach((item) => {
      if (!item.id) return;
      const nuevoStock = Math.max(0, (item.stock || 0) - item.cantidad);
      if (!isNaN(nuevoStock)) {
        updateDoc(doc(db, 'products', item.id), { stock: nuevoStock }).catch((err) =>
          console.error(`Error al actualizar stock de ${item.id}:`, err)
        );
      }
    });

    vaciarCarrito();
    return compra;
  };

  useEffect(() => {
    if (productos.length === 0 || carrito.length === 0) return;
    let cambio = false;
    const carritoActualizado = carrito.map((item) => {
      const enBd = productos.find((p) => p.id === item.id);
      if (enBd) {
        if (item.cantidad > enBd.stock) {
          cambio = true;
          return { ...item, cantidad: enBd.stock, stock: enBd.stock };
        }
        if (item.stock !== enBd.stock) {
          cambio = true;
          return { ...item, stock: enBd.stock };
        }
      }
      return item;
    }).filter((item) => item.cantidad > 0);

    if (cambio) setCarrito(carritoActualizado);
  }, [productos]);

  const totalCarrito = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const cantidadCarrito = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <AppContext.Provider
      value={{
        usuarios,
        productos,
        asistencias,
        compras,
        planes,
        carrito,
        totalCarrito,
        cantidadCarrito,
        usuarioActual,
        setUsuarioActual,
        cargando,
        buscarPorDni,
        buscarPorId,
        agregarUsuario,
        actualizarUsuario,
        cambiarEstadoUsuario,
        agregarPagoAUsuario,
        guardarRutina,
        agregarSolicitudAsistencia,
        actualizarAsistencia,
        agregarAlCarrito,
        quitarDelCarrito,
        actualizarCantidad,
        vaciarCarrito,
        finalizarCompra,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
