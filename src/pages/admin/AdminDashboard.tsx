import React, { useEffect, useState } from 'react';
import { dbService, Order, CartSession, AnalyticsEvent, Product } from '../../services/db';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Percent, ShoppingBag, Eye, Search, Calendar, ChevronRight, Hash } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [carts, setCarts] = useState<CartSession[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // DATE RANGE FILTER STATE
  const [dateFilter, setDateFilter] = useState<'7' | '15' | '30' | '60' | '90' | 'custom'>('90');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    dbService.getOrders().then(setOrders);
    dbService.getCartSessions().then(setCarts);
    dbService.getAnalyticsEvents().then(setEvents);
    dbService.getProducts().then(setProducts);
  }, []);

  // Filter items helper based on current selection
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

  const filteredOrders = filterByDateRange(orders);
  const filteredCarts = filterByDateRange(carts);
  const filteredEvents = filterByDateRange(events);

  // CALCULATE METRICS
  const totalSalesAmount = filteredOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const salesCount = filteredOrders.length;
  const ticketAverage = salesCount > 0 ? Math.round(totalSalesAmount / salesCount) : 0;
  
  const convertedCarts = filteredCarts.filter(c => c.status === 'converted').length;
  const conversionRate = filteredCarts.length > 0 ? Number(((convertedCarts / filteredCarts.length) * 100).toFixed(1)) : 0.0;
  
  const uniqueSessions = new Set(filteredEvents.map(e => e.session_token)).size || 1;

  // 1. Bestselling Products Calculation
  const productQuantities: Record<string, { qty: number; revenue: number }> = {};
  filteredOrders.forEach(o => {
    o.items.forEach(item => {
      if (!productQuantities[item.product_id]) {
        productQuantities[item.product_id] = { qty: 0, revenue: 0 };
      }
      productQuantities[item.product_id].qty += item.quantity;
      productQuantities[item.product_id].revenue += (item.price * item.quantity);
    });
  });

  const bestSellers = Object.entries(productQuantities)
    .map(([id, stats]) => {
      const p = products.find(prod => prod.id === id);
      return {
        id,
        name: p?.name || 'Insumo de Cultivo',
        brand: p?.brand || 'Varios',
        category: p?.category || 'Varios',
        qty: stats.qty,
        revenue: stats.revenue
      };
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // 2. Searches with empty results (Content gap analysis)
  const searchEvents = filteredEvents.filter(e => e.event_type === 'search');
  const searchKeywords: Record<string, number> = {};
  searchEvents.forEach(e => {
    const q = e.payload.query || '';
    if (q) {
      searchKeywords[q] = (searchKeywords[q] || 0) + 1;
    }
  });
  const popularSearches = Object.entries(searchKeywords)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 3. Sales Timeline Data
  const salesTimeline = [...filteredOrders].reverse().map(o => ({
    fecha: new Date(o.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
    ventas: o.total_amount
  })).slice(-10); // show last 10 chronological order sales in chart

  // 4. Category Views Traffic Data
  const viewEvents = filteredEvents.filter(e => e.event_type === 'filter_category' || e.event_type === 'product_view');
  const categoryClicks: Record<string, number> = {};
  viewEvents.forEach(e => {
    const cat = e.payload.category || 'Varios';
    categoryClicks[cat] = (categoryClicks[cat] || 0) + 1;
  });
  const COLORS = ['#00e676', '#8e24aa', '#ffd600', '#29b6f6', '#ff7043', '#26a69a'];
  const categoryData = Object.entries(categoryClicks).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header and Date Filter Selector */}
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>Métricas y Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Resumen del desempeño comercial y navegación de tu grow shop.</p>
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

      {/* Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
        
        {/* Total Sales Amount */}
        <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'rgba(0, 230, 118, 0.08)', color: 'var(--accent-neon)', padding: '16px', borderRadius: '50%' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ventas Totales</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>${totalSalesAmount.toLocaleString()}</div>
          </div>
        </div>

        {/* Sales count */}
        <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'rgba(0, 230, 118, 0.08)', color: 'var(--accent-neon)', padding: '16px', borderRadius: '50%' }}>
            <Hash size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cantidad de Ventas</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{salesCount} pedidos</div>
          </div>
        </div>

        {/* Avg Ticket */}
        <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'rgba(255, 214, 0, 0.08)', color: 'var(--action-yellow)', padding: '16px', borderRadius: '50%' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ticket Promedio</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>${ticketAverage.toLocaleString()}</div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'rgba(142, 36, 170, 0.08)', color: '#e040fb', padding: '16px', borderRadius: '50%' }}>
            <Percent size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tasa de Conversión</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{conversionRate}%</div>
          </div>
        </div>

        {/* Total Visits */}
        <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', padding: '16px', borderRadius: '50%' }}>
            <Eye size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sesiones Únicas</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{uniqueSessions}</div>
          </div>
        </div>

      </div>

      {/* Charts split block */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }} className="admin-charts-split">
        
        {/* Sales Timeline chart */}
        <div className="glass-card" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '20px' }}>Historial de Ventas (Evolución)</h3>
          <div style={{ flex: 1 }}>
            {salesTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="fecha" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '4px' }} />
                  <Bar dataKey="ventas" fill="var(--accent-neon)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No hay datos de ventas registradas en este periodo.</div>
            )}
          </div>
        </div>

        {/* Category Views distribution */}
        <div className="glass-card" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '20px' }}>Tráfico por Categorías</h3>
          <div style={{ flex: 1 }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '4px' }} />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} style={{ fontSize: '0.75rem' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No hay clics en categorías registrados.</div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Grid: Searches & Bestsellers Ranking */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="admin-searches-split">
        
        {/* Popular searches keywords */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} color="var(--accent-neon)" /> Búsquedas Frecuentes
          </h3>
          {popularSearches.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {popularSearches.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px', fontSize: '0.85rem' }}>
                  <span>{idx + 1}. <strong>"{s.keyword}"</strong></span>
                  <span style={{ color: 'var(--accent-neon)', fontWeight: 600 }}>{s.count} consultas</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>No hay registros de búsquedas en este periodo.</div>
          )}
        </div>

        {/* Bestsellers Ranking Table */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--action-yellow)' }}>
            <ShoppingBag size={18} /> Ranking de Más Vendidos
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {bestSellers.length > 0 ? (
              bestSellers.map((prod, idx) => (
                <div key={prod.id} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: 'var(--action-yellow)', width: '16px' }}>{idx + 1}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{prod.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cód: {prod.id.slice(0, 5)} • {prod.category}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-neon)' }}>{prod.qty} uds.</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>${prod.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              // Fallbacks if no sales yet
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>No hay transacciones registradas para calcular el ranking.</div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-charts-split, .admin-searches-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
