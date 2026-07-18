import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { dbService, Product } from '../services/db';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, rawTotal, totalAmount, totalSavings, addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    dbService.getProducts().then(setAllProducts);
  }, []);

  const handleCheckoutRedirect = () => {
    if (cart.length === 0) return;
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <ShoppingBag size={64} style={{ color: 'var(--text-muted)' }} />
        <div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)', marginBottom: '8px' }}>Tu carrito está vacío</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Aún no has agregado ningún insumo o kit de cultivo a tu compra.</p>
        </div>
        <Link to="/productos" className="btn btn-primary">Ir a la Tienda</Link>
      </div>
    );
  }

  return (
    <div className="container">
      
      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '30px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'var(--accent-neon)' }}>Inicio</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)' }}>Carrito de Compras</span>
      </div>

      <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-title)', fontWeight: 800, marginBottom: '40px' }}>Tu Carrito</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px' }} className="cart-split">
        
        {/* Left Column: Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cart.map(item => (
            <div key={item.product.id} className="glass-card" style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', padding: '20px', gap: '20px' }}>
              
              {/* Product Info */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '2rem', backgroundColor: 'rgba(0,0,0,0.15)', width: '50px', height: '50px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.product.category === 'Fertilizantes' && '🧪'}
                  {item.product.category === 'Ventilación y Clima' && '💨'}
                  {item.product.category === 'Medición' && '📊'}
                  {item.product.category === 'Sustratos y Medios' && '🪨'}
                  {item.product.category === 'Parafernalia' && '🦁'}
                  {item.product.category === 'Macetas' && '🪴'}
                  {item.product.category === 'Riego' && '💧'}
                  {item.product.category === 'Control de Plagas' && '🐛'}
                  {item.product.category === 'Jardinería' && '🛠️'}
                  {item.product.category === 'Cosecha y Secado' && '✂️'}
                  {item.product.category === 'Iluminación' && '💡'}
                  {item.product.category === 'Accesorios' && '⚙️'}
                </span>
                <div>
                  <Link to={`/productos/${item.product.category.toLowerCase()}/${item.product.id}`} style={{ fontWeight: 700, fontSize: '0.95rem' }} className="nav-link">
                    {item.product.name}
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.product.brand}</div>
                </div>
              </div>

              {/* Controls and prices */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
                
                {/* Quantity input */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label={`Restar unidad de ${item.product.name}`} style={{ padding: '4px 12px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>-</button>
                  <span style={{ width: '30px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label={`Sumar unidad de ${item.product.name}`} style={{ padding: '4px 12px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>+</button>
                </div>

                {/* Subtotal */}
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    ${((item.product.promotional_price || item.product.price) * item.quantity).toLocaleString()}
                  </div>
                  {item.product.promotional_price && (
                    <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <button onClick={() => removeFromCart(item.product.id)} aria-label={`Eliminar ${item.product.name} del carrito`} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition-smooth)' }} className="trash-hover">
                  <Trash2 size={18} aria-hidden="true" />
                </button>

              </div>

            </div>
          ))}

          {/* Complementary cheap products bump cross-sell */}
          {(() => {
            const cheapSuggestions = allProducts
              .filter(p => {
                const isAlreadyInCart = cart.some(item => item.product.id === p.id);
                const price = p.promotional_price || p.price;
                return !isAlreadyInCart && price > 0 && price <= 15000 && p.stock > 0;
              })
              .slice(0, 4);

            if (cheapSuggestions.length === 0) return null;

            return (
              <div className="glass-card" style={{ marginTop: '30px', borderTop: '4px solid var(--accent-neon)' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '6px', color: 'var(--accent-neon)' }}>⚡ Completa tu cultivo (Ofertas Especiales)</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Agrega complementos esenciales recomendados por menos de $15.000 con un solo clic.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
                  {cheapSuggestions.map(item => {
                    const price = item.promotional_price || item.price;
                    return (
                      <div key={item.id} style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                        <span style={{ fontSize: '1.25rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '4px' }}>
                          {item.category === 'Macetas' && '🪴'}
                          {item.category === 'Fertilizantes' && '🧪'}
                          {item.category === 'Medición' && '📊'}
                          {item.category === 'Riego' && '💧'}
                          {item.category === 'Control de Plagas' && '🐛'}
                          {item.category === 'Parafernalia' && '🦁'}
                          {item.category === 'Ventilación y Clima' && '💨'}
                          {item.category === 'Sustratos y Medios' && '🪨'}
                          {item.category === 'Accesorios' && '⚙️'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>{item.name}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{item.brand}</div>
                        </div>
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--action-yellow)' }}>${price.toLocaleString()}</span>
                          <button 
                            onClick={() => addToCart(item, 1).then(() => showToast(`"${item.name}" agregado al carrito`))} 
                            className="btn btn-primary" 
                            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                          >
                            + Agregar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Column: Order totals */}
        <div>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', marginBottom: '10px' }}>Resumen del Pedido</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal ({cart.reduce((sum, i) => sum + i.quantity, 0)} items):</span>
                <span>${rawTotal.toLocaleString()}</span>
              </div>
              {totalSavings > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-neon)', fontWeight: 600 }}>
                  <span>Ahorro obtenido:</span>
                  <span>-${totalSavings.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Envío:</span>
                <span>Calculado en checkout</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
              <span style={{ fontWeight: 700 }}>Total a Pagar:</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-neon)', fontFamily: 'var(--font-title)' }}>
                  ${totalAmount.toLocaleString()}
                </div>
                {totalSavings > 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--action-yellow)' }}>
                    ¡Ahorraste ${totalSavings.toLocaleString()} en esta compra!
                  </span>
                )}
              </div>
            </div>

            <button onClick={handleCheckoutRedirect} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 700 }}>
              Continuar al Pago <ArrowRight size={16} />
            </button>

            {/* Quick security trust */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
              <ShieldCheck size={16} color="var(--accent-neon)" />
              <span>Transacciones seguras mediante Mercado Pago</span>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        .trash-hover:hover {
          color: #ef5350 !important;
        }
        @media (max-width: 900px) {
          .cart-split {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
        }
      `}</style>
    </div>
  );
};
