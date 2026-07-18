import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dbService, Kit } from '../services/db';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ChevronRight, ArrowRight, CheckCircle, MessageSquare, Info, ShieldAlert, Sparkles } from 'lucide-react';
import { getProductImage } from './Shop';

export const KitDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addKitToCart, sessionToken } = useCart();
  const { showToast } = useToast();
  const [kit, setKit] = useState<Kit | null>(null);

  useEffect(() => {
    if (!id) return;
    dbService.logEvent(sessionToken, 'kit_details_view', { kit_id: id });
    dbService.getKitById(id).then(res => {
      if (!res) navigate('/kits');
      else setKit(res);
    });
  }, [id, navigate, sessionToken]);

  if (!kit) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Cargando detalles del kit…</div>
      </div>
    );
  }

  const handlePurchase = async () => {
    const isAvailable = kit.products.every(kp => (kp.product?.stock || 0) >= kp.quantity);
    if (!isAvailable) {
      showToast('Alguno de los componentes del kit no posee stock suficiente en este momento.', 'error');
      return;
    }
    await addKitToCart(kit);
    showToast(`Componentes del "${kit.name}" agregados con descuento`);
    navigate('/carrito');
  };

  const getWhatsAppMessage = () => {
    const msg = `Hola Imperio Verde, estoy interesado en el "${kit.name}" y quiero verificar si se adapta a mi espacio y tipo de cultivo.`;
    return `https://wa.me/5491153841079?text=${encodeURIComponent(msg)}`;
  };

  const isAvailable = kit.products.every(kp => (kp.product?.stock || 0) >= kp.quantity);
  const rawSum = Math.round(kit.price / (1 - kit.discount_percentage / 100));
  const savings = rawSum - kit.price;

  return (
    <div className="container">
      
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '30px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'var(--accent-neon)' }}>Inicio</Link>
        <ChevronRight size={12} />
        <Link to="/kits" style={{ color: 'var(--accent-neon)' }}>Kits</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)' }}>{kit.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginBottom: '60px' }} className="kit-split">
        
        {/* Left Column: Kit general info & components list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ display: 'inline-flex', marginBottom: '8px' }}>
              <span className="badge badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> Kit de Cultivo Completo
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-title)', fontWeight: 800, marginTop: '4px' }}>
              {kit.name}
            </h1>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <span className="badge badge-green">Nivel: {kit.difficulty_level}</span>
              {kit.interests.map(int => (
                <span key={int} className="badge badge-violet" style={{ textTransform: 'capitalize' }}>{int}</span>
              ))}
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{kit.description}</p>

          {/* Breakdown List */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              Productos Incluidos en la Caja
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {kit.products.map(kp => (
                <div key={kp.product_id} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Link to={`/productos/${kp.product?.category.toLowerCase()}/${kp.product_id}`} style={{ position: 'relative', backgroundColor: '#f7f8f6', width: '44px', height: '44px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, display: 'block' }}>
                      {kp.product && <img src={getProductImage(kp.product)} alt={kp.product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} />}
                      <span style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--accent-neon)', color: '#030a06', fontWeight: 700, fontSize: '0.65rem', padding: '1px 4px', borderRadius: '4px 0 0 0' }}>
                        {kp.quantity}x
                      </span>
                    </Link>
                    <div>
                      <Link to={`/productos/${kp.product?.category.toLowerCase()}/${kp.product_id}`} style={{ fontWeight: 600, fontSize: '0.9rem' }} className="nav-link">
                        {kp.product?.name || 'Insumo'}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{kp.product?.brand} • {kp.product?.category}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      ${(kp.product ? kp.product.price * kp.quantity : 0).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: (kp.product?.stock || 0) >= kp.quantity ? 'var(--accent-neon)' : 'var(--text-muted)' }}>
                      {(kp.product?.stock || 0) >= kp.quantity ? 'En Stock' : 'Sin Stock'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Pricing card, checkout & dosage charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Pricing summary */}
          <div className="glass-card" style={{ border: '1px solid var(--action-yellow)', backgroundColor: 'rgba(255, 214, 0, 0.02)' }}>
            <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '6px' }}>
                <span>Valor Individual Total:</span>
                <span style={{ textDecoration: 'line-through' }}>${rawSum.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-neon)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Descuento del Kit ({kit.discount_percentage}%):</span>
                <span>-${savings.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PRECIO PROMOCIONAL:</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
                  ${kit.price.toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: 'rgba(0, 230, 118, 0.12)', color: 'var(--accent-neon)', padding: '6px 12px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>
                Ahorrás {kit.discount_percentage}%
              </div>
            </div>

            {isAvailable ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={handlePurchase} className="btn btn-yellow" style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 700 }}>
                  Comprar Kit Completo
                </button>
                <a 
                  href={getWhatsAppMessage()} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-outline"
                  style={{ display: 'inline-flex', width: '100%', padding: '12px', justifyContent: 'center' }}
                  onClick={() => dbService.logEvent(sessionToken, 'whatsapp_click', { location: 'kit_details_advising' })}
                >
                  <MessageSquare size={18} /> Consultar Asesor sobre este Kit
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', justifyContent: 'center' }}>
                  <ShieldAlert size={16} /> Componente agotado temporalmente
                </div>
                <a 
                  href={`https://wa.me/5491153841079?text=Hola%20Imperio%20Verde%2C%20quiero%20comprar%20el%20kit%20"${kit.name}"%20pero%20no%20hay%20stock.%20¿Me%20ayudan?`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-outline"
                  style={{ width: '100%', borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}
                >
                  Consultar fecha de reposición
                </a>
              </div>
            )}
          </div>

          {/* Quick instructions checklist */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '14px' }}>
              Guía de Uso Rápido
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <CheckCircle size={16} style={{ color: 'var(--accent-neon)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Compatibilidad:</strong> Todos los fertilizantes e insumos en este kit han sido biológicamente testeados para trabajar en sinergia.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <CheckCircle size={16} style={{ color: 'var(--accent-neon)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Dosificación:</strong> Consultá las fichas individuales de cada producto para ver su tabla de nutrición.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <CheckCircle size={16} style={{ color: 'var(--accent-neon)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Rendimiento:</strong> Este conjunto rinde aproximadamente para un ciclo completo de 4 a 6 plantas en macetas de 10L.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {styleKitMobile}
    </div>
  );
};

const styleKitMobile = (
  <style>{`
    @media (max-width: 768px) {
      .kit-split {
        grid-template-columns: 1fr !important;
        gap: 30px !important;
      }
    }
  `}</style>
);
