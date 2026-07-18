import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dbService, Product, Kit } from '../services/db';
import { useCart } from '../context/CartContext';
import { ChevronRight, ArrowRight, ShieldCheck, AlertCircle, Compass, HelpCircle, Activity } from 'lucide-react';

interface ProblemDetail {
  title: string;
  emoji: string;
  intro: string;
  causes: string[];
  tips: string[];
  categoryTag: string; // for querying products
}

const PROBLEMS: Record<string, ProblemDetail> = {
  'crecimiento-lento': {
    title: 'Mis plantas crecen lento',
    emoji: '🌱',
    intro: 'Si tus plantas están estancadas en etapa vegetativa, generalmente se debe a asfixia radicular, falta de estimulante de raíces o desequilibrio en el pH del agua que bloquea la absorción de nitrógeno.',
    causes: [
      'Sustrato compactado y sin suficiente perlita (falta de oxígeno en raíces).',
      'pH del agua superior a 6.5 (impide absorber hierro y nitrógeno).',
      'Temperatura radicular extremadamente baja (frena el metabolismo).'
    ],
    tips: [
      'Dejá secar bien el sustrato entre riegos para promover la búsqueda de agua y oxigenación.',
      'Medí el pH del agua y ajustalo a 5.8-6.2 antes de regar.',
      'Utilizá micorrizas o enraizadores biológicos para multiplicar los pelos absorbentes.'
    ],
    categoryTag: 'Fertilizantes'
  },
  'tengo-plagas': {
    title: 'Tengo una plaga o bichos',
    emoji: '🐛',
    intro: 'Las plagas (araña roja, trips, mosca blanca) y hongos se multiplican velozmente bajo temperaturas altas y aire estancado. La clave es el monitoreo diario debajo de las hojas.',
    causes: [
      'Humedad excesivamente alta combinada con mala ventilación.',
      'Falta de aplicación de preventivos durante la etapa de crecimiento.',
      'Ingreso de patógenos del exterior (mascotas o ropa).'
    ],
    tips: [
      'Pulverizá aceite de Neem y jabón potásico cada 7 días en vegetación de forma preventiva.',
      'Instalá trampas cromáticas amarillas para atrapar insectos voladores antes de que desoven.',
      'Desinfectá tus manos y herramientas de poda con alcohol antes de tocar tu cultivo.'
    ],
    categoryTag: 'Control de Plagas'
  },
  'controlar-humedad': {
    title: 'Controlar humedad y temperatura',
    emoji: '💨',
    intro: 'El exceso de humedad en floración avanzada provoca botritis (pudrición de cogollos). La falta de humedad en crecimiento frena el crecimiento. Necesitás un ambiente dinámico.',
    causes: [
      'Extractor subdimensionado para el tamaño del indoor.',
      'Falta de un cooler extractor lineal para mover el aire estancado.',
      'Falta de un filtro antiolor de carbón activo saturado.'
    ],
    tips: [
      'Calculá el caudal de tu extractor: Volumen de tu carpa (Largo x Ancho x Alto) x 30.',
      'Mantené encendida la extracción las 24 horas durante floración.',
      'Colocá un ventilador oscilante interno apuntando sobre la copa de las plantas para evitar bolsas de humedad.'
    ],
    categoryTag: 'Ventilación y Clima'
  },
  'armar-indoor': {
    title: 'Armar mi primer indoor',
    emoji: '💡',
    intro: 'Armar tu propio espacio de cultivo indoor requiere equilibrar la potencia de luz (watts reales) con la capacidad de extracción de aire para evitar bolsas de calor.',
    causes: [
      'Comprar focos de luz hogareños sin espectro PAR adecuado.',
      'No dimensionar la ventilación compatible con la potencia lumínica.',
      'Usar macetas comunes sin perforaciones de drenaje.'
    ],
    tips: [
      'Para un espacio de 80x80cm, una luz LED de 150-200W reales es la configuración ideal.',
      'Utilizá siempre extractores con rulemán o buje de buena marca para funcionamiento continuo.',
      'Colocá bandejas de goteo debajo de las macetas para recolectar el sobrante de riego.'
    ],
    categoryTag: 'Macetas'
  },
  'mejorar-floracion': {
    title: 'Mejorar peso y resina (Floración)',
    emoji: '🌸',
    intro: 'La etapa de floración requiere altos niveles de fósforo, potasio y azúcares carbohidratos. Un abono base no es suficiente para cogollos densos y pesados.',
    causes: [
      'Falta de un PK potenciador concentrado a partir de la semana 4 de flora.',
      'Niveles de luz insuficientes para activar la fotosíntesis pesada.',
      'No realizar lavado de raíces previo a la cosecha (provoca ceniza negra y mal sabor).'
    ],
    tips: [
      'Agregá Bud Candy o carbohidratos simples para alimentar las bacterias benéficas y aportar resina.',
      'Aplicá PK booster en dosis progresivas semanales, respetando el lavado de raíces.',
      'Mantené la humedad relativa por debajo del 45% en las últimas semanas para evitar hongos.'
    ],
    categoryTag: 'Fertilizantes'
  }
};

export const Diagnostic: React.FC = () => {
  const { problema } = useParams<{ problema: string }>();
  const navigate = useNavigate();
  const { addToCart, sessionToken } = useCart();
  
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedKits, setRelatedKits] = useState<Kit[]>([]);

  useEffect(() => {
    // If no problem param, show index list
    if (!problema) {
      setProblem(null);
      return;
    }
    
    const pDetail = PROBLEMS[problema];
    if (!pDetail) {
      navigate('/resolver');
      return;
    }
    
    dbService.logEvent(sessionToken, 'diagnostic_landing_view', { problem_slug: problema });
    setProblem(pDetail);

    // Fetch related products
    dbService.getProducts().then(async prods => {
      // Find products matching categoryTag
      const match = prods.filter(p => p.category === pDetail.categoryTag).slice(0, 4);
      setRelatedProducts(match);

      // Find kits matching environment/interest
      const allKits = await dbService.getKits();
      const matchKits = allKits.filter(k => 
        k.interests.includes(problema.includes('indoor') ? 'indoor' : '') ||
        k.interests.includes(problema.includes('hidro') ? 'hidroponia' : '')
      );
      setRelatedKits(matchKits.slice(0, 2));
    });

  }, [problema, navigate, sessionToken]);

  const handleProductAdd = async (product: Product) => {
    await addToCart(product, 1);
    alert(`¡"${product.name}" agregado al carrito!`);
  };

  const getWhatsAppLink = () => {
    const msg = `Hola Imperio Verde, tengo problemas en mi cultivo con: "${problem?.title}". ¿Me recomiendan una solución?`;
    return `https://wa.me/5491153841079?text=${encodeURIComponent(msg)}`;
  };

  // 1. Index Landing list if no param is set
  if (!problem) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-neon)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '12px' }}>
            <Activity size={16} /> ASESORAMIENTO E-COMMERCE ACTIVO
          </div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
            ¿Qué inconveniente tenés en tu cultivo?
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto' }}>
            Seleccioná una guía de diagnóstico rápido para ver causas comunes y los insumos compatibles recomendados por nuestros expertos.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
          {Object.entries(PROBLEMS).map(([slug, item]) => (
            <div 
              key={slug} 
              onClick={() => navigate(`/resolver/${slug}`)}
              className="glass-card" 
              style={{ display: 'flex', flexDirection: 'column', gap: '14px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)' }}>{item.title}</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.intro}</p>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-neon)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: 'auto', fontWeight: 600 }}>Ver Diagnóstico <ArrowRight size={12} /></span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Specific landing page
  return (
    <div className="container">
      
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '30px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'var(--accent-neon)' }}>Inicio</Link>
        <ChevronRight size={12} />
        <Link to="/resolver" style={{ color: 'var(--accent-neon)' }}>Resolver Problemas</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)' }}>{problem.title}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '50px', marginBottom: '60px' }} className="diagnostic-split">
        
        {/* Left Column: Causes & Tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '3rem' }}>{problem.emoji}</span>
            <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>{problem.title}</h1>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>{problem.intro}</p>

          {/* Causes */}
          <div className="glass-card" style={{ borderLeft: '4px solid #ef5350' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', color: '#ef5350', marginBottom: '14px' }}>
              <AlertCircle size={18} /> Causas más habituales:
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {problem.causes.map((c, i) => (
                <li key={i}>• {c}</li>
              ))}
            </ul>
          </div>

          {/* Steps / Tips */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-neon)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', color: 'var(--accent-neon)', marginBottom: '14px' }}>
              <ShieldCheck size={18} /> Plan de acción sugerido:
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {problem.tips.map((t, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ backgroundColor: 'rgba(0, 230, 118, 0.12)', color: 'var(--accent-neon)', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.75rem' }}>
                    {i+1}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Right Column: WhatsApp and related items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Advising trigger */}
          <div className="glass-card" style={{ border: '1px solid var(--accent-neon)', backgroundColor: 'rgba(0, 230, 118, 0.02)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', marginBottom: '12px' }}>¿Necesitás diagnóstico en vivo?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Mandanos una foto de las hojas de tus plantas a nuestro WhatsApp. Te ayudamos a identificar el problema en minutos.
            </p>
            <a 
              href={getWhatsAppLink()} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-primary"
              style={{ backgroundColor: '#25D366', color: '#fff', width: '100%', display: 'inline-flex', justifyContent: 'center' }}
              onClick={() => dbService.logEvent(sessionToken, 'whatsapp_click', { location: 'diagnostic_sidebar' })}
            >
              💬 Consultar por WhatsApp
            </a>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
                Productos Recomendados para este Caso
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {relatedProducts.map(p => (
                  <div key={p.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                    <div>
                      <Link to={`/productos/${p.category.toLowerCase()}/${p.id}`} style={{ fontSize: '0.85rem', fontWeight: 600 }} className="nav-link">
                        {p.name}
                      </Link>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>${(p.promotional_price || p.price).toLocaleString()}</div>
                    </div>
                    {p.stock > 0 ? (
                      <button onClick={() => handleProductAdd(p)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Agregar</button>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sin Stock</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {styleDiagMobile}
    </div>
  );
};

const styleDiagMobile = (
  <style>{`
    @media (max-width: 768px) {
      .diagnostic-split {
        grid-template-columns: 1fr !important;
        gap: 30px !important;
      }
    }
  `}</style>
);
