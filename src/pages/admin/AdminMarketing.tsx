import React, { useEffect, useState } from 'react';
import { dbService, Coupon, Customer } from '../../services/db';
import { useToast } from '../../context/ToastContext';
import { Megaphone, Plus, Trash2, Check, X, Users, Mail, Phone, Calendar, RefreshCw } from 'lucide-react';

export const AdminMarketing: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Form Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [couponActive, setCouponActive] = useState(true);

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const fetchMarketingData = () => {
    setLoading(true);
    dbService.getCoupons().then(setCoupons);
    dbService.getCustomers().then(res => {
      setCustomers(res);
      setLoading(false);
    });
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !couponDiscount) {
      showToast('Por favor, completa los campos del cupón.', 'error');
      return;
    }

    const discountNum = parseFloat(couponDiscount);
    if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
      showToast('El porcentaje de descuento debe estar entre 1 y 100.', 'error');
      return;
    }

    const payload: Coupon = {
      code: couponCode.trim().toUpperCase(),
      discount_percentage: discountNum,
      is_active: couponActive
    };

    const updated = await dbService.addCoupon(payload);
    setCoupons(updated);
    setCouponCode('');
    setCouponDiscount('');
    setCouponActive(true);
    showToast('Cupón creado/actualizado con éxito');
  };

  const handleDeleteCoupon = async (code: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el cupón ${code}?`)) {
      await dbService.deleteCoupon(code);
      fetchMarketingData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>Marketing & Campañas</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Administración de cupones de descuento y audiencias de suscriptores.</p>
        </div>

        <button 
          onClick={fetchMarketingData} 
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={16} /> Refrescar Datos
        </button>
      </div>

      {/* Main split: Coupons CRUD on left, Subscriptions on right */}
      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '30px' }} className="marketing-split">
        
        {/* Left Column: Coupon Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Coupon Form */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-neon)' }}>
              <Megaphone size={18} /> Crear Cupón de Descuento
            </h3>
            
            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Código del Cupón *</span>
                <input 
                  type="text" 
                  placeholder="Ej: OTOÑO20" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)} 
                  className="input"
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Porcentaje de Descuento (%) *</span>
                <input 
                  type="number" 
                  min="1"
                  max="100"
                  placeholder="Ej: 20" 
                  value={couponDiscount} 
                  onChange={(e) => setCouponDiscount(e.target.value)} 
                  className="input"
                  required
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                <input 
                  type="checkbox" 
                  checked={couponActive} 
                  onChange={(e) => setCouponActive(e.target.checked)} 
                  style={{ accentColor: 'var(--accent-neon)' }} 
                />
                ¿Cupón Activo / Habilitado para Checkout?
              </label>

              <button type="submit" className="btn btn-primary" style={{ padding: '10px', fontSize: '0.85rem', width: '100%', marginTop: '6px' }}>
                <Plus size={16} /> Crear Cupón
              </button>
            </form>
          </div>

          {/* Coupons List */}
          <div className="glass-card" style={{ padding: '20px 0px 0px 0px' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '16px', paddingLeft: '20px' }}>Cupones Activos</h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 16px' }}>Código</th>
                    <th style={{ padding: '10px 16px' }}>Descuento</th>
                    <th style={{ padding: '10px 16px' }}>Estado</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right' }}>Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.length > 0 ? (
                    coupons.map((c, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.01)' }}>
                        <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--action-yellow)' }}>{c.code}</td>
                        <td style={{ padding: '10px 16px', fontWeight: 600 }}>{c.discount_percentage}% OFF</td>
                        <td style={{ padding: '10px 16px' }}>
                          {c.is_active ? (
                            <span style={{ color: 'var(--accent-neon)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> Habilitado</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><X size={12} /> Inactivo</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                          <button onClick={() => handleDeleteCoupon(c.code)} aria-label={`Eliminar cupón ${c.code}`} style={{ background: 'none', border: 'none', color: '#ef5350', cursor: 'pointer' }}>
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay cupones cargados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Audience Newsletter CRM */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 0px 0px 0px' }}>
          <div style={{ padding: '0 24px', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--accent-neon)" /> Lista de Suscriptores & Leads
            </h3>
            <span className="badge badge-green">{customers.length} Suscriptores</span>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 20px' }}>Contacto</th>
                  <th style={{ padding: '12px 20px' }}>Intereses de Cultivo</th>
                  <th style={{ padding: '12px 20px' }}>Fecha Alta</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Newsletter</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando suscriptores…</td>
                  </tr>
                ) : customers.length > 0 ? (
                  customers.map(cust => (
                    <tr key={cust.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{cust.full_name || 'Sin Nombre'}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                            <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Mail size={10} /> {cust.email}</span>
                            {cust.phone && <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Phone size={10} /> {cust.phone}</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {cust.interests.length > 0 ? (
                            cust.interests.map((int, i) => (
                              <span key={i} className="badge badge-violet" style={{ fontSize: '0.55rem', padding: '2px 6px', textTransform: 'capitalize' }}>
                                {int}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>General</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Calendar size={10} /> {new Date(cust.created_at || '').toLocaleDateString('es-AR')}</span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <span className={`badge ${cust.is_subscribed ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: '0.6rem' }}>
                          {cust.is_subscribed ? 'Suscrito' : 'Baja'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay suscriptores registrados aún.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .marketing-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};
