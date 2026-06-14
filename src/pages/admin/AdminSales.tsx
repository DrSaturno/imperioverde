import React, { useEffect, useState } from 'react';
import { dbService, Order, Product } from '../../services/db';
import { Search, Eye, X, Receipt, RefreshCw, Truck, CreditCard, User, Calendar } from 'lucide-react';
import { getProductImage } from '../Shop';

export const AdminSales: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // DATE RANGE FILTER STATE
  const [dateFilter, setDateFilter] = useState<'7' | '15' | '30' | '60' | '90' | 'custom'>('90');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusSelectorValue, setStatusSelectorValue] = useState<'pending' | 'paid' | 'failed' | 'refunded'>('pending');

  useEffect(() => {
    fetchOrders();
    dbService.getProducts().then(setProducts);
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    dbService.getOrders().then(res => {
      setOrders(res);
      setFilteredOrders(res);
      setLoading(false);
    });
  };

  const filterByDateRange = <T extends { created_at?: string; last_activity?: string; }>(items: T[]): T[] => {
    const now = new Date();
    let limitDate = new Date();
    
    if (dateFilter === '7') limitDate.setDate(now.getDate() - 7);
    else if (dateFilter === '15') limitDate.setDate(now.getDate() - 15);
    else if (dateFilter === '30') limitDate.setDate(now.getDate() - 30);
    else if (dateFilter === '60') limitDate.setDate(now.getDate() - 60);
    else if (dateFilter === '90') limitDate.setDate(now.getDate() - 90);
    else if (dateFilter === 'custom') {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      return items.filter(item => {
        const dateStr = item.created_at || item.last_activity;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d >= start && d <= end;
      });
    }

    return items.filter(item => {
      const dateStr = item.created_at || item.last_activity;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= limitDate && d <= now;
    });
  };

  // Search filter
  useEffect(() => {
    const dateFiltered = filterByDateRange(orders);
    if (!searchQuery.trim()) {
      setFilteredOrders(dateFiltered);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = dateFiltered.filter(o => 
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    );
    setFilteredOrders(filtered);
  }, [searchQuery, orders, dateFilter, startDate, endDate]);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setStatusSelectorValue(order.payment_status);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const updatedOrders = orders.map(o => {
      if (o.id === selectedOrder.id) {
        return { ...o, payment_status: statusSelectorValue };
      }
      return o;
    });

    // Save in dbService
    dbService.saveOrders(updatedOrders);
    
    // Refresh lists
    setOrders(updatedOrders);
    setSelectedOrder(prev => prev ? { ...prev, payment_status: statusSelectorValue } : null);
    alert('¡Estado del pedido actualizado con éxito!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header toolbar */}
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>Ventas & Historial</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Seguimiento de pedidos cobrados, envíos y auditorías transaccionales.</p>
        </div>

        <button 
          onClick={fetchOrders} 
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={16} /> Refrescar Ventas
        </button>
      </div>

      {/* Toolbar: Search and Date Filter */}
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Buscar por cliente, correo o N° de orden..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: '40px', fontSize: '0.85rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        {/* Date Filter Toolbar */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
          <Calendar size={16} color="var(--accent-neon)" />
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value as any)} 
            className="input"
            style={{ width: '130px', padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'var(--bg-primary)' }}
          >
            <option value="7">Últimos 7 días</option>
            <option value="15">Últimos 15 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="60">Últimos 60 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="custom">Personalizado</option>
          </select>

          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="input" 
                style={{ padding: '4px 8px', fontSize: '0.75rem', width: '120px', backgroundColor: 'var(--bg-primary)' }} 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>a</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="input" 
                style={{ padding: '4px 8px', fontSize: '0.75rem', width: '120px', backgroundColor: 'var(--bg-primary)' }} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Sales List Grid */}
      <div className="glass-card" style={{ padding: '0px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '16px' }}>N° Orden</th>
              <th style={{ padding: '16px' }}>Cliente</th>
              <th style={{ padding: '16px' }}>Fecha</th>
              <th style={{ padding: '16px' }}>Envío</th>
              <th style={{ padding: '16px' }}>Total</th>
              <th style={{ padding: '16px' }}>Estado Pago</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando órdenes...</td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="tr-row">
                  <td style={{ padding: '14px', fontWeight: 700, color: 'var(--action-yellow)' }}>{o.id.toUpperCase()}</td>
                  <td style={{ padding: '14px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customer_email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{new Date(o.created_at).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td style={{ padding: '14px' }}>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {o.shipping_method === 'delivery' ? 'Domicilio' : 'Retiro Sucursal'}
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontWeight: 700 }}>${o.total_amount.toLocaleString()}</td>
                  <td style={{ padding: '14px' }}>
                    <span className={`badge ${
                      o.payment_status === 'paid' 
                        ? 'badge-green' 
                        : o.payment_status === 'pending' 
                          ? 'badge-yellow' 
                          : o.payment_status === 'refunded'
                            ? 'badge-violet'
                            : 'badge-yellow'
                    }`} style={{ fontSize: '0.65rem' }}>
                      {o.payment_status === 'paid' && 'Pagado'}
                      {o.payment_status === 'pending' && 'Pendiente'}
                      {o.payment_status === 'failed' && 'Fallido'}
                      {o.payment_status === 'refunded' && 'Reembolsado'}
                    </span>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleOpenDetail(o)} 
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={12} /> Detalles
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No se encontraron ventas para esta búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL OVERLAY */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '650px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt color="var(--accent-neon)" size={20} />
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-title)', fontSize: '1.2rem' }}>
                  Detalle de Pedido: {selectedOrder.id.toUpperCase()}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedOrder(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Client & Shipping Metadata Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="modal-meta-grid">
              
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-neon)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <User size={14} /> Datos del Cliente
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                  <span><strong>Nombre:</strong> {selectedOrder.customer_name}</span>
                  <span><strong>Email:</strong> {selectedOrder.customer_email}</span>
                  <span><strong>Teléfono:</strong> {selectedOrder.customer_phone || '-'}</span>
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-neon)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Truck size={14} /> Entrega / Envío
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                  <span><strong>Método:</strong> {selectedOrder.shipping_method === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Sucursal'}</span>
                  <span><strong>Dirección:</strong> {selectedOrder.shipping_address || 'Retiro en Grow Local'}</span>
                  <span><strong>Fecha:</strong> {new Date(selectedOrder.created_at).toLocaleDateString('es-AR')}</span>
                </div>
              </div>

            </div>

            {/* Payment status updating tool */}
            <form onSubmit={handleUpdateStatus} style={{ backgroundColor: 'rgba(255,214,0,0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,214,0,0.1)', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><CreditCard size={12} /> Estado transaccional actual:</span>
                <select 
                  value={statusSelectorValue} 
                  onChange={(e) => setStatusSelectorValue(e.target.value as any)}
                  className="input"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', width: '160px', backgroundColor: 'var(--bg-primary)' }}
                >
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagado</option>
                  <option value="failed">Fallido</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </div>
              <button type="submit" className="btn btn-yellow" style={{ padding: '8px 16px', fontSize: '0.8rem', alignSelf: 'flex-end' }}>
                Actualizar Estado
              </button>
            </form>

            {/* Items Breakdown list */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px', color: '#fff' }}>Productos en la Orden:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedOrder.items.map((item, idx) => {
                  const p = products.find(prod => prod.id === item.product_id);
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
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p?.name || 'Insumo de cultivo'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Cód: {item.product_id.slice(0, 5)} • Marca: {p?.brand || 'Varios'}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 700 }}>${(item.price * item.quantity).toLocaleString()}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.quantity}x de ${item.price.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total summary */}
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '10px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Monto Total del Pedido:</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-neon)', fontFamily: 'var(--font-title)' }}>
                ${selectedOrder.total_amount.toLocaleString()}
              </span>
            </div>

          </div>
        </div>
      )}

      <style>{`
        .tr-row:hover {
          background-color: rgba(255,255,255,0.01) !important;
        }
        @media (max-width: 600px) {
          .modal-meta-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};
