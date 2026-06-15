import { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 520 }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{title}</h2>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
