import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Box, Users, ShoppingCart, LogOut, ArrowLeft, Receipt, Megaphone, Globe, DollarSign } from 'lucide-react';
import { dbService } from '../../services/db';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Simulated logout
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh', backgroundColor: '#030805' }} className="admin-grid-layout">
      
      {/* Sidebar Panel */}
      <aside style={{ backgroundColor: '#07120a', borderRight: '1px solid var(--border-glass)', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Logo / Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <img src="/logotransparente.png" alt="Logo" style={{ height: '30px', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', fontWeight: 800, color: 'var(--accent-neon)' }}>ADMIN PANEL</span>
          </div>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>IMPERIO VERDE GROW SHOP</span>
        </div>

        {/* Links Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-title)', fontWeight: 600, fontSize: '0.85rem' }}>
          
          <Link 
            to="/admin" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-sm)',
              color: location.pathname === '/admin' || location.pathname === '/admin/' ? 'var(--accent-neon)' : 'var(--text-secondary)',
              backgroundColor: location.pathname === '/admin' || location.pathname === '/admin/' ? 'rgba(0, 230, 118, 0.05)' : 'transparent'
            }}
          >
            <BarChart3 size={16} /> Métricas & Analytics
          </Link>

          <Link 
            to="/admin/productos" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-sm)',
              color: isActive('/admin/productos') ? 'var(--accent-neon)' : 'var(--text-secondary)',
              backgroundColor: isActive('/admin/productos') ? 'rgba(0, 230, 118, 0.05)' : 'transparent'
            }}
          >
            <Box size={16} /> Productos CRUD
          </Link>

          <Link 
            to="/admin/ventas" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-sm)',
              color: isActive('/admin/ventas') ? 'var(--accent-neon)' : 'var(--text-secondary)',
              backgroundColor: isActive('/admin/ventas') ? 'rgba(0, 230, 118, 0.05)' : 'transparent'
            }}
          >
            <Receipt size={16} /> Ventas & Historial
          </Link>

          <Link 
            to="/admin/crm" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-sm)',
              color: isActive('/admin/crm') ? 'var(--accent-neon)' : 'var(--text-secondary)',
              backgroundColor: isActive('/admin/crm') ? 'rgba(0, 230, 118, 0.05)' : 'transparent'
            }}
          >
            <Users size={16} /> CRM & Clientes
          </Link>

          <Link 
            to="/admin/abandonados" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-sm)',
              color: isActive('/admin/abandonados') ? 'var(--accent-neon)' : 'var(--text-secondary)',
              backgroundColor: isActive('/admin/abandonados') ? 'rgba(0, 230, 118, 0.05)' : 'transparent'
            }}
          >
            <ShoppingCart size={16} /> Carros Abandonados
          </Link>

          <Link 
            to="/admin/marketing" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-sm)',
              color: isActive('/admin/marketing') ? 'var(--accent-neon)' : 'var(--text-secondary)',
              backgroundColor: isActive('/admin/marketing') ? 'rgba(0, 230, 118, 0.05)' : 'transparent'
            }}
          >
            <Megaphone size={16} /> Marketing & Cupones
          </Link>

          <Link 
            to="/admin/trafico" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-sm)',
              color: isActive('/admin/trafico') ? 'var(--accent-neon)' : 'var(--text-secondary)',
              backgroundColor: isActive('/admin/trafico') ? 'rgba(0, 230, 118, 0.05)' : 'transparent'
            }}
          >
            <Globe size={16} /> Tráfico & Consultas
          </Link>

          <Link 
            to="/admin/finanzas" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-sm)',
              color: isActive('/admin/finanzas') ? 'var(--accent-neon)' : 'var(--text-secondary)',
              backgroundColor: isActive('/admin/finanzas') ? 'rgba(0, 230, 118, 0.05)' : 'transparent'
            }}
          >
            <DollarSign size={16} /> Finanzas & Costos
          </Link>

        </nav>

        {/* Bottom options */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <ArrowLeft size={14} /> Volver a la Tienda
          </Link>
          <button 
            onClick={handleLogout} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '10px 16px', 
              fontSize: '0.8rem', 
              color: '#ef5350', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 600,
              textAlign: 'left'
            }}
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>

      </aside>

      {/* Main Content View */}
      <main style={{ padding: '40px', overflowY: 'auto', maxHeight: '100vh' }}>
        <Outlet />
      </main>

      {styleAdminLayoutMobile}
    </div>
  );
};

const styleAdminLayoutMobile = (
  <style>{`
    @media (max-width: 768px) {
      .admin-grid-layout {
        grid-template-columns: 1fr !important;
      }
      aside {
        display: none !important;
      }
    }
  `}</style>
);
