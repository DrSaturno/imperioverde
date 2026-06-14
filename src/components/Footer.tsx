import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/db';
import { useCart } from '../context/CartContext';
import { Phone, MapPin, Clock, Send, Instagram, Facebook, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { sessionToken } = useCart();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    // Save lead details into CRM!
    await dbService.addCustomer({
      email,
      full_name: name,
      interests: ['boletin_novedades'],
      is_subscribed: true
    });

    dbService.logEvent(sessionToken, 'newsletter_subscribe', { email, name });
    setSubmitted(true);
    setEmail('');
    setName('');
  };

  return (
    <footer style={{ backgroundColor: '#050d09', borderTop: '1px solid var(--border-glass)', padding: '60px 0 20px', marginTop: '60px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
      <div className="container">
        
        {/* Core grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          
          {/* Logo & Intro */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <img src="/Imperio Verde.png" alt="Imperio Verde Logo" style={{ height: '35px', objectFit: 'contain' }} />
              <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-neon)' }}>IMPERIO VERDE</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
              No vendemos solo insumos: te acompañamos con asesoramiento técnico y soluciones completas para que logres la máxima producción en tu cultivo.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a 
                href="https://instagram.com/imperioverde" 
                target="_blank" 
                rel="noreferrer" 
                style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '50%', color: 'var(--text-primary)' }}
                onClick={() => dbService.logEvent(sessionToken, 'social_click', { network: 'instagram' })}
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://facebook.com/imperioverde" 
                target="_blank" 
                rel="noreferrer" 
                style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '50%', color: 'var(--text-primary)' }}
                onClick={() => dbService.logEvent(sessionToken, 'social_click', { network: 'facebook' })}
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '18px', position: 'relative' }}>
              Contacto y Local
              <span style={{ content: '""', position: 'absolute', bottom: '-6px', left: 0, width: '30px', height: '2px', backgroundColor: 'var(--accent-neon)' }}></span>
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={18} style={{ color: 'var(--accent-neon)', flexShrink: 0, marginTop: '2px' }} />
                <span>Av. de las Raíces 420, CABA (Grow Sucursal)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} style={{ color: 'var(--accent-neon)', flexShrink: 0 }} />
                <span>+54 9 11 2345-6789</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Clock size={18} style={{ color: 'var(--accent-neon)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Lunes a Viernes:</strong> 10:00 a 19:00 hs<br />
                  <strong>Sábados:</strong> 10:00 a 14:00 hs
                </div>
              </li>
            </ul>
          </div>

          {/* Policies & Links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '18px', position: 'relative' }}>
              Ayuda al Cultivador
              <span style={{ content: '""', position: 'absolute', bottom: '-6px', left: 0, width: '30px', height: '2px', backgroundColor: 'var(--accent-neon)' }}></span>
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><Link to="/productos" className="footer-link">Ver Catálogo de Insumos</Link></li>
              <li><Link to="/kits" className="footer-link">Kits de Cultivo Inteligentes</Link></li>
              <li><Link to="/hidroponia" className="footer-link">Sistemas y Guías Hidropónicas</Link></li>
              <li><Link to="/resolver" className="footer-link">Diagnóstico de Plagas y Clima</Link></li>
              <li><Link to="/guias" className="footer-link">Blog & Consejos de Cultivo</Link></li>
              <li><Link to="/admin" className="footer-link" style={{ color: 'var(--text-muted)' }}>Panel Administrador</Link></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '18px', position: 'relative' }}>
              Base de Datos Cultivadores
              <span style={{ content: '""', position: 'absolute', bottom: '-6px', left: 0, width: '30px', height: '2px', backgroundColor: 'var(--accent-neon)' }}></span>
            </h4>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '12px' }}>
              Sumate para recibir guías de cultivo en PDF, checklists de mantenimiento y ofertas de reposición exclusivas.
            </p>
            {submitted ? (
              <div style={{ backgroundColor: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.2)', padding: '12px', borderRadius: '4px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--accent-neon)' }}>
                <ShieldCheck size={18} style={{ display: 'block', margin: '0 auto 4px' }} />
                ¡Te sumamos! Revisá tu correo para el PDF.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Tu Nombre" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="input" 
                  style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                  required
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input 
                    type="email" 
                    placeholder="tuemail@correo.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="input" 
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <Send size={14} />
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.75rem' }}>
          <div>
            © {new Date().getFullYear()} Imperio Verde Grow Shop. Todos los derechos reservados.
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', color: 'var(--text-muted)' }}>
            <span>💳 Mercado Pago</span>
            <span>🚛 Correo Argentino / Andreani</span>
            <span>🏠 Retiro Local</span>
          </div>
        </div>

      </div>
      <style>{`
        .footer-link {
          transition: var(--transition-smooth);
        }
        .footer-link:hover {
          color: var(--accent-neon);
          padding-left: 4px;
        }
      `}</style>
    </footer>
  );
};
