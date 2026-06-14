import React, { useEffect, useState } from 'react';
import { dbService, Order, Product } from '../../services/db';
import { DollarSign, Percent, TrendingUp, BookOpen, BarChart3, RefreshCw, Calendar } from 'lucide-react';

export const AdminFinance: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // DATE RANGE FILTER STATE
  const [dateFilter, setDateFilter] = useState<'7' | '15' | '30' | '60' | '90' | 'custom'>('90');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = () => {
    setLoading(true);
    dbService.getOrders().then(res => {
      setOrders(res);
      setLoading(false);
    });
    dbService.getProducts().then(setProducts);
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

  // CALCULATE METRICS
  const filteredOrders = filterByDateRange(orders);
  let totalRevenue = 0;
  let totalCOGS = 0;

  filteredOrders.forEach(order => {
    totalRevenue += order.total_amount;
    order.items.forEach(item => {
      // Find cost in order item or fall back to product or fall back to 50% of price
      let unitCost = item.cost;
      if (unitCost === undefined || unitCost === 0) {
        const p = products.find(prod => prod.id === item.product_id);
        unitCost = p?.cost || (item.price * 0.52); // Fallback: 52% of price as cost
      }
      totalCOGS += (unitCost * item.quantity);
    });
  });

  const grossProfit = totalRevenue - totalCOGS;
  const marginPercentage = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(1)) : 0;
  const aov = filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0;

  // BREAK DOWN BY CATEGORY
  const categoryStats: Record<string, { revenue: number; cogs: number }> = {};

  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      const p = products.find(prod => prod.id === item.product_id);
      const cat = p?.category || 'Varios';
      
      let unitCost = item.cost;
      if (unitCost === undefined || unitCost === 0) {
        unitCost = p?.cost || (item.price * 0.52);
      }

      if (!categoryStats[cat]) {
        categoryStats[cat] = { revenue: 0, cogs: 0 };
      }
      categoryStats[cat].revenue += (item.price * item.quantity);
      categoryStats[cat].cogs += (unitCost * item.quantity);
    });
  });

  const categoryBreakdownTable = Object.entries(categoryStats).map(([category, stats]) => {
    const profit = stats.revenue - stats.cogs;
    const margin = stats.revenue > 0 ? Number(((profit / stats.revenue) * 100).toFixed(1)) : 0;
    return {
      category,
      revenue: stats.revenue,
      cogs: stats.cogs,
      profit,
      margin
    };
  }).sort((a, b) => b.revenue - a.revenue);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>Finanzas & Rentabilidad</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Auditoría comercial de ingresos, coste de insumos (COGS) y márgenes de ganancia.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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

          <button 
            onClick={fetchFinanceData} 
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} /> Refrescar Finanzas
          </button>
        </div>
      </div>

      {/* Financial stats cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        {/* Revenue */}
        <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'rgba(0, 230, 118, 0.08)', color: 'var(--accent-neon)', padding: '16px', borderRadius: '50%' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ingresos Totales</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>${totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        {/* COGS */}
        <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'rgba(239, 83, 80, 0.08)', color: '#ef5350', padding: '16px', borderRadius: '50%' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Costo Mercadería (COGS)</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>${Math.round(totalCOGS).toLocaleString()}</div>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'rgba(255, 214, 0, 0.08)', color: 'var(--action-yellow)', padding: '16px', borderRadius: '50%' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Beneficio Bruto</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>${Math.round(grossProfit).toLocaleString()}</div>
          </div>
        </div>

        {/* Margin % */}
        <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'rgba(224, 64, 251, 0.08)', color: '#e040fb', padding: '16px', borderRadius: '50%' }}>
            <Percent size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Margen Promedio</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{marginPercentage}%</div>
          </div>
        </div>

      </div>

      {/* Category breakdown table */}
      <div className="glass-card" style={{ padding: '0px', overflowX: 'auto' }}>
        <div style={{ padding: '24px 24px 16px 24px' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--accent-neon)" /> Rentabilidad por Categoría de Cultivo
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Desglose de facturación, costo unitario acumulado y margen porcentual por segmento del grow shop.</p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '16px' }}>Categoría</th>
              <th style={{ padding: '16px' }}>Ventas Brutas</th>
              <th style={{ padding: '16px' }}>Costo COGS</th>
              <th style={{ padding: '16px' }}>Beneficio</th>
              <th style={{ padding: '16px' }}>Margen %</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando datos...</td>
              </tr>
            ) : categoryBreakdownTable.length > 0 ? (
              categoryBreakdownTable.map((cat, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="tr-row">
                  <td style={{ padding: '14px', fontWeight: 700 }}>{cat.category}</td>
                  <td style={{ padding: '14px' }}>${cat.revenue.toLocaleString()}</td>
                  <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>${Math.round(cat.cogs).toLocaleString()}</td>
                  <td style={{ padding: '14px', color: 'var(--accent-neon)', fontWeight: 600 }}>${Math.round(cat.profit).toLocaleString()}</td>
                  <td style={{ padding: '14px' }}>
                    <span className={`badge ${cat.margin >= 45 ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: '0.65rem' }}>
                      {cat.margin}%
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay datos financieros que auditar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .tr-row:hover {
          background-color: rgba(255,255,255,0.01) !important;
        }
      `}</style>

    </div>
  );
};
