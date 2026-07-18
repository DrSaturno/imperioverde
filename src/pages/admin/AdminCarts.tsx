import React, { useEffect, useState } from 'react';
import { dbService, CartSession, Product } from '../../services/db';
import { ShoppingCart, MessageSquare, AlertCircle, RefreshCw, Eye, X } from 'lucide-react';
import { getProductImage } from '../Shop';

export const AdminCarts: React.FC = () => {
  const [carts, setCarts] = useState<CartSession[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCart, setSelectedCart] = useState<CartSession | null>(null);

  useEffect(() => {
    fetchCarts();
    dbService.getProducts().then(setProducts);
  }, []);

  const fetchCarts = () => {
    setLoading(true);
    dbService.getCartSessions().then(res => {
      // Sort: active/abandoned carts with captured info first, then by date
      const sorted = res.sort((a, b) => {
        if (a.status !== b.status) {
          if (a.status === 'abandoned' || a.status === 'active') return -1;
          return 1;
        }
        return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
      });
      setCarts(sorted);
      setLoading(false);
    });
  };

  const getRecoveryWhatsAppLink = (cart: CartSession) => {
    const firstItem = cart.items_summary[0];
    const prod = firstItem ? products.find(p => p.id === firstItem.product_id) : null;
    const prodName = prod ? prod.name : 'insumos de cultivo';

    const msg = `Hola, notamos que dejaste algunos productos de Imperio Verde en tu carrito de compras (como "${prodName}"). ¿Tuviste algún inconveniente con el pago o necesitás ayuda técnica para verificar la compatibilidad de los abonos? Recordá que contamos con 3 cuotas sin interés y retiro inmediato en local.`;
    
    const contact = cart.contact_captured || '';
    const phoneClean = contact.replace(/\D/g, ''); 
    
    const targetPhone = phoneClean.length >= 10 ? phoneClean : '5491153841079';
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Calculate cart total amount based on current prices
  const getCartTotal = (cart: CartSession) => {
    return cart.items_summary.reduce((sum, item) => {
      const p = products.find(prod => prod.id === item.product_id);
      const price = p ? (p.promotional_price || p.price) : 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header toolbar */}
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>Seguimiento de Carros Abandonados</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Rastreo de intenciones de compra no concretadas y plantillas de recuperación WhatsApp.</p>
        </div>

        <button 
          onClick={fetchCarts} 
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={16} /> Refrescar Sesiones
        </button>
      </div>

      {/* Cart list panel */}
      <div className="glass-card" style={{ padding: '0px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '16px' }}>Token Sesión</th>
              <th style={{ padding: '16px' }}>Contacto Capturado</th>
              <th style={{ padding: '16px' }}>Última Actividad</th>
              <th style={{ padding: '16px' }}>Productos Carro</th>
              <th style={{ padding: '16px' }}>Total Estimado</th>
              <th style={{ padding: '16px' }}>Estado</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando sesiones…</td>
              </tr>
            ) : carts.length > 0 ? (
              carts.map(c => {
                const itemsList = c.items_summary.map(item => {
                  const p = products.find(prod => prod.id === item.product_id);
                  return p ? `${item.quantity}x ${p.name}` : `${item.quantity}x Insumo`;
                }).join(', ');

                const isAbandoned = c.status === 'active' && (Date.now() - new Date(c.last_activity).getTime() > 15 * 60 * 1000);
                const statusLabel = isAbandoned ? 'abandoned' : c.status;

                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="tr-row">
                    <td style={{ padding: '14px', color: 'var(--text-muted)' }}>{c.session_token.slice(-10)}</td>
                    <td style={{ padding: '14px', fontWeight: 600 }}>{c.contact_captured || '-'}</td>
                    <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{new Date(c.last_activity).toLocaleString('es-AR')}</td>
                    <td style={{ padding: '14px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={itemsList}>
                      {itemsList || 'Vacío'}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 700 }}>${getCartTotal(c).toLocaleString()}</td>
                    <td style={{ padding: '14px' }}>
                      <span className={`badge ${
                        statusLabel === 'converted' 
                          ? 'badge-green' 
                          : 'badge-yellow'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {statusLabel === 'converted' ? 'Convertido' : 'Abandonado'}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          onClick={() => setSelectedCart(c)} 
                          className="btn btn-outline"
                          style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> Ver Detalle
                        </button>

                        {(statusLabel === 'abandoned' || statusLabel === 'active') && c.items_summary.length > 0 && c.contact_captured ? (
                          <a 
                            href={getRecoveryWhatsAppLink(c)}
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-primary"
                            style={{ backgroundColor: '#25D366', color: '#fff', padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <MessageSquare size={12} /> Contactar
                          </a>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <AlertCircle size={20} style={{ display: 'block', margin: '0 auto 6px' }} />
                  Aún no hay registros de carritos de compras activos en el e-commerce.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAILED CART MODAL */}
      {selectedCart && (
        <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '600px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart color="var(--accent-neon)" size={20} />
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-title)', fontSize: '1.2rem' }}>
                  Detalle del Carrito Abandonado
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedCart(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Meta Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'rgba(0,0,0,0.15)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', fontSize: '0.8rem' }}>
              <span><strong>Token Sesión:</strong> {selectedCart.session_token}</span>
              <span><strong>Contacto Capturado:</strong> {selectedCart.contact_captured || 'No registrado aún'}</span>
              <span><strong>Última Actividad:</strong> {new Date(selectedCart.last_activity).toLocaleString('es-AR')}</span>
              <span><strong>Estado de Conversión:</strong> <span style={{ color: selectedCart.status === 'converted' ? 'var(--accent-neon)' : 'var(--action-yellow)', fontWeight: 700 }}>{selectedCart.status.toUpperCase()}</span></span>
            </div>

            {/* Items Breakdowns */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px', color: '#fff' }}>Productos en el Carrito:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedCart.items_summary.length > 0 ? (
                  selectedCart.items_summary.map((item, idx) => {
                    const p = products.find(prod => prod.id === item.product_id);
                    const itemPrice = p ? (p.promotional_price || p.price) : 0;
                    const fallbackImg = getProductImage({ image_url: p?.image_url, category: p?.category });
                    return (
                      <div key={idx} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)', padding: '10px 16px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <img 
                            src={fallbackImg} 
                            alt="item" 
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-glass)' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p?.name || 'Insumo de Cultivo'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Cód: {item.product_id.slice(0, 5)} • Marca: {p?.brand || 'Varios'}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 700 }}>${(itemPrice * item.quantity).toLocaleString()}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.quantity}x de ${itemPrice.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '10px', textAlign: 'center' }}>Este carro no contiene ítems.</div>
                )}
              </div>
            </div>

            {/* Total value */}
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '10px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Monto Total del Carrito:</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-neon)', fontFamily: 'var(--font-title)' }}>
                ${getCartTotal(selectedCart).toLocaleString()}
              </span>
            </div>

            {/* Recovery action inside modal */}
            {selectedCart.status === 'abandoned' && selectedCart.contact_captured && (
              <a 
                href={getRecoveryWhatsAppLink(selectedCart)} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-primary" 
                style={{ backgroundColor: '#25D366', color: '#fff', padding: '12px', textAlign: 'center', width: '100%', marginTop: '10px', fontWeight: 700 }}
              >
                💬 Recuperar por WhatsApp
              </a>
            )}

          </div>
        </div>
      )}

      <style>{`
        .tr-row:hover {
          background-color: rgba(255,255,255,0.01) !important;
        }
      `}</style>
    </div>
  );
};
