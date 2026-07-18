import React, { useEffect, useState } from 'react';
import { dbService, Customer } from '../../services/db';
import { Search, Download, Filter, User } from 'lucide-react';

export const AdminCRM: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [interestFilter, setInterestFilter] = useState('');

  useEffect(() => {
    dbService.getCustomers().then(setCustomers);
  }, []);

  useEffect(() => {
    let res = [...customers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      res = res.filter(c => 
        c.full_name.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q) || 
        (c.phone && c.phone.includes(q))
      );
    }

    if (interestFilter) {
      res = res.filter(c => c.interests.includes(interestFilter));
    }

    setFilteredCustomers(res);
  }, [customers, searchQuery, interestFilter]);

  const exportCSV = () => {
    if (filteredCustomers.length === 0) return;

    // Build CSV Content
    const headers = ['Nombre', 'Email', 'Telefono', 'Suscrito', 'Intereses', 'Fecha Registro'];
    const rows = filteredCustomers.map(c => [
      c.full_name,
      c.email,
      c.phone || '',
      c.is_subscribed ? 'Si' : 'No',
      c.interests.join('; '),
      c.created_at ? new Date(c.created_at).toLocaleDateString() : ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `imperio_verde_crm_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header toolbar */}
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>CRM de Clientes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Historial de cultivadores suscritos, compradores y segmentación de intereses.</p>
        </div>

        <button 
          onClick={exportCSV} 
          disabled={filteredCustomers.length === 0}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
        >
          <Download size={16} /> Exportar CSV para Marketing
        </button>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o teléfono…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: '40px', fontSize: '0.85rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        {/* Filter by segment */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
          <select 
            value={interestFilter} 
            onChange={(e) => setInterestFilter(e.target.value)}
            className="input" 
            style={{ padding: '8px 16px', fontSize: '0.85rem', width: '180px' }}
          >
            <option value="">Todos los intereses</option>
            <option value="indoor">Indoor</option>
            <option value="exterior">Exterior</option>
            <option value="hidroponia">Hidroponía</option>
            <option value="fertilizantes">Fertilizantes</option>
            <option value="boletin_novedades">Boletín Novedades</option>
          </select>
        </div>

      </div>

      {/* CRM Customer List Table */}
      <div className="glass-card" style={{ padding: '0px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '16px' }}>Nombre</th>
              <th style={{ padding: '16px' }}>Email</th>
              <th style={{ padding: '16px' }}>Teléfono</th>
              <th style={{ padding: '16px' }}>Suscrito</th>
              <th style={{ padding: '16px' }}>Intereses / Categorías</th>
              <th style={{ padding: '16px' }}>Registro</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="tr-row">
                  <td style={{ padding: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ backgroundColor: 'rgba(0,230,118,0.05)', color: 'var(--accent-neon)', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                      <User size={14} />
                    </div>
                    {c.full_name}
                  </td>
                  <td style={{ padding: '14px' }}>{c.email}</td>
                  <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{c.phone || '-'}</td>
                  <td style={{ padding: '14px' }}>
                    <span className={`badge ${c.is_subscribed ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: '0.65rem' }}>
                      {c.is_subscribed ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {c.interests.map(i => (
                        <span key={i} className="badge badge-violet" style={{ fontSize: '0.65rem', textTransform: 'lowercase' }}>{i}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No hay clientes registrados en el CRM que cumplan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
