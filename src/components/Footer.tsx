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
    <footer className="site-footer" style={{ padding: '64px 0 20px', marginTop: '60px', fontSize: '0.9rem' }}>
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
                className="footer-social-link"
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
                className="footer-social-link"
                onClick={() => dbService.logEvent(sessionToken, 'social_click', { network: 'whatsapp' })}
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="footer-heading" style={{ fontFamily: 'var(--font-title)', fontSize: '1.05rem', marginBottom: '18px', position: 'relative' }}>
              Contacto y Local
              <span className="footer-heading-line"></span>
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={18} className="footer-icon" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Avenida Triunvirato 4135, Local 5 y 7, CABA, Argentina</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} className="footer-icon" style={{ flexShrink: 0 }} />
                <a href="tel:+541153841079" className="footer-link">11 5384-1079</a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} className="footer-icon" style={{ flexShrink: 0 }} />
                <a href="mailto:imperioverdegrowshop@gmail.com" className="footer-link">imperioverdegrowshop@gmail.com</a>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Clock size={18} className="footer-icon" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Lunes a Viernes:</strong> 13:00 a 20:00 hs<br />
                  <strong>Sábados:</strong> 13:00 a 18:00 hs
                </div>
              </li>
            </ul>
          </div>

          {/* Policies & Links */}
          <div>
            <h4 className="footer-heading" style={{ fontFamily: 'var(--font-title)', fontSize: '1.05rem', marginBottom: '18px', position: 'relative' }}>
              Ayuda al Cultivador
              <span className="footer-heading-line"></span>
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><Link to="/productos" className="footer-link">Ver Catálogo de Insumos</Link></li>
              <li><Link to="/kits" className="footer-link">Kits de Cultivo Inteligentes</Link></li>
              <li><Link to="/hidroponia" className="footer-link">Sistemas y Guías Hidropónicas</Link></li>
              <li><Link to="/resolver" className="footer-link">Diagnóstico de Plagas y Clima</Link></li>
              <li><Link to="/guias" className="footer-link">Blog & Consejos de Cultivo</Link></li>
              <li><Link to="/admin" className="footer-link footer-admin-link">Panel Administrador</Link></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="footer-newsletter">
            <h4 className="footer-heading" style={{ fontFamily: 'var(--font-title)', fontSize: '1.05rem', marginBottom: '18px', position: 'relative' }}>
              Base de Datos Cultivadores
              <span className="footer-heading-line"></span>
            </h4>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '12px' }}>
              Sumate para recibir guías de cultivo en PDF, checklists de mantenimiento y ofertas de reposición exclusivas.
            </p>
            {submitted ? (
              <div style={{ backgroundColor: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.24)', padding: '12px', borderRadius: '8px', textAlign: 'center', fontSize: '0.8rem', color: '#9fffc9' }}>
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
        <div className="footer-bottom" style={{ padding: '20px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.75rem' }}>
          <div>
            © {new Date().getFullYear()} Imperio Verde Grow Shop. Todos los derechos reservados.
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', color: 'rgba(210,226,216,0.62)' }}>
            <span>💳 Mercado Pago</span>
            <span>🚛 Correo Argentino / Andreani</span>
            <span>🏠 Retiro Local</span>
          </div>
        </div>

      </div>
      <style>{`
        .site-footer {
          position: relative;
          overflow: hidden;
          color: #bcd0c2;
          background:
            radial-gradient(circle at 12% 15%, rgba(236,212,68,0.08), transparent 28%),
            radial-gradient(circle at 92% 18%, rgba(142,36,170,0.15), transparent 30%),
            linear-gradient(135deg, #040c08 0%, #0a1d12 52%, #140a18 100%);
          border-top: 1px solid rgba(236,212,68,0.34);
          box-shadow: 0 -12px 40px rgba(0,0,0,0.22);
        }
        .site-footer::before {
          content: '';
          position: absolute;
          inset: 0 0 auto 0;
          height: 3px;
          background: linear-gradient(90deg, #00e676 0%, #ecd444 48%, #8e24aa 100%);
        }
        .footer-heading {
          color: #f5f8f6;
        }
        .footer-heading-line {
          position: absolute;
          bottom: -6px;
          left: 0;
          width: 34px;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, #ecd444, #d45aee);
        }
        .footer-icon {
          color: #ecd444;
        }
        .footer-social-link {
          display: inline-flex;
          padding: 9px;
          border-radius: 50%;
          color: #ecd444;
          background-color: rgba(236,212,68,0.06);
          border: 1px solid rgba(236,212,68,0.24);
          transition: color 180ms ease, border-color 180ms ease, background-color 180ms ease, transform 180ms ease;
        }
        .footer-social-link:hover {
          color: #d45aee;
          border-color: rgba(212,90,238,0.6);
          background-color: rgba(142,36,170,0.12);
          transform: translateY(-2px);
        }
        .footer-newsletter {
          padding: 20px;
          margin: -20px;
          border: 1px solid rgba(142,36,170,0.22);
          border-radius: 14px;
          background: linear-gradient(145deg, rgba(142,36,170,0.11), rgba(0,230,118,0.025));
        }
        .footer-bottom {
          border-top: 1px solid rgba(236,212,68,0.14);
        }
        .footer-link {
          color: #c8d8cd;
          transition: var(--transition-smooth);
        }
        .footer-link:hover {
          color: #ecd444;
          padding-left: 4px;
        }
        .footer-admin-link {
          color: rgba(188,208,194,0.58);
        }
        .footer-input {
          background-color: rgba(1,8,4,0.62);
          border-color: rgba(236,212,68,0.22);
          color: #f5f8f6;
        }
        .footer-input::placeholder {
          color: rgba(200,216,205,0.48);
        }
        .footer-input:focus {
          border-color: #d45aee;
          box-shadow: 0 0 0 3px rgba(142,36,170,0.14);
        }
        @media (max-width: 600px) {
          .footer-newsletter {
            margin: 0;
          }
        }
      `}</style>
    </footer>
  );
};
