import { useState } from 'react';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { BackButton } from '../../../components/UI/BackButton';
import { Modal } from '../../../components/UI/Modal';
import { Ticket } from '../../../components/UI/Ticket';
import { useApp } from '../../../context/AppContext';
import './Shop.css';

const CATS = ['Todos', 'Ropa', 'Accesorios', 'Suplementos'];

export default function Shop() {
  const { products, cart, cartTotal, cartCount, addToCart, removeFromCart, updateCartQty, clearCart, checkout, currentUser } = useApp();
  const [cat, setCat] = useState('Todos');
  const [showCart, setShowCart] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [lastPurchase, setLastPurchase] = useState(null);
  const [processing, setProcessing] = useState(false);

  const getQuantityInCart = (productId) => {
    const item = cart.find(i => i.id === productId);
    return item ? item.cantidad : 0;
  };

  const handleIncrement = (product) => {
    const qty = getQuantityInCart(product.id);
    if (qty === 0) {
      addToCart(product);
    } else {
      const item = cart.find(i => i.id === product.id);
      if (item && qty < product.stock) {
        updateCartQty(item.key, qty + 1);
      }
    }
  };

  const handleDecrement = (product) => {
    const item = cart.find(i => i.id === product.id);
    if (item) {
      updateCartQty(item.key, item.cantidad - 1);
    }
  };

  const filtered = cat === 'Todos' ? products : products.filter(p => p.categoria === cat);

  const handleCheckout = () => {
    setProcessing(true);
    setTimeout(() => {
      try {
        const purchase = checkout(currentUser?.id || null);
        setLastPurchase({ ...purchase, usuarioNombre: currentUser?.nombre });
        setShowCart(false);
        setShowTicket(true);
      } catch (error) {
        console.error("Error during checkout:", error);
        alert("Ocurrió un error al procesar el pago. Por favor intenta de nuevo.");
      } finally {
        setProcessing(false);
      }
    }, 2000);
  };

  return (
    <KioskLayout>
      <div className="shop-page page-enter">
        <div className="shop-content">
          <div className="shop-topbar">
            <BackButton />
            <button className="cart-btn" onClick={() => setShowCart(true)} id="btn-open-cart">
              
              <span className="cart-label">Carrito</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>

          <div className="shop-header">
            {/* <div style={{ fontSize: '3rem' }}>🛍️</div> */}
            <h1>Tienda</h1>

          </div>

   

          <div className="products-grid">
            {filtered.map((p, i) => (
              <div key={p.id} className="product-card anim-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="product-emoji">{p.emoji}</div>
                <div className="product-img">
                  <img src={p.imagen} alt="" /></div>
               
                <h3 className="product-name">{p.nombre}</h3>
                <p className="product-desc">{p.descripcion}</p>
                <div className="product-footer">
                  <span className="product-price">${p.precio.toLocaleString('es-AR')}</span>
                  <div className="product-qty-selector">
                    <button
                      className="btn-qty-change"
                      onClick={() => handleDecrement(p)}
                      disabled={getQuantityInCart(p.id) === 0}
                      id={`btn-dec-${p.id}`}
                    >
                      -
                    </button>
                    <span className="product-qty-value">{getQuantityInCart(p.id)}</span>
                    <button
                      className="btn-qty-change"
                      onClick={() => handleIncrement(p)}
                      disabled={getQuantityInCart(p.id) >= p.stock}
                      id={`btn-inc-${p.id}`}
                    >
                      +
                    </button>
                  </div>
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
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>${item.precio.toLocaleString('es-AR')} c/u</p>
                </div>
                
                {/* Quantity Control inside the Cart */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
                  <button 
                    className="btn-qty-change" 
                    onClick={() => updateCartQty(item.key, item.cantidad - 1)}
                    id={`btn-cart-dec-${item.id}`}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 800, minWidth: 20, textAlign: 'center' }}>{item.cantidad}</span>
                  <button 
                    className="btn-qty-change" 
                    onClick={() => updateCartQty(item.key, item.cantidad + 1)}
                    disabled={item.cantidad >= item.stock}
                    id={`btn-cart-inc-${item.id}`}
                  >
                    +
                  </button>
                </div>

                <div style={{ fontWeight: 700, minWidth: 80, textAlign: 'right', marginRight: 12 }}>
                  ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                </div>

                <button 
                  className="btn btn-ghost btn-sm" 
                  style={{ color: 'var(--danger)', fontSize: '1.2rem', padding: '4px 8px' }} 
                  onClick={() => removeFromCart(item.key)}
                  id={`btn-cart-del-${item.id}`}
                  title="Eliminar item"
                >
                  🗑️
                </button>
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
                  Pagar 
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
