import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dbService, Product, Kit } from '../services/db';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ChevronRight, ShoppingCart, MessageSquare, Info, ShieldCheck, Truck, RefreshCw, Box, Plus } from 'lucide-react';
import { getProductImage } from './Shop';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, addKitToCart, sessionToken } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedKits, setRelatedKits] = useState<Kit[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'use' | 'specs'>('info');

  useEffect(() => {
    if (!id) return;
    
    // Log event view
    dbService.logEvent(sessionToken, 'product_view', { product_id: id });

    // Fetch product details
    dbService.getProductById(id).then(async res => {
      if (!res) {
        navigate('/productos');
        return;
      }
      setProduct(res);

      // Load related products from same category
      const allProds = await dbService.getProducts();
      const related = allProds
        .filter(p => p.category === res.category && p.id !== res.id)
        .slice(0, 4);
      setRelatedProducts(related);

      // Check if product is in any kit
      const allKits = await dbService.getKits();
      const inKits = allKits.filter(k => 
        k.products.some(kp => kp.product_id === res.id)
      );
      setRelatedKits(inKits);
    });
  }, [id, navigate, sessionToken]);

  if (!product) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Cargando detalles del producto…</div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    await addToCart(product, quantity);
    showToast(`Se agregaron ${quantity} unidades de "${product.name}" al carrito`);
  };

  const handleKitPurchase = async (kit: Kit) => {
    await addKitToCart(kit);
    showToast(`Se agregaron los componentes del "${kit.name}" con descuento`);
    navigate('/carrito');
  };

  const getWhatsAppMessage = () => {
    const msg = `Hola Imperio Verde, estoy viendo el producto "${product.name}" (${product.brand}) en su web y me gustaría consultar sobre su aplicación o compatibilidad.`;
    return `https://wa.me/5491153841079?text=${encodeURIComponent(msg)}`;
  };

  const priceToPay = product.promotional_price || product.price;
  const productImage = getProductImage(product);
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = '/fondoletras.png';
  };

  return (
    <div className="container">
      
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '30px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'var(--accent-neon)' }}>Inicio</Link>
        <ChevronRight size={12} />
        <Link to="/productos" style={{ color: 'var(--accent-neon)' }}>Tienda</Link>
        <ChevronRight size={12} />
        <Link to={`/productos?categoria=${encodeURIComponent(product.category)}`} style={{ color: 'var(--accent-neon)' }}>{product.category}</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
      </div>

      {/* Core Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '50px', marginBottom: '60px' }} className="product-split">
        
        {/* Left Column: Image Gallery */}
        <div>
          <div className="product-detail-image-container">
            <img
              src={productImage}
              alt={product.name}
              className="product-detail-image"
              onError={handleImageError}
            />
          </div>
          
          {/* Thumbnails */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="product-detail-thumbnail">
              <img
                src={productImage}
                alt={`Vista previa de ${product.name}`}
                onError={handleImageError}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              {product.brand}
            </span>
            <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-title)', fontWeight: 800, marginTop: '4px', lineHeight: 1.2 }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
              <span className="badge badge-green">Nivel: {product.difficulty_level}</span>
              {product.is_specialized && <span className="badge badge-violet">Equipamiento Técnico</span>}
              <span className="badge badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Box size={12} /> Cód: {product.id}
              </span>
            </div>
          </div>

          {/* Price Area */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
              {product.promotional_price ? (
                <>
                  <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--action-yellow)' }}>
                    ${product.promotional_price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                    ${product.price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ${product.price.toLocaleString()}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              💳 Paga hasta en 3 cuotas sin interés de <strong>${Math.round(priceToPay / 3).toLocaleString()}</strong>
            </div>
          </div>

          {/* Stock Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: product.stock > 0 ? 'var(--accent-neon)' : 'var(--text-muted)' }}></span>
            <span>
              {product.stock > 0 
                ? `¡En Stock! (${product.stock} unidades disponibles)` 
                : 'Agotado Temporalmente'
              }
            </span>
          </div>

          {/* Form Actions */}
          {product.stock > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cantidad:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ padding: '8px 16px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>-</button>
                  <span style={{ width: '40px', textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} style={{ padding: '8px 16px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>+</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleAddToCart}
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '14px 28px', fontSize: '1.05rem' }}
                >
                  <ShoppingCart size={18} /> Agregar al Carrito
                </button>
                <a 
                  href={getWhatsAppMessage()}
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-outline"
                  style={{ borderColor: 'var(--accent-neon)', color: 'var(--accent-neon)', display: 'inline-flex', padding: '14px' }}
                  onClick={() => dbService.logEvent(sessionToken, 'whatsapp_click', { location: 'product_details_advising' })}
                >
                  <MessageSquare size={20} />
                </a>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Escribinos para avisarte en cuanto ingrese stock del fabricante.</span>
              <a 
                href={`https://wa.me/5491153841079?text=Hola%20Imperio%20Verde%2C%20estoy%20interesado%20en%20el%20producto%20"${product.name}"%20que%20se%20encuentra%20agotado.%20¿Cuándo%20vuelve%20a%20entrar?`}
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-outline"
                style={{ width: '100%', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}
              >
                Avisarme por WhatsApp cuando ingrese
              </a>
            </div>
          )}

          {/* Quick trust assurances */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={16} color="var(--accent-neon)" />
              <span>Envío express o retiro en local</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16} color="var(--accent-neon)" />
              <span>Cambios garantizados</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabbed Info Block */}
      <section className="glass-card" style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '20px', gap: '10px' }}>
          <button 
            onClick={() => setActiveTab('info')}
            style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'info' ? '3px solid var(--accent-neon)' : 'none', color: activeTab === 'info' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
          >
            Descripción
          </button>
          <button 
            onClick={() => setActiveTab('use')}
            style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'use' ? '3px solid var(--accent-neon)' : 'none', color: activeTab === 'use' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
          >
            Modo de Aplicación
          </button>
          <button 
            onClick={() => setActiveTab('specs')}
            style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'specs' ? '3px solid var(--accent-neon)' : 'none', color: activeTab === 'specs' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
          >
            Especificaciones Técnicas
          </button>
        </div>

        {activeTab === 'info' && (
          <div>
            <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>{product.description}</p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'rgba(0,230,118,0.03)', padding: '16px', borderRadius: 'var(--radius-sm)', marginTop: '20px', border: '1px solid rgba(0,230,118,0.05)' }}>
              <ShieldCheck size={20} color="var(--accent-neon)" />
              <span style={{ fontSize: '0.85rem' }}><strong>Recomendado por Imperio Verde:</strong> Este producto cumple con los controles de composición y origen del Grow.</span>
            </div>
          </div>
        )}

        {activeTab === 'use' && (
          <div>
            {product.category === 'Fertilizantes' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ color: 'var(--accent-neon)' }}>Dosificación Recomendada:</h4>
                <p>{product.specifications.dosificacion_sugerida || 'Aplicar de 2 a 4 ml por litro de agua de riego.'}</p>
                <h4 style={{ color: 'var(--accent-neon)', marginTop: '10px' }}>Frecuencia de Uso:</h4>
                <p>{product.specifications.frecuencia || 'Una vez por semana durante la etapa correspondiente.'}</p>
                <h4 style={{ color: 'var(--accent-neon)', marginTop: '10px' }}>Etapa de Cultivo:</h4>
                <p>Ideal para usar durante la etapa de: <strong>{product.specifications.etapa_uso || 'Todo el ciclo'}</strong>.</p>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Para la instalación y uso de equipamiento especializado, recomendamos revisar el manual del fabricante. Recordá que el rendimiento óptimo del extractor o luces depende de la hermeticidad de tu carpa indoor y la correcta extracción de aire del cuarto.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {Object.keys(product.specifications).length > 0 ? (
                Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {key.replace('_', ' ')}
                    </div>
                    <div style={{ fontWeight: 600 }}>{val}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-secondary)' }}>No hay especificaciones técnicas detalladas cargadas.</div>
              )}
            </div>
          </div>
        )}

      </section>

      {/* Available inside Kits promotion */}
      {relatedKits.length > 0 && (
        <section className="glass-card" style={{ borderTop: '4px solid var(--action-yellow)', marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <span className="badge badge-yellow" style={{ marginBottom: '8px' }}>COMPRA INTELIGENTE</span>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)' }}>
              Este producto está disponible en: <strong>{relatedKits[0].name}</strong>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Llevá la solución completa con estimulantes compatibles y obtené un <strong>{relatedKits[0].discount_percentage}% de descuento</strong> total.
            </p>
          </div>
          <button onClick={() => handleKitPurchase(relatedKits[0])} className="btn btn-yellow">
            Llevar Kit con Descuento
          </button>
        </section>
      )}

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', marginBottom: '30px' }}>Productos Similares Recomendados</h2>
          <div className="grid grid-cols-4">
            {relatedProducts.map(item => (
              <div key={item.id} className="product-card">
                <Link to={`/productos/${item.category.toLowerCase()}/${item.id}`} className="product-card-img-container">
                  <img
                    src={getProductImage(item)}
                    alt={item.name}
                    className="product-card-img"
                  />
                </Link>

                <div className="product-card-body">
                  <div className="product-card-brand">{item.brand}</div>
                  <Link
                    to={`/productos/${item.category.toLowerCase()}/${item.id}`}
                    className="product-card-title nav-link"
                    title={item.name}
                  >
                    {item.name}
                  </Link>

                  <div className="product-card-price-row">
                    {item.promotional_price ? (
                      <>
                        <span className="product-card-promo-price">
                          ${item.promotional_price.toLocaleString()}
                        </span>
                        <span className="product-card-old-price">
                          ${item.price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="product-card-price">
                        ${item.price.toLocaleString()}
                      </span>
                    )}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>COD: {item.id.slice(0, 5)}</span>
                  </div>
                </div>

                <div className="product-card-footer">
                  <Link to={`/productos/${item.category.toLowerCase()}/${item.id}`} className="btn btn-outline" style={{ padding: '8px 12px', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Ver Detalle">
                    <Info size={14} />
                  </Link>
                  {item.stock > 0 ? (
                    <button onClick={() => addToCart(item, 1).then(() => showToast(`"${item.name}" agregado al carrito`))} className="btn btn-primary" style={{ padding: '8px 12px', flex: 3, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
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
      )}

      {/* MOBILE STICKY CTA BAR (CRO SDD rule!) */}
      {product.stock > 0 && (
        <div className="sticky-bottom-bar mobile-only-cta">
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Precio Total:</div>
            <div style={{ fontWeight: 800, color: 'var(--accent-neon)', fontSize: '1.1rem' }}>
              ${(priceToPay * quantity).toLocaleString()}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href={getWhatsAppMessage()} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', borderColor: '#25D366', color: '#25D366' }}><MessageSquare size={18} /></a>
            <button onClick={handleAddToCart} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Agregar ({quantity})</button>
          </div>
        </div>
      )}

      {mobileDetailsStyles}
    </div>
  );
};

const mobileDetailsStyles = (
  <style>{`
    .mobile-only-cta {
      display: none;
    }
    @media (max-width: 768px) {
      .product-split {
        grid-template-columns: 1fr !important;
        gap: 30px !important;
      }
      .product-detail-image-container {
        height: 320px;
        padding: 16px;
      }
      .mobile-only-cta {
        display: flex !important;
      }
    }
  `}</style>
);
