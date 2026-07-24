import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dbService, Kit } from '../services/db';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, ArrowRight, ShieldAlert, BadgeInfo } from 'lucide-react';
import { getProductImage } from './Shop';

export const Kits: React.FC = () => {
  const [kits, setKits] = useState<Kit[]>([]);
  const { addKitToCart, sessionToken } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Filters
  const [envFilter, setEnvFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [filteredKits, setFilteredKits] = useState<Kit[]>([]);

  useEffect(() => {
    dbService.getKits().then(setKits);
    dbService.logEvent(sessionToken, 'kits_list_view', {});
  }, [sessionToken]);

  useEffect(() => {
    let res = [...kits];
    if (envFilter) {
      res = res.filter(k => k.interests.includes(envFilter) || k.interests.includes('indoor_exterior'));
    }
    if (levelFilter) {
      res = res.filter(k => k.difficulty_level === levelFilter);
    }
    setFilteredKits(res);
  }, [kits, envFilter, levelFilter]);

  const handleKitPurchase = async (kit: Kit) => {
    // Check stock of components
    const hasStock = kit.products.every(kp => (kp.product?.stock || 0) >= kp.quantity);
    if (!hasStock) {
      showToast('Algunos de los componentes de este kit se encuentran agotados. Consultanos por WhatsApp alternativas.', 'error');
      return;
    }

    await addKitToCart(kit);
    showToast(`Se agregaron los componentes de "${kit.name}" al carrito con ${kit.discount_percentage}% de descuento`);
    navigate('/carrito');
  };

  return (
    <div className="container">
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--action-yellow)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '12px' }}>
          <Sparkles size={16} /> CÓMBOS BOTÁNICOS CON DESCUENTOS MÁGICOS
        </div>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', fontWeight: 800, marginBottom: '12px' }}>Kits de Cultivo Alquímicos Imperio Verde</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto' }}>
          Soluciones integrales prediseñadas por nuestros expertos cultivadores. Aseguran compatibilidad mística y técnica, simplificando tu proceso de compra.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '40px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tipo de Cultivo</span>
            <select value={envFilter} onChange={(e) => setEnvFilter(e.target.value)} className="input" style={{ padding: '8px 16px', fontSize: '0.85rem', width: '160px' }}>
              <option value="">Todos los entornos</option>
              <option value="indoor">Indoor (Carpa/Luz)</option>
              <option value="exterior">Exterior (Sol/Suelo)</option>
              <option value="hidroponia">Hidroponía (Agua)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nivel del Cultivador</span>
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="input" style={{ padding: '8px 16px', fontSize: '0.85rem', width: '160px' }}>
              <option value="">Todos los niveles</option>
              <option value="principiante">Principiante (Fácil)</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado (Técnico)</option>
            </select>
          </div>

        </div>

        {(envFilter || levelFilter) && (
          <button onClick={() => { setEnvFilter(''); setLevelFilter(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-neon)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Empty state */}
      {filteredKits.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <BadgeInfo size={32} style={{ color: 'var(--accent-neon)' }} />
          <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-title)' }}>
            {kits.length === 0 ? 'Todavía no hay kits publicados' : 'No encontramos kits con esos filtros'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px' }}>
            {kits.length === 0
              ? 'Estamos armando nuestras combinaciones. Mientras tanto, contanos qué querés cultivar y te armamos un kit a medida por WhatsApp.'
              : 'Probá con otro entorno de cultivo o nivel, o pedinos una combinación a medida.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {(envFilter || levelFilter) && (
              <button onClick={() => { setEnvFilter(''); setLevelFilter(''); }} className="btn btn-outline">Limpiar filtros</button>
            )}
            <a
              href="https://wa.me/5491153841079?text=Hola%20Imperio%20Verde%2C%20quiero%20armar%20un%20kit%20a%20medida%20para%20mi%20cultivo."
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Armar mi kit por WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Kits list */}
      <div className="grid grid-cols-3">
        {filteredKits.map(kit => {
          // Check stock of components
          const isAvailable = kit.products.every(kp => (kp.product?.stock || 0) >= kp.quantity);
          const rawSum = Math.round(kit.price / (1 - kit.discount_percentage / 100));
          const savings = rawSum - kit.price;

          return (
            <div key={kit.id} className="glass-card" style={{ borderTop: '4px solid var(--action-yellow)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-yellow">¡AHORRÁ {kit.discount_percentage}%!</span>
                <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Nivel: {kit.difficulty_level}</span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-title)', marginBottom: '8px' }}>{kit.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '60px' }}>
                  {kit.description}
                </p>
              </div>

              {/* Component Preview List */}
              <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Productos Incluidos</span>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                  {kit.products.map(kp => (
                    <li key={kp.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#f7f8f6', width: '20px', height: '20px', borderRadius: '3px', overflow: 'hidden', flexShrink: 0, display: 'inline-flex' }}>
                          {kp.product && <img src={getProductImage(kp.product)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                        </span>
                        {kp.quantity}x {kp.product?.name || 'Insumo'}
                      </span>
                      <span style={{ color: (kp.product?.stock || 0) >= kp.quantity ? 'var(--accent-neon)' : 'var(--text-muted)', fontSize: '0.7rem' }}>
                        {(kp.product?.stock || 0) >= kp.quantity ? 'Ok' : 'Sin stock'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price calculations */}
              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
                  <div>
                    <span style={{ textDecoration: 'line-through', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ${rawSum.toLocaleString()}
                    </span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ${kit.price.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--accent-neon)', fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>
                      Ahorrás ${savings.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>En {kit.products.length} productos</span>
                  </div>
                </div>

                {isAvailable ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/kits/${kit.id}`} className="btn btn-outline" style={{ flex: 1, padding: '10px' }}>Detalles</Link>
                    <button onClick={() => handleKitPurchase(kit)} className="btn btn-yellow" style={{ flex: 2, padding: '10px' }}>Llevar Kit</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                      <ShieldAlert size={14} /> Componente agotado temporalmente
                    </div>
                    <a 
                      href={`https://wa.me/5491153841079?text=Hola%20Imperio%20Verde%2C%20estoy%20interesado%20en%20el%20kit%20"${kit.name}"%20pero%20figura%20sin%20stock.%20¿Me%20pueden%20ofrecer%20una%20alternativa?`}
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-outline"
                      style={{ padding: '10px', textAlign: 'center', width: '100%', borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}
                    >
                      Consultar alternativa en WhatsApp
                    </a>
                  </div>
                )}

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
