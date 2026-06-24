import { useState } from 'react';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { BackButton } from '../../../components/UI/BackButton';
import { Modal } from '../../../components/UI/Modal';
import { Ticket } from '../../../components/UI/Ticket';
import { useApp } from '../../../context/AppContext';
import './Shop.css';

const CATEGORIAS = ['Todos', 'Ropa', 'Accesorios', 'Suplementos'];

export default function Shop() {
  const { productos, carrito, totalCarrito, cantidadCarrito, agregarAlCarrito, quitarDelCarrito, actualizarCantidad, vaciarCarrito, finalizarCompra, usuarioActual } = useApp();
  const [categoria, setCategoria] = useState('Todos');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [ultimaCompra, setUltimaCompra] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const cantidadEnCarrito = (idProducto) => {
    const item = carrito.find(i => i.id === idProducto);
    return item ? item.cantidad : 0;
  };

  const incrementar = (producto) => {
    const cant = cantidadEnCarrito(producto.id);
    if (cant === 0) {
      agregarAlCarrito(producto);
    } else {
      const item = carrito.find(i => i.id === producto.id);
      if (item && cant < producto.stock) {
        actualizarCantidad(item.key, cant + 1);
      }
    }
  };

  const decrementar = (producto) => {
    const item = carrito.find(i => i.id === producto.id);
    if (item) actualizarCantidad(item.key, item.cantidad - 1);
  };

  const productosFiltrados = categoria === 'Todos' ? productos : productos.filter(p => p.categoria === categoria);

  const pagar = () => {
    setProcesando(true);
    setTimeout(() => {
      try {
        const compra = finalizarCompra(usuarioActual?.id || null);
        setUltimaCompra({ ...compra, usuarioNombre: usuarioActual?.nombre });
        setMostrarCarrito(false);
        setMostrarTicket(true);
      } catch (error) {
        console.error('Error al procesar la compra:', error);
        alert('Ocurrió un error al procesar el pago. Por favor intentá de nuevo.');
      } finally {
        setProcesando(false);
      }
    }, 2000);
  };

  return (
    <KioskLayout>
      <div className="shop-page page-enter">
        <div className="shop-content">
          <div className="shop-topbar">
            <BackButton />
            <button className="cart-btn" onClick={() => setMostrarCarrito(true)} id="btn-open-cart">
              <span className="cart-label">Carrito</span>
              {cantidadCarrito > 0 && <span className="cart-badge">{cantidadCarrito}</span>}
            </button>
          </div>

          <div className="shop-header">
            <h1>Tienda</h1>
          </div>

          <div className="products-grid">
            {productosFiltrados.map((p, i) => (
              <div key={p.id} className="product-card anim-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="product-emoji">{p.emoji}</div>
                <div className="product-img"><img src={p.imagen} alt="" /></div>
                <h3 className="product-name">{p.nombre}</h3>
                <p className="product-desc">{p.descripcion}</p>
                <div className="product-footer">
                  <span className="product-price">${p.precio.toLocaleString('es-AR')}</span>
                  <div className="product-qty-selector">
                    <button className="btn-qty-change" onClick={() => decrementar(p)} disabled={cantidadEnCarrito(p.id) === 0} id={`btn-dec-${p.id}`}>-</button>
                    <span className="product-qty-value">{cantidadEnCarrito(p.id)}</span>
                    <button className="btn-qty-change" onClick={() => incrementar(p)} disabled={cantidadEnCarrito(p.id) >= p.stock} id={`btn-inc-${p.id}`}>+</button>
                  </div>
                </div>
                {p.stock <= 5 && <div className="product-stock-warn">⚠️ Últimas {p.stock} unidades</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={mostrarCarrito} onClose={() => setMostrarCarrito(false)} title="Tu carrito" maxWidth={500}>
        {carrito.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛒</div>
            <p>El carrito está vacío</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {carrito.map(item => (
              <div key={item.key} className="cart-item">
                <span className="cart-item-emoji">{item.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.nombre}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>${item.precio.toLocaleString('es-AR')} c/u</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
                  <button className="btn-qty-change" onClick={() => actualizarCantidad(item.key, item.cantidad - 1)} id={`btn-cart-dec-${item.id}`}>-</button>
                  <span style={{ fontWeight: 800, minWidth: 20, textAlign: 'center' }}>{item.cantidad}</span>
                  <button className="btn-qty-change" onClick={() => actualizarCantidad(item.key, item.cantidad + 1)} disabled={item.cantidad >= item.stock} id={`btn-cart-inc-${item.id}`}>+</button>
                </div>
                <div style={{ fontWeight: 700, minWidth: 80, textAlign: 'right', marginRight: 12 }}>
                  ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                </div>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', fontSize: '1.2rem', padding: '4px 8px' }} onClick={() => quitarDelCarrito(item.key)} id={`btn-cart-del-${item.id}`} title="Eliminar item">
                  🗑️
                </button>
              </div>
            ))}
            <div className="divider" />
            <div className="cart-total">
              <span>Total</span>
              <span className="cart-total-amount">${totalCarrito.toLocaleString('es-AR')}</span>
            </div>
            {procesando ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--text-muted)' }}>Procesando...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" onClick={vaciarCarrito}>Vaciar</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={pagar} id="btn-checkout">Pagar</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={mostrarTicket} onClose={() => setMostrarTicket(false)} title="Comprobante de compra" maxWidth={420}>
        <Ticket type="purchase" data={ultimaCompra || {}} onClose={() => setMostrarTicket(false)} />
      </Modal>
    </KioskLayout>
  );
}
