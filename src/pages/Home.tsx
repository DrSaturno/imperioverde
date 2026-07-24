import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dbService, Product, Kit } from '../services/db';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, HelpCircle, ShieldCheck, Flame, Info, Leaf, Plus, Droplets, Wind, Sparkles } from 'lucide-react';
import { getProductImage } from './Shop';

const CATEGORIES = [
  { cat: 'Fertilizantes', label: 'Fertilizantes', icon: '🧪', img: '/home/category-fertilizantes.jpg' },
  { cat: 'Sustratos y Medios', label: 'Sustratos y Medios', icon: '🪨', img: '/home/category-sustratos.jpg' },
  { cat: 'Iluminación', label: 'Iluminación', icon: '💡', img: '/home/category-iluminacion.jpg' },
  { cat: 'Ventilación y Clima', label: 'Ventilación y Clima', icon: '💨', img: '/home/category-ventilacion.jpg' },
  { cat: 'Macetas', label: 'Macetas y Carpas', icon: '🪴', img: '/home/category-macetas.jpg' },
  { cat: 'Riego', label: 'Riego y Auto', icon: '💧', img: '/home/category-riego.jpg' },
  { cat: 'Medición', label: 'Medición Digital', icon: '📊', img: '/home/category-medicion.jpg' },
  { cat: 'Control de Plagas', label: 'Control de Plagas', icon: '🐛', img: '/home/category-plagas.jpg' },
  { cat: 'Parafernalia', label: 'Parafernalia', icon: '🦁', img: '/home/category-parafernalia.jpg' }
];

export const Home: React.FC = () => {
  const { addToCart, addKitToCart, sessionToken } = useCart();
  const { showToast } = useToast();
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
    showToast(`"${product.name}" agregado al carrito`);
  };

  const handleKitAdd = async (kit: Kit) => {
    await addKitToCart(kit);
    showToast(`Componentes del "${kit.name}" agregados con descuento`);
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
      
      {/* 1. FULL WIDTH HERO VIDEO HEADER */}
      <section className="hero-video-section">
        <video
          src="/videoloop1.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="hero-video-element"
        />
        <div className="hero-video-overlay" />

        <div className="container hero-video-content">
          <div style={{ display: 'inline-flex' }}>
            <span className="badge badge-yellow">✨ EL IMPERIO DE MARIHUANA MÁS MÁGICO ✨</span>
          </div>

          <h1 className="hero-video-title">
            TODO LO QUE NECESITÁS PARA <br className="hero-br-desktop" />
            <span className="hero-highlight-text">CULTIVAR MEJOR</span>
          </h1>

          <p className="hero-video-subtitle">
            Nutrientes alquímicos, equipamiento de fantasía y asesoramiento real para indoor e hidroponía. El secreto de la abundancia sin secretos.
          </p>

          <div className="hero-buttons-group">
            <Link to="/productos" className="btn btn-primary" onClick={() => dbService.logEvent(sessionToken, 'hero_click', { action: 'ver_productos' })}>
              Ver Catálogo Completo <ArrowRight size={18} />
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

          <div className="hero-trust-bar">
            <div className="hero-trust-item">
              <Sparkles size={16} style={{ color: 'var(--action-yellow)' }} />
              <span>Envíos a todo el país</span>
            </div>
            <div className="hero-trust-item">
              <Leaf size={16} style={{ color: 'var(--accent-neon)' }} />
              <span>Asesoramiento cultivo gratis</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTIONS PORTAL / CATEGORIES */}
      <section className="container">
        <div className="imperial-signboard">
          <h2 className="imperial-signboard-title">Categorías de productos</h2>
          <p className="imperial-signboard-subtitle">Encontrá equipamiento certificado y fertilizantes originales</p>
        </div>

        <div className="category-carousel">
          <div className="category-carousel-track">
            {[...CATEGORIES, ...CATEGORIES].map((c, i) => (
              <Link
                key={`${c.cat}-${i}`}
                to={`/productos?categoria=${encodeURIComponent(c.cat)}`}
                className="premium-cover-card category-carousel-item"
                tabIndex={i < CATEGORIES.length ? 0 : -1}
                aria-hidden={i >= CATEGORIES.length}
              >
                <img src={c.img} alt={c.label} className="premium-cover-card-img" loading="lazy" decoding="async" />
                <div className="premium-cover-card-overlay"></div>

                <div className="premium-cover-card-content">
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', fontFamily: 'var(--font-title)', fontWeight: 700 }}>{c.label}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-neon)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: 600 }}>
                    Explorar <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. RESOLVE PROBLEMS SECTION */}
      <section className="container">
        <div className="imperial-signboard">
          <h2 className="imperial-signboard-title">¿Qué misterio botánico necesitás resolver hoy?</h2>
          <p className="imperial-signboard-subtitle">Navegá nuestro imperio a partir del misterio o la necesidad en tu cultivo</p>
        </div>
        <div className="grid grid-cols-3">
          {[
            {
              title: 'Mis plantas crecen lento',
              icon: '🌱',
              desc: 'Posibles causas de deficiencias, sustrato compactado o falta de enraizador. Ver soluciones.',
              path: '/resolver/crecimiento-lento',
              img: '/home/solution-crecimiento-lento.webp'
            },
            {
              title: 'Tengo una plaga o bichos',
              icon: '🐛',
              desc: 'Identificá araña roja, trips o mosca blanca y descubrí los preventivos y curativos ideales.',
              path: '/resolver/tengo-plagas',
              img: '/home/solution-plagas.webp'
            },
            {
              title: 'Controlar humedad o temperatura',
              icon: '💨',
              desc: 'Equipamiento de extracción, coolers, filtros antiolor y medidores de rango térmico.',
              path: '/resolver/controlar-humedad',
              img: '/home/solution-clima.webp'
            },
            {
              title: 'Armar mi primer indoor',
              icon: '💡',
              desc: 'Calculadora de luces, extractores, carpas y configuraciones para comenzar de forma exitosa.',
              path: '/resolver/armar-indoor',
              img: '/home/solution-primer-indoor.webp'
            },
            {
              title: 'Empezar en Hidroponía',
              icon: '🧪',
              desc: 'Cultivo sin suelo. Baldes DWC, nutrientes tri-componente y medidores digitales EC.',
              path: '/hidroponia',
              img: '/home/solution-hidroponia.webp'
            },
            {
              title: 'Mejorar peso y resina (Flora)',
              icon: '🌸',
              desc: 'Estimuladores de floración, azúcares carbohidratos y PK potenciadores de cogollos.',
              path: '/resolver/mejorar-floracion',
              img: '/home/solution-floracion.webp'
            }
          ].map(item => (
            <Link key={item.path} to={item.path} className="premium-cover-card">
              <img src={item.img} alt={item.title} className="premium-cover-card-img" loading="lazy" decoding="async" />
              <div className="premium-cover-card-overlay"></div>
              
              <div className="premium-cover-card-content">
                <h3 style={{ fontSize: '1.15rem', color: '#fff', fontFamily: 'var(--font-title)', fontWeight: 700 }}>{item.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.desc}</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-neon)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontWeight: 600 }}>
                  Ver Soluciones <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED KITS */}
      <section className="container" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '60px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--action-yellow)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
              <Sparkles size={16} /> CÓMBO BOTÁNICO CON DESCUENTOS MÁGICOS
            </div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Kits de Cultivo Alquímicos</h2>
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
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
                  {kit.products.slice(0, 3).map(kp => (
                    <li key={kp.product_id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ backgroundColor: '#f7f8f6', width: '22px', height: '22px', borderRadius: '3px', overflow: 'hidden', flexShrink: 0, display: 'inline-flex' }}>
                        {kp.product && <img src={getProductImage(kp.product)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                      </span>
                      {kp.quantity}x {kp.product?.name || 'Insumo'}
                    </li>
                  ))}
                  {kit.products.length > 3 && <li>y {kit.products.length - 3} componente(s) más…</li>}
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

      {/* 5. SECCIÓN DESTACADA: HIDROPONÍA */}
      <section className="container">
        <div className="glass-card violet home-hydro-banner">
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
              <Link to={`/productos/${product.category.toLowerCase()}/${product.id}`} className="product-card-img-container">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="product-card-img"
                />
              </Link>

              <div className="product-card-body">
                <div className="product-card-brand">{product.brand}</div>
                <Link
                  to={`/productos/${product.category.toLowerCase()}/${product.id}`}
                  className="product-card-title nav-link"
                  title={product.name}
                >
                  {product.name}
                </Link>

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
                <Link to={`/productos/${product.category.toLowerCase()}/${product.id}`} className="btn btn-yellow" style={{ padding: '8px 12px', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Ver Detalle">
                  <Info size={14} />
                </Link>
                {product.stock > 0 ? (
                  <button onClick={() => handleProductAdd(product)} className="btn btn-primary" style={{ padding: '8px 12px', flex: 3, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    <Plus size={12} /> Agregar
                  </button>
                ) : (
                  <span className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-glass)', padding: '8px', flex: 3, fontSize: '0.8rem', cursor: 'not-allowed' }}>Sin Stock</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. WHATSAPP ADVISING CTA */}
      <section className="container">
        <div className="glass-card home-advice-banner">
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
              img: '/home/guide-hidroponia.webp'
            },
            {
              slug: 'como-elegir-luces-indoor',
              title: 'Cómo Dimensionar Iluminación LED para tu Carpa',
              excerpt: 'Watts reales vs watts comerciales. Entendé el espectro PAR y cuánta potencia necesitás según los metros cuadrados de tu espacio indoor.',
              cat: 'Indoor',
              time: '5 min lectura',
              img: '/home/guide-iluminacion-led.webp'
            },
            {
              slug: 'prevencion-de-plagas-indoor',
              title: 'Checklist Semanal para Prevenir Plagas y Hongos',
              excerpt: 'El control y la higiene son la mejor defensa. Cómo utilizar aceite de Neem, jabón potásico e insecticidas biológicos en vegetación.',
              cat: 'Prevención',
              time: '4 min lectura',
              img: '/home/guide-prevencion-plagas.webp'
            }
          ].map(post => (
            <Link key={post.slug} to={`/guias/${post.slug}`} className="premium-cover-card">
              <img src={post.img} alt={post.title} className="premium-cover-card-img" loading="lazy" decoding="async" />
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
            </Link>
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
