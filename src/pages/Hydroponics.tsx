import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dbService, Product, Kit } from '../services/db';
import { useCart } from '../context/CartContext';
import { Droplet, ArrowRight, ShieldCheck, HelpCircle, Compass, RefreshCw, BarChart2 } from 'lucide-react';

export const Hydroponics: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, addKitToCart, sessionToken } = useCart();

  // Wizard State
  const [step, setStep] = useState(1);
  const [plants, setPlants] = useState('');
  const [space, setSpace] = useState('');
  const [experience, setExperience] = useState('');
  const [wizardResult, setWizardResult] = useState<{
    systemName: string;
    description: string;
    kitSuggestedId?: string;
    recommendedProducts: string[]; // array of IDs
    tip: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const runWizardCalculation = () => {
    setLoading(true);
    dbService.logEvent(sessionToken, 'hydro_wizard_run', { plants, space, experience });

    setTimeout(() => {
      let result = {
        systemName: 'Sistema DWC (Deep Water Culture) 4 Baldes',
        description: 'Ideal para iniciar con control total. Consiste en baldes individuales con aireadores de flujo continuo donde las raíces cuelgan directamente en solución oxigenada.',
        kitSuggestedId: 'k-003', // Kit Nutrición Hidroponía Inicial
        recommendedProducts: ['p-004', 'p-075', 'p-076', 'p-077'], // Balanza, Hidronutrientes 1, 2, 3
        tip: 'Mantené la temperatura de tu solución de agua entre 18°C y 22°C para evitar problemas de falta de oxígeno y hongos radiculares.'
      };

      if (plants === '1-2' && space === 'small') {
        result = {
          systemName: 'Sistema DWC Individual 1 Balde (20L)',
          description: 'La forma más económica y compacta de cultivar en hidroponía. Requiere muy poco espacio y es sumamente fácil de controlar.',
          kitSuggestedId: 'k-003',
          recommendedProducts: ['p-004', 'p-075'], // Balanza y Hidronutriente 1
          tip: 'El medidor de pH es tu mejor amigo. En hidroponía, un pH incorrecto bloquea inmediatamente la absorción de nutrientes.'
        };
      } else if (plants === '10+' || space === 'large') {
        result = {
          systemName: 'Sistema NFT (Nutrient Film Technique) 12 Sitios',
          description: 'Sistema hidropónico profesional de canales donde una película constante de agua circula nutriendo las raíces. Altamente escalable.',
          kitSuggestedId: 'k-003',
          recommendedProducts: ['p-004', 'p-075', 'p-076', 'p-077', 'p-078'], // Balanza + Hidro 1, 2, 3, 4
          tip: 'En sistemas NFT con recirculación constante, revisá la conductividad eléctrica (EC) diariamente para reponer agua evaporada.'
        };
      }

      setWizardResult(result);
      setLoading(false);
      setStep(4);
    }, 1200);
  };

  const handleAddRecommendations = async () => {
    if (!wizardResult) return;
    
    // Add kit
    if (wizardResult.kitSuggestedId) {
      const kits = await dbService.getKits();
      const kit = kits.find(k => k.id === wizardResult.kitSuggestedId);
      if (kit) await addKitToCart(kit);
    }

    // Add extra recommended products
    const productsList = await dbService.getProducts();
    for (const pid of wizardResult.recommendedProducts) {
      const p = productsList.find(x => x.id === pid);
      if (p && p.stock > 0) {
        await addToCart(p, 1);
      }
    }

    alert('¡Configuración recomendada agregada al carrito con éxito!');
    navigate('/carrito');
  };

  const resetWizard = () => {
    setPlants('');
    setSpace('');
    setExperience('');
    setWizardResult(null);
    setStep(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
      
      {/* 1. Header Banner */}
      <section className="container" style={{ marginTop: '20px' }}>
        <div 
          className="glass-card violet" 
          style={{ 
            padding: '60px 40px', 
            borderRadius: 'var(--radius-lg)', 
            backgroundImage: 'linear-gradient(135deg, rgba(20, 10, 30, 0.95) 0%, rgba(142, 36, 170, 0.3) 100%), url("/IMG Perfil_2.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid rgba(142, 36, 170, 0.4)',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'inline-flex', marginBottom: '16px' }}>
            <span className="badge badge-violet">🧪 CENTRO DE HIDROPONÍA ESPECIALIZADO</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-title)', fontWeight: 800, marginBottom: '16px' }}>
            CULTIVAR EN AGUA: RENDIMIENTO MÁXIMO
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '750px', margin: '0 auto 24px', lineHeight: 1.5 }}>
            Te educamos y equipamos para que des el salto al cultivo hidropónico. Cosechas hasta un 30% más rápidas y voluminosas controlando pH, conductividad eléctrica y oxígeno en raíces.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#wizard" className="btn btn-violet">Calcular mi Sistema Hidropónico</a>
            <Link to="/productos?categoria=Fertilizantes" className="btn btn-outline" style={{ borderColor: 'rgba(142, 36, 170, 0.4)' }}>Ver Nutrientes Hidro</Link>
          </div>
        </div>
      </section>

      {/* 2. Educational Tabs / Grid */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', marginBottom: '8px' }}>El Universo de la Hidroponía</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Comprendé las variables biológicas esenciales antes de elegir componentes</p>
        </div>

        <div className="grid grid-cols-3">
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ color: '#e040fb', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <Compass size={20} /> 1. El Sistema Hidropónico
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              El depósito almacena el agua con nutrientes. Las raíces se sujetan en una maceta rejilla con medios inertes (lana de roca o leca) y absorben la solución mediante goteo o inmersión constante.
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ color: '#e040fb', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <Droplet size={20} /> 2. La Oxigenación Radicular
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Es el factor crítico. Una bomba de aire inyecta burbujas constantemente mediante una piedra difusora en el balde. Sin aireación, las raíces se asfixian y mueren en 24 horas.
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ color: '#e040fb', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <BarChart2 size={20} /> 3. pH & Conductividad (EC)
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              En hidroponía no hay tierra que amortigüe los errores. Debes medir pH (ideal 5.5 a 6.2) y conductividad eléctrica EC (para medir concentración de abonos) en cada riego.
            </p>
          </div>

        </div>
      </section>

      {/* 3. WIZARD CONFIGURATOR */}
      <section id="wizard" className="container">
        <div className="glass-card violet" style={{ border: '1px solid rgba(142, 36, 170, 0.35)', padding: '50px 40px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span className="badge badge-violet" style={{ marginBottom: '8px' }}>CONFIGURADOR INTELIGENTE</span>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
              Diseñá tu Configuración Hidropónica Sin Errores
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Respondé 3 simples preguntas y el sistema estimará el sistema y los insumos compatibles.
            </p>
          </div>

          {/* Steps container */}
          <div style={{ maxWidth: '600px', margin: '0 auto', minHeight: '260px', display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'center' }}>
            
            {/* Step 1: Plants */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ textAlign: 'center', fontSize: '1.1rem' }}>1. ¿Cuántas plantas querés cultivar en agua?</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { val: '1-2', label: '1 a 2 plantas', sub: 'Microcultivo' },
                    { val: '4-6', label: '4 a 6 plantas', sub: 'Indoor Estándar' },
                    { val: '10+', label: '10 o más plantas', sub: 'Gran Rendimiento' }
                  ].map(o => (
                    <button 
                      key={o.val}
                      onClick={() => { setPlants(o.val); setStep(2); }}
                      className="btn btn-outline"
                      style={{ padding: '20px 10px', height: '100px', display: 'flex', flexDirection: 'column', gap: '6px', borderColor: plants === o.val ? 'var(--accent-violet)' : 'var(--border-glass)' }}
                    >
                      <span style={{ fontWeight: 700 }}>{o.label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{o.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Space */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ textAlign: 'center', fontSize: '1.1rem' }}>2. ¿Qué espacio físico tenés disponible para tu cultivo?</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { val: 'small', label: 'Menos de 80x80cm', sub: 'Carpa chica / Placard' },
                    { val: 'medium', label: 'Carpa de 1x1m o 1.2x1.2m', sub: 'Espacio dedicado' },
                    { val: 'large', label: 'Habitación o Exterior', sub: 'Espacio ilimitado' }
                  ].map(o => (
                    <button 
                      key={o.val}
                      onClick={() => { setSpace(o.val); setStep(3); }}
                      className="btn btn-outline"
                      style={{ padding: '20px 10px', height: '100px', display: 'flex', flexDirection: 'column', gap: '6px', borderColor: space === o.val ? 'var(--accent-violet)' : 'var(--border-glass)' }}
                    >
                      <span style={{ fontWeight: 700 }}>{o.label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{o.sub}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Volver atrás</button>
              </div>
            )}

            {/* Step 3: Experience */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ textAlign: 'center', fontSize: '1.1rem' }}>3. ¿Cuál es tu nivel de experiencia en cultivo?</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { val: 'beginner', label: 'Nunca cultivé', sub: 'Quiero simplicidad' },
                    { val: 'intermediate', label: 'Cultivé en tierra', sub: 'Entiendo lo básico' },
                    { val: 'expert', label: 'Hice hidroponía', sub: 'Busco alto control' }
                  ].map(o => (
                    <button 
                      key={o.val}
                      onClick={() => { setExperience(o.val); }}
                      className="btn btn-outline"
                      style={{ padding: '20px 10px', height: '100px', display: 'flex', flexDirection: 'column', gap: '6px', borderColor: experience === o.val ? 'var(--accent-violet)' : 'var(--border-glass)' }}
                    >
                      <span style={{ fontWeight: 700 }}>{o.label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{o.sub}</span>
                    </button>
                  ))}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Volver atrás</button>
                  <button 
                    onClick={runWizardCalculation} 
                    className="btn btn-violet"
                    disabled={!experience}
                    style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                  >
                    Calcular Configuración
                  </button>
                </div>
              </div>
            )}

            {/* Loader */}
            {loading && (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <RefreshCw size={36} className="pulse-button" style={{ color: '#e040fb' }} />
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Calculando balances químicos y compatibilidad hidráulica...</div>
              </div>
            )}

            {/* Result Step */}
            {step === 4 && wizardResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(142,36,170,0.2)' }}>
                  <div style={{ display: 'inline-flex', marginBottom: '8px' }}>
                    <span className="badge badge-violet">SISTEMA SUGERIDO</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', marginBottom: '8px' }}>{wizardResult.systemName}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                    {wizardResult.description}
                  </p>
                  <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    💡 <strong>Tip experto:</strong> {wizardResult.tip}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={resetWizard} className="btn btn-outline" style={{ flex: 1 }}>Reiniciar</button>
                  <button onClick={handleAddRecommendations} className="btn btn-violet" style={{ flex: 2 }}>
                    Agregar Sistema e Insumos al Carrito
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 4. Common hydro FAQs */}
      <section className="container">
        <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)', marginBottom: '30px', textAlign: 'center' }}>Preguntas Frecuentes de Hidroponía</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
          {[
            {
              q: '¿Qué mantenimiento semanal requiere un sistema hidropónico?',
              a: 'Semanalmente debes medir y reponer el agua evaporada, corregir el pH a 5.8, registrar la conductividad eléctrica (EC) y verificar que la bomba de aire oxigene constantemente. Cada 15 días es recomendable vaciar el depósito, limpiarlo y preparar solución nutritiva fresca.'
            },
            {
              q: '¿Es más difícil cultivar en hidroponía que en tierra?',
              a: 'No es más difícil, pero requiere más disciplina. Al no haber tierra que retenga agua y nutrientes, las plantas reaccionan inmediatamente tanto a lo bueno (crecimiento explosivo) como a lo malo (bloqueo por pH incorrecto o falta de agua). Con un buen medidor digital, es muy predecible.'
            },
            {
              q: '¿Qué nutrientes específicos se necesitan?',
              a: 'En hidroponía no se puede abonar con fertilizantes orgánicos tradicionales de tierra porque obstruyen mangueras y pudren el agua. Deben usarse fertilizantes minerales tri-componente (Vega, Micro, Flora de Amazing o Plagron) formulados para disolverse al 100% en agua.'
            }
          ].map((faq, i) => (
            <div key={i} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', color: 'var(--accent-neon)' }}>{faq.q}</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
