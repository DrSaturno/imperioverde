import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dbService, Product, Kit } from '../services/db';
import { useCart } from '../context/CartContext';
import { ArrowRight, HelpCircle, ShieldCheck, Flame, Info, Leaf, Plus, Droplets, Wind, Sparkles } from 'lucide-react';
import { getProductImage } from './Shop';

export const Home: React.FC = () => {
  const { addToCart, addKitToCart, sessionToken } = useCart();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);

  useEffect(() => {
    // Fetch top products and kits
    dbService.getProducts().then(products => {
      // Pick 4 popular products
      // Alien Skin (p-001), Amazonia (p-002), Balanza (p-004), Extractor (p-031)
      const popular = products.filter(p => 
        ['p-001', 'p-002', 'p-004', 'p-031'].includes(p.id)
      );
      setFeaturedProducts(popular.length > 0 ? popular : products.slice(0, 4));
    });

    dbService.getKits().then(setKits);
  }, []);

  const handleProductAdd = async (product: Product) => {
    await addToCart(product, 1);
    alert(`¡"${product.name}" agregado al carrito!`);
  };

  const handleKitAdd = async (kit: Kit) => {
    await addKitToCart(kit);
    alert(`¡Componentes del "${kit.name}" agregados con descuento!`);
    navigate('/carrito');
  };

  // WhatsApp contextual triggers
  const getWhatsAppLink = (context: string) => {
    let msg = '';
    if (context === 'general') {
      msg = 'Hola Imperio Verde, estoy en la web y necesito asesoramiento para armar mi cultivo.';
    } else if (context === 'indoor') {
      msg = 'Hola Imperio Verde, quiero armar un indoor y necesito asesoramiento sobre iluminación y ventilación.';
    } else if (context === 'hidro') {
      msg = 'Hola Imperio Verde, quiero empezar en hidroponía y necesito que me recomienden un sistema.';
    }
    return `https://wa.me/5491153841079?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
      
      {/* 1. HERO SECTION */}
      <section className="container" style={{ marginTop: '20px' }}>
        <div 
          className="glass-card" 
          style={{ 
            padding: '80px 40px', 
            borderRadius: 'var(--radius-lg)', 
            backgroundImage: 'linear-gradient(135deg, rgba(10, 27, 18, 0.95) 0%, rgba(18, 40, 28, 0.7) 100%), url("/IMG Perfil_4.png")',
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            border: '1px solid rgba(0, 230, 118, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            maxWidth: '1200px'
          }}
        >
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start' }}>
            <span className="badge badge-green">🍁 EXPERTOS EN CULTIVO & HIDROPONÍA</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-title)', lineHeight: 1.1, maxWidth: '700px', fontWeight: 800 }}>
            TODO LO QUE NECESITÁS PARA <span style={{ color: 'var(--accent-neon)' }}>CULTIVAR MEJOR</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', fontWeight: 500 }}>
            Equipamiento técnico, nutrición especializada y asesoramiento real para indoor, exterior e hidroponía. Sin vueltas ni tecnicismos difíciles.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
            <Link to="/productos" className="btn btn-primary" onClick={() => dbService.logEvent(sessionToken, 'hero_click', { action: 'ver_productos' })}>
              Ver Catálogo Completo <ArrowRight size={16} />
            </Link>
            <a 
              href={getWhatsAppLink('general')} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-outline"
              onClick={() => dbService.logEvent(sessionToken, 'whatsapp_click', { location: 'hero_asesoramiento' })}
            >
              Pedir Asesoramiento Gratis
            </a>
          </div>
        </div>
      </section>

      {/* 2. RESOLVE PROBLEMS SECTION */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', marginBottom: '12px' }}>¿Qué necesitás resolver hoy?</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Navegá nuestra tienda a partir de la necesidad o el problema directo en tu cultivo</p>
        </div>
        <div className="grid grid-cols-3">
          {[
            {
              title: 'Mis plantas crecen lento',
              icon: '🌱',
              desc: 'Posibles causas de deficiencias, sustrato compactado o falta de enraizador. Ver soluciones.',
              path: '/resolver/crecimiento-lento',
              img: 'https://images.unsplash.com/photo-1530983824418-91136267e122?q=80&w=600&auto=format&fit=crop'
            },
            {
              title: 'Tengo una plaga o bichos',
              icon: '🐛',
              desc: 'Identificá araña roja, trips o mosca blanca y descubrí los preventivos y curativos ideales.',
              path: '/resolver/tengo-plagas',
              img: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=600&auto=format&fit=crop'
            },
            {
              title: 'Controlar humedad o temperatura',
              icon: '💨',
              desc: 'Equipamiento de extracción, coolers, filtros antiolor y medidores de rango térmico.',
              path: '/resolver/controlar-humedad',
              img: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=600&auto=format&fit=crop'
            },
            {
              title: 'Armar mi primer indoor',
              icon: '💡',
              desc: 'Calculadora de luces, extractores, carpas y configuraciones para comenzar de forma exitosa.',
              path: '/resolver/armar-indoor',
              img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop'
            },
            {
              title: 'Empezar en Hidroponía',
              icon: '🧪',
              desc: 'Cultivo sin suelo. Baldes DWC, nutrientes tri-componente y medidores digitales EC.',
              path: '/hidroponia',
              img: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?q=80&w=600&auto=format&fit=crop'
            },
            {
              title: 'Mejorar peso y resina (Flora)',
              icon: '🌸',
              desc: 'Estimuladores de floración, azúcares carbohidratos y PK potenciadores de cogollos.',
              path: '/resolver/mejorar-floracion',
              img: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600&auto=format&fit=crop'
            }
          ].map(item => (
            <div key={item.path} className="premium-cover-card" onClick={() => navigate(item.path)}>
              <img src={item.img} alt={item.title} className="premium-cover-card-img" />
              <div className="premium-cover-card-overlay"></div>
              
              <div className="premium-cover-card-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', fontFamily: 'var(--font-title)', fontWeight: 700 }}>{item.title}</h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.desc}</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-neon)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontWeight: 600 }}>
                  Ver Soluciones <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED KITS */}
      <section className="container" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '60px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--action-yellow)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
              <Sparkles size={16} /> AHORRÁ COMPRANDO SOLUCIONES COMPLETAS
            </div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Kits de Cultivo Inteligentes</h2>
          </div>
          <Link to="/kits" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Ver Todos los Kits <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-3">
          {kits.map(kit => (
            <div key={kit.id} className="glass-card" style={{ borderTop: '4px solid var(--action-yellow)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-yellow">¡AHORRÁ {kit.discount_percentage}%!</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>Nivel: {kit.difficulty_level}</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{kit.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {kit.description}
                </p>
              </div>

              {/* Kit Components Preview */}
              <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>Componentes incluidos:</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)' }}>
                  {kit.products.slice(0, 3).map(kp => (
                    <li key={kp.product_id}>• {kp.quantity}x {kp.product?.name || 'Insumo'}</li>
                  ))}
                  {kit.products.length > 3 && <li>y {kit.products.length - 3} componente(s) más...</li>}
                </ul>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
                  <div>
                    <span style={{ textDecoration: 'line-through', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ${Math.round(kit.price / (1 - kit.discount_percentage / 100)).toLocaleString()}
                    </span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ${kit.price.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ color: 'var(--accent-neon)', fontSize: '0.8rem', fontWeight: 600 }}>
                    Ahorrás ${(Math.round(kit.price / (1 - kit.discount_percentage / 100)) - kit.price).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to={`/kits/${kit.id}`} className="btn btn-outline" style={{ flex: 1, padding: '10px' }}>Detalles</Link>
                  <button onClick={() => handleKitAdd(kit)} className="btn btn-yellow" style={{ flex: 2, padding: '10px' }}>Llevar Kit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SECTIONS PORTAL / CATEGORIES */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', marginBottom: '12px' }}>Categorías del E-commerce</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Encontrá equipamiento certificado y fertilizantes originales</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {[
            { cat: 'Fertilizantes', label: 'Fertilizantes', icon: '🧪', img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600&auto=format&fit=crop' },
            { cat: 'Sustratos y Medios', label: 'Sustratos y Medios', icon: '🪨', img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600&auto=format&fit=crop' },
            { cat: 'Iluminación', label: 'Iluminación', icon: '💡', img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop' },
            { cat: 'Ventilación y Clima', label: 'Ventilación y Clima', icon: '💨', img: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=600&auto=format&fit=crop' },
            { cat: 'Macetas', label: 'Macetas y Carpas', icon: '🪴', img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600&auto=format&fit=crop' },
            { cat: 'Riego', label: 'Riego y Auto', icon: '💧', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600&auto=format&fit=crop' },
            { cat: 'Medición', label: 'Medición Digital', icon: '📊', img: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=600&auto=format&fit=crop' },
            { cat: 'Control de Plagas', label: 'Control de Plagas', icon: '🐛', img: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=600&auto=format&fit=crop' },
            { cat: 'Parafernalia', label: 'Parafernalia', icon: '🦁', img: 'https://images.unsplash.com/photo-1606166325012-7da4a0fc0a0b?q=80&w=600&auto=format&fit=crop' }
          ].map(c => (
            <div 
              key={c.cat} 
              onClick={() => navigate(`/productos?categoria=${encodeURIComponent(c.cat)}`)}
              className="premium-cover-card"
              style={{ height: '220px' }}
            >
              <img src={c.img} alt={c.label} className="premium-cover-card-img" />
              <div className="premium-cover-card-overlay"></div>
              
              <div className="premium-cover-card-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', fontFamily: 'var(--font-title)', fontWeight: 700 }}>{c.label}</h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-neon)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: 600 }}>
                  Explorar <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SECCIÓN DESTACADA: HIDROPONÍA */}
      <section className="container">
        <div 
          className="glass-card violet" 
          style={{ 
            padding: '60px 40px', 
            borderRadius: 'var(--radius-lg)', 
            backgroundImage: 'linear-gradient(135deg, rgba(20, 10, 30, 0.95) 0%, rgba(142, 36, 170, 0.25) 100%), url("/IMG Perfil_2.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid rgba(142, 36, 170, 0.4)',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span className="badge badge-violet" style={{ alignSelf: 'flex-start' }}>🧪 SECCIÓN ESPECIALIZADA</span>
            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
              Hidroponía: Cultivá en Agua con Precisión
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.5 }}>
              El cultivo hidropónico te permite maximizar cosechas y acortar tiempos mediante la dosificación directa en raíces oxigenadas. Te equipamos con sistemas completos de recirculación, aireadores de flujo constante, nutrientes tri-componente estabilizados y medidores de conductividad (EC).
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/hidroponia" className="btn btn-violet">
                Ir al Centro Hidropónico <ArrowRight size={16} />
              </Link>
              <a 
                href={getWhatsAppLink('hidro')} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-outline"
                style={{ borderColor: 'rgba(142, 36, 170, 0.4)' }}
              >
                Consultar Técnico en Hidro
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {/* Visual hydro element */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(142, 36, 170, 0.2)', padding: '24px', borderRadius: 'var(--radius-md)', textAlign: 'center', width: '100%', maxWidth: '280px' }}>
              <Droplets size={40} style={{ color: '#e040fb', marginBottom: '12px' }} />
              <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', fontWeight: 600, marginBottom: '6px' }}>¿Empezando en Hidro?</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Resolvé nuestro cuestionario inteligente y te armamos la configuración ideal.</p>
              <Link to="/hidroponia" className="btn btn-violet" style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%' }}>Resolver Cuestionario</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-neon)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
              <Flame size={16} /> LOS MÁS ELEGIDOS POR LA COMUNIDAD
            </div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Productos Recomendados</h2>
          </div>
          <Link to="/productos" className="btn btn-outline">
            Ver Todos los Productos
          </Link>
        </div>

        <div className="grid grid-cols-4">
          {featuredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-card-img-container">
                <img 
                  src={getProductImage(product)} 
                  alt={product.name} 
                  className="product-card-img" 
                  onClick={() => navigate(`/productos/${product.category.toLowerCase()}/${product.id}`)}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              <div className="product-card-body">
                <div className="product-card-brand">{product.brand}</div>
                <h3 
                  className="product-card-title nav-link"
                  onClick={() => navigate(`/productos/${product.category.toLowerCase()}/${product.id}`)}
                  style={{ cursor: 'pointer' }}
                  title={product.name}
                >
                  {product.name}
                </h3>

                <div className="product-card-price-row">
                  {product.promotional_price ? (
                    <>
                      <span className="product-card-promo-price">
                        ${product.promotional_price.toLocaleString()}
                      </span>
                      <span className="product-card-old-price">
                        ${product.price.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="product-card-price">
                      ${product.price.toLocaleString()}
                    </span>
                  )}
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>COD: {product.id.slice(0, 5)}</span>
                </div>
              </div>

              <div className="product-card-footer">
                <Link to={`/productos/${product.category.toLowerCase()}/${product.id}`} className="btn btn-outline" style={{ padding: '8px 12px', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Ver Detalle">
                  <Info size={14} />
                </Link>
                {product.stock > 0 ? (
                  <button onClick={() => handleProductAdd(product)} className="btn btn-primary" style={{ padding: '8px 12px', flex: 3, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    <Plus size={12} /> Agregar
                  </button>
                ) : (
                  <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '8px', borderRadius: '4px', textAlign: 'center', flex: 3, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sin Stock</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. WHATSAPP ADVISING CTA */}
      <section className="container">
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '30px', padding: '40px', borderLeft: '6px solid var(--accent-neon)' }}>
          <div style={{ maxWidth: '650px' }}>
            <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)', marginBottom: '8px' }}>¿No sabés qué elegir para empezar a cultivar?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Contanos qué querés plantar, cuál es tu espacio físico y tu cantidad de plantas. Nuestro equipo de Imperio Verde te arma el presupuesto con las combinaciones ideales sin que compres de más.
            </p>
          </div>
          <div>
            <a 
              href={getWhatsAppLink('general')} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-primary pulse-button"
              style={{ padding: '16px 32px', backgroundColor: '#25D366', color: '#fff', fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
              onClick={() => dbService.logEvent(sessionToken, 'whatsapp_click', { location: 'advising_section' })}
            >
              💬 Consultar Asesor Técnico
            </a>
          </div>
        </div>
      </section>

      {/* 8. CONTENIDO EDUCATIVO / BLOG */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', marginBottom: '12px' }}>Guías y Consejos para Cultivadores</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Aprender es la clave para una cosecha abundante. Sin secretos.</p>
        </div>

        <div className="grid grid-cols-3">
          {[
            {
              slug: 'guia-inicial-hidroponia',
              title: 'Guía Inicial de Hidroponía para Principiantes',
              excerpt: 'Aprendé las bases fundamentales del cultivo sin suelo. Qué es el sistema DWC, cómo oxigenar el agua y cómo dosificar los nutrientes base.',
              cat: 'Hidroponía',
              time: '6 min lectura',
              img: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=600&auto=format&fit=crop'
            },
            {
              slug: 'como-elegir-luces-indoor',
              title: 'Cómo Dimensionar Iluminación LED para tu Carpa',
              excerpt: 'Watts reales vs watts comerciales. Entendé el espectro PAR y cuánta potencia necesitás según los metros cuadrados de tu espacio indoor.',
              cat: 'Indoor',
              time: '5 min lectura',
              img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop'
            },
            {
              slug: 'prevencion-de-plagas-indoor',
              title: 'Checklist Semanal para Prevenir Plagas y Hongos',
              excerpt: 'El control y la higiene son la mejor defensa. Cómo utilizar aceite de Neem, jabón potásico e insecticidas biológicos en vegetación.',
              cat: 'Prevención',
              time: '4 min lectura',
              img: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=600&auto=format&fit=crop'
            }
          ].map(post => (
            <div key={post.slug} className="premium-cover-card" onClick={() => navigate(`/guias/${post.slug}`)}>
              <img src={post.img} alt={post.title} className="premium-cover-card-img" />
              <div className="premium-cover-card-overlay"></div>
              
              <div className="premium-cover-card-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', width: '100%' }}>
                  <span style={{ color: 'var(--accent-neon)', fontWeight: 700, textTransform: 'uppercase' }}>{post.cat}</span>
                  <span style={{ color: '#fff' }}>{post.time}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', color: '#fff', fontFamily: 'var(--font-title)', fontWeight: 700, lineHeight: 1.3 }}>{post.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>{post.excerpt}</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-neon)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: 600 }}>
                  Leer Guía Completa <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. CONFIANZA */}
      <section className="container" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', textAlign: 'center' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: 'rgba(0, 230, 118, 0.08)', padding: '16px', borderRadius: '50%', color: 'var(--accent-neon)' }}>
              <ShieldCheck size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)' }}>Compra 100% Segura</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
              Tus pagos se procesan con la seguridad oficial de Mercado Pago. Resguardo completo de tus datos.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: 'rgba(0, 230, 118, 0.08)', padding: '16px', borderRadius: '50%', color: 'var(--accent-neon)' }}>
              <Leaf size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)' }}>Marcas Oficiales</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
              Productos originales directo del fabricante (Amazing, Top Crop, Namasté, Powder Feeding).
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: 'rgba(0, 230, 118, 0.08)', padding: '16px', borderRadius: '50%', color: 'var(--accent-neon)' }}>
              <Wind size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)' }}>Soporte Poscompra</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
              ¿Inquietudes con el armado o la aplicación? Nos escribís al WhatsApp y te ayudamos.
            </p>
          </div>

        </div>
      </section>

      {styleMobileFixes}
    </div>
  );
};

// Help hide/show specific elements and layout shifts on mobile
const styleMobileFixes = (
  <style>{`
    @media (max-width: 768px) {
      h1 {
        font-size: 2.2rem !important;
      }
      .glass-card {
        padding: 30px 20px !important;
      }
      .glass-card.violet {
        grid-template-columns: 1fr !important;
        gap: 30px !important;
      }
    }
  `}</style>
);
