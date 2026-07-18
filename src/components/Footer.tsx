import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/db';
import { useCart } from '../context/CartContext';
import { Phone, MapPin, Clock, Mail, Send, Instagram, MessageCircle, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { sessionToken } = useCart();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const cleanEmail = email.trim().toLowerCase();
    const namePattern = /^[\p{L}\s'.-]+$/u;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (cleanName.length < 2 || !namePattern.test(cleanName)) {
      setFormError('Ingresá un nombre válido de al menos 2 caracteres.');
      return;
    }
    if (!emailPattern.test(cleanEmail)) {
      setFormError('Ingresá un correo electrónico válido.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      await dbService.addCustomer({
        email: cleanEmail,
        full_name: cleanName,
        interests: ['boletin_novedades'],
        is_subscribed: true
      });

      await dbService.logEvent(sessionToken, 'newsletter_subscribe', { email: cleanEmail, name: cleanName });
      setSubmitted(true);
      setEmail('');
      setName('');
    } catch {
      setFormError('No pudimos registrarte. Intentá nuevamente en unos minutos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="site-footer" style={{ backgroundColor: '#ecd444', borderTop: '1px solid rgba(79,20,95,0.35)', padding: '60px 0 20px', marginTop: '60px', fontSize: '0.9rem', color: '#50145f' }}>
      <div className="container">
        
        {/* Core grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          
          {/* Logo & Intro */}
          <div>
            <img src="/logo-header.png" alt="Imperio Verde Growshop" style={{ display: 'block', width: '190px', maxWidth: '100%', height: 'auto', objectFit: 'contain', marginBottom: '16px' }} />
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
              No vendemos solo insumos: te acompañamos con asesoramiento técnico y soluciones completas para que logres la máxima producción en tu cultivo.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a 
                href="https://www.instagram.com/imperioverdegrowshop/"
                target="_blank" 
                rel="noreferrer" 
                aria-label="Instagram de Imperio Verde"
                title="Instagram"
                style={{ padding: '8px', backgroundColor: 'rgba(79,20,95,0.1)', borderRadius: '50%', color: '#50145f' }}
                onClick={() => dbService.logEvent(sessionToken, 'social_click', { network: 'instagram' })}
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://wa.me/5491153841079"
                target="_blank" 
                rel="noreferrer" 
                aria-label="WhatsApp de Imperio Verde"
                title="WhatsApp"
                style={{ padding: '8px', backgroundColor: 'rgba(79,20,95,0.1)', borderRadius: '50%', color: '#50145f' }}
                onClick={() => dbService.logEvent(sessionToken, 'social_click', { network: 'whatsapp' })}
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-title)', color: '#3b0c47', fontSize: '1.05rem', marginBottom: '18px', position: 'relative' }}>
              Contacto y Local
              <span style={{ content: '""', position: 'absolute', bottom: '-6px', left: 0, width: '30px', height: '2px', backgroundColor: '#5d176e' }}></span>
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={18} style={{ color: '#5d176e', flexShrink: 0, marginTop: '2px' }} />
                <span>Avenida Triunvirato 4135, Local 5 y 7, CABA, Argentina</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} style={{ color: '#5d176e', flexShrink: 0 }} />
                <a href="tel:+541153841079" className="footer-link">11 5384-1079</a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} style={{ color: '#5d176e', flexShrink: 0 }} />
                <a href="mailto:imperioverdegrowshop@gmail.com" className="footer-link">imperioverdegrowshop@gmail.com</a>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Clock size={18} style={{ color: '#5d176e', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Lunes a Viernes:</strong> 13:00 a 20:00 hs<br />
                  <strong>Sábados:</strong> 13:00 a 18:00 hs
                </div>
              </li>
            </ul>
          </div>

          {/* Policies & Links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-title)', color: '#3b0c47', fontSize: '1.05rem', marginBottom: '18px', position: 'relative' }}>
              Ayuda al Cultivador
              <span style={{ content: '""', position: 'absolute', bottom: '-6px', left: 0, width: '30px', height: '2px', backgroundColor: '#5d176e' }}></span>
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><Link to="/productos" className="footer-link">Ver Catálogo de Insumos</Link></li>
              <li><Link to="/kits" className="footer-link">Kits de Cultivo Inteligentes</Link></li>
              <li><Link to="/hidroponia" className="footer-link">Sistemas y Guías Hidropónicas</Link></li>
              <li><Link to="/resolver" className="footer-link">Diagnóstico de Plagas y Clima</Link></li>
              <li><Link to="/guias" className="footer-link">Blog & Consejos de Cultivo</Link></li>
              <li><Link to="/admin" className="footer-link" style={{ color: 'rgba(79,20,95,0.68)' }}>Panel Administrador</Link></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-title)', color: '#3b0c47', fontSize: '1.05rem', marginBottom: '18px', position: 'relative' }}>
              Base de Datos Cultivadores
              <span style={{ content: '""', position: 'absolute', bottom: '-6px', left: 0, width: '30px', height: '2px', backgroundColor: '#5d176e' }}></span>
            </h4>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '12px' }}>
              Sumate para recibir guías de cultivo en PDF, checklists de mantenimiento y ofertas de reposición exclusivas.
            </p>
            {submitted ? (
              <div style={{ backgroundColor: 'rgba(79,20,95,0.1)', border: '1px solid rgba(79,20,95,0.25)', padding: '12px', borderRadius: '4px', textAlign: 'center', fontSize: '0.8rem', color: '#50145f' }}>
                <ShieldCheck size={18} style={{ display: 'block', margin: '0 auto 4px' }} />
                ¡Te sumamos! Revisá tu correo para el PDF.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Tu Nombre" 
                  value={name} 
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className="input footer-input"
                  style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                  autoComplete="name"
                  minLength={2}
                  maxLength={60}
                  aria-invalid={Boolean(formError)}
                  required
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input 
                    type="email" 
                    placeholder="tuemail@correo.com" 
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formError) setFormError('');
                    }}
                    className="input footer-input"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    autoComplete="email"
                    maxLength={254}
                    aria-invalid={Boolean(formError)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }} disabled={isSubmitting} aria-label="Sumarme a la base de datos">
                    <Send size={14} />
                  </button>
                </div>
                {formError && (
                  <div role="alert" style={{ color: '#ff8a80', fontSize: '0.75rem', lineHeight: 1.35 }}>
                    {formError}
                  </div>
                )}
              </form>
            )}
          </div>

        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(79,20,95,0.18)', padding: '20px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.75rem' }}>
          <div>
            © {new Date().getFullYear()} Imperio Verde Grow Shop. Todos los derechos reservados.
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', color: 'rgba(79,20,95,0.72)' }}>
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
          color: #2f0839;
          padding-left: 4px;
        }
        .footer-input {
          background-color: rgba(255,255,255,0.42);
          border-color: rgba(79,20,95,0.38);
          color: #3b0c47;
        }
        .footer-input::placeholder {
          color: rgba(79,20,95,0.64);
        }
        .footer-input:focus {
          border-color: #5d176e;
          box-shadow: 0 0 0 3px rgba(93,23,110,0.14);
        }
      `}</style>
    </footer>
  );
};
