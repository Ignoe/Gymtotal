import { useState } from 'react';
import { KioskLayout } from '../components/Layout/KioskLayout';
import { BackButton } from '../components/UI/BackButton';
import { Modal } from '../components/UI/Modal';
import { Ticket } from '../components/UI/Ticket';
import { useApp } from '../context/AppContext';
import './Shop.css';

const CATS = ['Todos', 'Ropa', 'Accesorios', 'Suplementos'];

export default function Shop() {
  const { products, cart, cartTotal, cartCount, addToCart, removeFromCart, clearCart, checkout, currentUser } = useApp();
  const [cat, setCat] = useState('Todos');
  const [showCart, setShowCart] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [lastPurchase, setLastPurchase] = useState(null);
  const [processing, setProcessing] = useState(false);

  const filtered = cat === 'Todos' ? products : products.filter(p => p.categoria === cat);

  const handleCheckout = () => {
    setProcessing(true);
    setTimeout(() => {
      const purchase = checkout(currentUser?.id || null);
      setLastPurchase({ ...purchase, usuarioNombre: currentUser?.nombre });
      setProcessing(false);
      setShowCart(false);
      setShowTicket(true);
    }, 1800);
  };

  return (
    <KioskLayout>
      <div className="shop-page page-enter">
        <div className="shop-content">
          <div className="shop-topbar">
            <BackButton />
            <button className="cart-btn" onClick={() => setShowCart(true)} id="btn-open-cart">
              🛍️
              <span className="cart-label">Carrito</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>

          <div className="shop-header">
            <div style={{ fontSize: '3rem' }}>🛍️</div>
            <h1>Tienda GymTotal</h1>
            <p>Ropa, accesorios y suplementos</p>
          </div>

          <div className="shop-cats">
            {CATS.map(c => (
              <button key={c} className={`cat-chip ${cat === c ? 'cat-active' : ''}`} onClick={() => setCat(c)} id={`btn-cat-${c}`}>
                {c}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filtered.map((p, i) => (
              <div key={p.id} className="product-card anim-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="product-emoji">{p.emoji}</div>
                <div className="product-cat">{p.categoria}</div>
                <h3 className="product-name">{p.nombre}</h3>
                <p className="product-desc">{p.descripcion}</p>
                <div className="product-footer">
                  <span className="product-price">${p.precio.toLocaleString('es-AR')}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => addToCart(p)} id={`btn-add-${p.id}`}>
                    + Agregar
                  </button>
                </div>
                {p.stock <= 5 && <div className="product-stock-warn">⚠️ Últimas {p.stock} unidades</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      <Modal isOpen={showCart} onClose={() => setShowCart(false)} title="Tu carrito" maxWidth={500}>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛒</div>
            <p>El carrito está vacío</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cart.map(item => (
              <div key={item.key} className="cart-item">
                <span className="cart-item-emoji">{item.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.nombre}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>x{item.cantidad} · ${(item.precio * item.cantidad).toLocaleString('es-AR')}</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => removeFromCart(item.key)}>✕</button>
              </div>
            ))}
            <div className="divider" />
            <div className="cart-total">
              <span>Total</span>
              <span className="cart-total-amount">${cartTotal.toLocaleString('es-AR')}</span>
            </div>
            {processing ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--text-muted)' }}>Procesando...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" onClick={clearCart}>Vaciar</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleCheckout} id="btn-checkout">
                  💳 Pagar ${cartTotal.toLocaleString('es-AR')}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Ticket Modal */}
      <Modal isOpen={showTicket} onClose={() => setShowTicket(false)} title="Comprobante de compra" maxWidth={420}>
        <Ticket type="purchase" data={lastPurchase || {}} onClose={() => setShowTicket(false)} />
      </Modal>
    </KioskLayout>
  );
}
