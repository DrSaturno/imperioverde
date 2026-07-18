import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { dbService, OrderItem, Product } from '../services/db';
import { ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { getProductImage } from './Shop';

export const Checkout: React.FC = () => {
  const { cart, sessionToken, totalAmount, clearCart, setContactInfo, addToCart } = useCart();
  const { showToast } = useToast();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    dbService.getProducts().then(setAllProducts);
  }, []);
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('pickup');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Processing States
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  const handleContactChange = (field: 'email' | 'phone', val: string) => {
    if (field === 'email') {
      setEmail(val);
      if (val.includes('@')) setContactInfo(val);
    } else {
      setPhone(val);
      if (val.length > 7) setContactInfo(val);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    dbService.logEvent(sessionToken, 'checkout_start', { total_amount: totalAmount });

    const orderItems: OrderItem[] = cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.promotional_price || item.product.price
    }));

    // 1. Send Order Creation to DB
    setTimeout(async () => {
      const newOrder = await dbService.createOrder({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        total_amount: totalAmount,
        payment_status: 'paid', // simulated approval
        shipping_method: shippingMethod,
        shipping_address: shippingMethod === 'delivery' ? shippingAddress : 'Retiro en Grow Sucursal',
        payment_method: paymentMethod === 'tarjeta' ? 'Tarjeta de Crédito (Simulada)' : 'Transferencia Bancaria',
        items: orderItems
      });

      if (newOrder) {
        dbService.logEvent(sessionToken, 'checkout_complete', { order_id: newOrder.id, amount: totalAmount });
        await dbService.markCartAsConverted(sessionToken);
        setOrderSuccess(newOrder);
        await clearCart();
      } else {
        showToast('Hubo un error de stock en los productos seleccionados. Verificá tu carrito.', 'error');
        navigate('/carrito');
      }
      setLoading(false);
    }, 1500);
  };

  // SUCCESS VIRTUAL STATE
  if (orderSuccess) {
    const waMessage = `Hola Imperio Verde, completé mi pedido en la web con código: ${orderSuccess.id}. Quería coordinar los detalles de entrega/retiro.`;
    const waLink = `https://wa.me/5491153841079?text=${encodeURIComponent(waMessage)}`;

    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '40px', borderTop: '6px solid var(--accent-neon)' }}>
          <CheckCircle2 size={64} style={{ color: 'var(--accent-neon)', display: 'block', margin: '0 auto' }} />
          <div>
            <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>¡Pedido Realizado con Éxito!</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Gracias por confiar en Imperio Verde Grow Shop. Tu stock ya fue reservado.</p>
          </div>

          <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: 'var(--radius-sm)', textAlign: 'left', fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '8px' }}><strong>Código de Pedido:</strong> {orderSuccess.id}</div>
            <div style={{ marginBottom: '8px' }}><strong>Cliente:</strong> {orderSuccess.customer_name} ({orderSuccess.customer_email})</div>
            <div style={{ marginBottom: '8px' }}><strong>Monto Total:</strong> ${orderSuccess.total_amount.toLocaleString()}</div>
            <div style={{ marginBottom: '8px' }}><strong>Método de Entrega:</strong> {orderSuccess.shipping_method === 'pickup' ? 'Retiro en Grow Sucursal (Avenida Triunvirato 4135, Local 5 y 7)' : `Envío a domicilio: ${orderSuccess.shipping_address}`}</div>
            <div><strong>Estado de Pago:</strong> Aprobado (Simulado)</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a 
              href={waLink} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-primary"
              style={{ backgroundColor: '#25D366', color: '#fff', display: 'inline-flex', justifyContent: 'center' }}
            >
              Coordinar Entrega por WhatsApp
            </a>
            <Link to="/" className="btn btn-outline">Volver al Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      
      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '30px', alignItems: 'center' }}>
        <Link to="/carrito" style={{ color: 'var(--accent-neon)', display: 'flex', alignItems: 'center', gap: '4px' }}><ArrowLeft size={14} /> Volver al Carro</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)' }}>Checkout</span>
      </div>

      <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-title)', fontWeight: 800, marginBottom: '40px' }}>Pago y Envío</h1>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No hay ítems en tu carro.</p>
          <Link to="/productos" className="btn btn-primary">Ir a la Tienda</Link>
        </div>
      ) : (
        <form onSubmit={handleCheckoutSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px' }} className="checkout-split">
          
          {/* Left Column: Form Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* 1. Datos Personales */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>1. Datos del Cliente</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="checkout-name" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nombre Completo *</label>
                  <input id="checkout-name" type="text" autoComplete="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="checkout-phone" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Teléfono Celular *</label>
                  <input id="checkout-phone" type="tel" inputMode="tel" autoComplete="tel" name="tel" placeholder="1153841079" value={phone} onChange={(e) => handleContactChange('phone', e.target.value)} className="input" required />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="checkout-email" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email *</label>
                <input id="checkout-email" type="email" autoComplete="email" name="email" spellCheck={false} placeholder="email@correo.com" value={email} onChange={(e) => handleContactChange('email', e.target.value)} className="input" required />
              </div>
            </div>

            {/* 2. Método de Entrega */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>2. Método de Entrega</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: 'var(--radius-sm)', border: shippingMethod === 'pickup' ? '1px solid var(--accent-neon)' : '1px solid var(--border-glass)' }}>
                  <input type="radio" name="shipping" checked={shippingMethod === 'pickup'} onChange={() => setShippingMethod('pickup')} style={{ accentColor: 'var(--accent-neon)' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Retiro en local</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Gratis (Avenida Triunvirato 4135, Local 5 y 7)</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: 'var(--radius-sm)', border: shippingMethod === 'delivery' ? '1px solid var(--accent-neon)' : '1px solid var(--border-glass)' }}>
                  <input type="radio" name="shipping" checked={shippingMethod === 'delivery'} onChange={() => setShippingMethod('delivery')} style={{ accentColor: 'var(--accent-neon)' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Envío a Domicilio</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Correo Argentino / Andreani</div>
                  </div>
                </label>
              </div>
              {shippingMethod === 'delivery' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="checkout-address" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dirección de Entrega Completa (Calle, Altura, Localidad, CP) *</label>
                  <input id="checkout-address" type="text" autoComplete="street-address" name="street-address" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} className="input" placeholder="Av. Corrientes 1234, 4° B, CABA…" required />
                </div>
              )}
            </div>

            {/* 3. Pasarela de Pagos (Simulada) */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>3. Pasarela de Pagos</h3>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
                <button type="button" onClick={() => setPaymentMethod('tarjeta')} className="btn" style={{ flex: 1, border: paymentMethod === 'tarjeta' ? '1px solid var(--accent-neon)' : '1px solid var(--border-glass)', backgroundColor: paymentMethod === 'tarjeta' ? 'rgba(0,230,118,0.05)' : 'transparent', color: 'var(--text-primary)' }}>💳 Tarjeta de Crédito</button>
                <button type="button" onClick={() => setPaymentMethod('transferencia')} className="btn" style={{ flex: 1, border: paymentMethod === 'transferencia' ? '1px solid var(--accent-neon)' : '1px solid var(--border-glass)', backgroundColor: paymentMethod === 'transferencia' ? 'rgba(0,230,118,0.05)' : 'transparent', color: 'var(--text-primary)' }}>🏦 Transferencia / Efectivo</button>
              </div>

              {paymentMethod === 'tarjeta' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label htmlFor="checkout-card-number" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Número de Tarjeta (Simulado) *</label>
                    <input id="checkout-card-number" type="text" inputMode="numeric" autoComplete="cc-number" spellCheck={false} placeholder="4539 0000 0000 0000" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="input" required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label htmlFor="checkout-card-name" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nombre impreso en Tarjeta *</label>
                    <input id="checkout-card-name" type="text" autoComplete="cc-name" placeholder="JUAN PEREZ" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} className="input" required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label htmlFor="checkout-card-expiry" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vencimiento (MM/AA) *</label>
                      <input id="checkout-card-expiry" type="text" inputMode="numeric" autoComplete="cc-exp" placeholder="12/28" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="input" required />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label htmlFor="checkout-card-cvv" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CVV / Cód. Seguridad *</label>
                      <input id="checkout-card-cvv" type="text" inputMode="numeric" autoComplete="cc-csc" spellCheck={false} placeholder="123" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} className="input" required />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Al finalizar tu pedido, el sistema generará los detalles del CBU / Alias de la cuenta bancaria de Imperio Verde para que realices la transferencia. Deberás enviar el comprobante de pago por WhatsApp para despachar.
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Checkout items summary */}
          <div>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', marginBottom: '10px' }}>Resumen de Compra</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', maxHeight: '180px', overflowY: 'auto', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
                {cart.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                      {item.quantity}x {item.product.name}
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      ${((item.product.promotional_price || item.product.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '1.1rem' }}>
                <span style={{ fontWeight: 700 }}>Total a abonar:</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-neon)', fontFamily: 'var(--font-title)' }}>
                  ${totalAmount.toLocaleString()}
                </span>
              </div>

              {loading ? (
                <button type="button" className="btn btn-primary" style={{ width: '100%', padding: '14px', display: 'flex', justifyItems: 'center', justifyContent: 'center', gap: '10px' }} disabled>
                  <RefreshCw size={18} className="pulse-button" /> Procesando pago seguro…
                </button>
              ) : (
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 700 }}>
                  Pagar
                </button>
              )}

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={14} color="var(--accent-neon)" />
                <span>SSL Encrypted Connection • 100% Secure</span>
              </div>

            </div>

            {/* Complementary cheap products bump cross-sell */}
            {(() => {
              const cheapSuggestions = allProducts
                .filter(p => {
                  const isAlreadyInCart = cart.some(item => item.product.id === p.id);
                  const price = p.promotional_price || p.price;
                  return !isAlreadyInCart && price > 0 && price <= 15000 && p.stock > 0;
                })
                .slice(0, 3);

              if (cheapSuggestions.length === 0) return null;

              return (
                <div className="glass-card" style={{ marginTop: '20px', borderTop: '4px solid var(--accent-neon)' }}>
                  <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '0.95rem', marginBottom: '4px', color: 'var(--accent-neon)' }}>⚡ Complementos sugeridos</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Añadí complementos de bajo costo a tu orden:</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {cheapSuggestions.map(item => {
                      const price = item.promotional_price || item.price;
                      return (
                        <div key={item.id} style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', border: '1px solid rgba(255,255,255,0.02)' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ backgroundColor: '#f7f8f6', width: '28px', height: '28px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                              <img src={getProductImage(item)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.75rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>{item.name}</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>${price.toLocaleString()}</div>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => addToCart(item, 1).then(() => showToast(`"${item.name}" agregado al pedido`))} 
                            className="btn btn-primary" 
                            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                          >
                            + Agregar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

        </form>
      )}

      <style>{`
        @media (max-width: 900px) {
          .checkout-split {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
        }
      `}</style>
    </div>
  );
};
