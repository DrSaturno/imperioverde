import React, { useEffect, useState } from 'react';
import { dbService, Product, Kit, KitProduct } from '../../services/db';
import { Search, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const { showToast } = useToast();

  // Tab control
  const [activeTab, setActiveTab] = useState<'products' | 'kits'>('products');
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // modal control
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Lists for dynamic categories and brands
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // Form State - Product
  const [prodId, setProdId] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Fertilizantes');
  const [prodCost, setProdCost] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodPromoPrice, setProdPromoPrice] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodDiff, setProdDiff] = useState<'principiante' | 'intermedio' | 'avanzado'>('principiante');
  const [prodSpecialized, setProdSpecialized] = useState(false);
  
  // Kit modal control
  const [kitModalOpen, setKitModalOpen] = useState(false);
  const [kitName, setKitName] = useState('');
  const [kitDesc, setKitDesc] = useState('');
  const [kitPrice, setKitPrice] = useState('');
  const [kitDiscount, setKitDiscount] = useState('');
  const [kitDiff, setKitDiff] = useState<'principiante' | 'intermedio' | 'avanzado'>('principiante');
  const [kitSelectedProducts, setKitSelectedProducts] = useState<{ product_id: string; quantity: number }[]>([]);
  
  // Temp vars for adding items to kit
  const [tempProdId, setTempProdId] = useState('');
  const [tempProdQty, setTempProdQty] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    dbService.getProducts().then(setProducts);
    dbService.getKits().then(setKits);
    dbService.getCategories().then(setCategories);
    dbService.getBrands().then(setBrands);
  };

  const handleAddNewCategory = async () => {
    const name = prompt('Ingresa el nombre de la nueva categoría:');
    if (name && name.trim()) {
      const updated = await dbService.addCategory(name.trim());
      setCategories(updated);
      setProdCategory(name.trim());
    }
  };

  const handleAddNewBrand = async () => {
    const name = prompt('Ingresa el nombre de la nueva marca:');
    if (name && name.trim()) {
      const updated = await dbService.addBrand(name.trim());
      setBrands(updated);
      setProdBrand(name.trim());
    }
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setProdId('');
    setProdName('');
    setProdCategory(categories[0] || 'Fertilizantes');
    setProdCost('');
    setProdPrice('');
    setProdPromoPrice('');
    setProdBrand(brands[0] || 'Varios');
    setProdStock('');
    setProdImageUrl('');
    setProdDesc('');
    setProdDiff('principiante');
    setProdSpecialized(false);
    setProductModalOpen(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setProdId(p.id);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdCost(p.cost?.toString() || '');
    setProdPrice(p.price.toString());
    setProdPromoPrice(p.promotional_price?.toString() || '');
    setProdBrand(p.brand || '');
    setProdStock(p.stock.toString());
    setProdImageUrl(p.image_url || '');
    setProdDesc(p.description || '');
    setProdDiff(p.difficulty_level);
    setProdSpecialized(p.is_specialized);
    setProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodStock) return;

    const parsedPromo = parseFloat(prodPromoPrice);
    const shortId = prodId || `p-${Date.now().toString().slice(-5)}`;
    
    const productPayload: Product = {
      id: shortId,
      name: prodName,
      category: prodCategory,
      cost: parseFloat(prodCost) || 0,
      price: parseFloat(prodPrice),
      promotional_price: !isNaN(parsedPromo) && parsedPromo > 0 ? parsedPromo : null,
      brand: prodBrand || 'Varios',
      stock: parseInt(prodStock) || 0,
      image_url: prodImageUrl,
      description: prodDesc,
      difficulty_level: prodDiff,
      is_specialized: prodSpecialized,
      specifications: editingProduct?.specifications || {}
    };

    await dbService.upsertProduct(productPayload);
    showToast(editingProduct ? 'Producto actualizado con éxito' : 'Producto creado con éxito');
    setProductModalOpen(false);
    fetchData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      await dbService.deleteProduct(id);
      fetchData();
    }
  };

  // KITS ACTIONS
  const openNewKitModal = () => {
    setKitName('');
    setKitDesc('');
    setKitPrice('');
    setKitDiscount('');
    setKitDiff('principiante');
    setKitSelectedProducts([]);
    setKitModalOpen(true);
  };

  const addProductToKitForm = () => {
    if (!tempProdId) return;
    
    setKitSelectedProducts(prev => {
      const existing = prev.find(item => item.product_id === tempProdId);
      if (existing) {
        return prev.map(item => 
          item.product_id === tempProdId 
            ? { ...item, quantity: item.quantity + tempProdQty } 
            : item
        );
      } else {
        return [...prev, { product_id: tempProdId, quantity: tempProdQty }];
      }
    });
    setTempProdId('');
    setTempProdQty(1);
  };

  const removeProductFromKitForm = (pid: string) => {
    setKitSelectedProducts(prev => prev.filter(x => x.product_id !== pid));
  };

  const handleKitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kitName || !kitPrice || kitSelectedProducts.length === 0) {
      showToast('Por favor completa los datos mínimos e ingresa al menos un componente.', 'error');
      return;
    }

    const kitPayload: Kit = {
      id: `k-${Date.now()}`,
      name: kitName,
      description: kitDesc,
      price: parseFloat(kitPrice),
      discount_percentage: parseFloat(kitDiscount) || 0.00,
      difficulty_level: kitDiff,
      interests: ['indoor'],
      products: kitSelectedProducts.map(p => ({
        product_id: p.product_id,
        quantity: p.quantity
      }))
    };

    await dbService.upsertKit(kitPayload);
    showToast('Kit creado y configurado con éxito');
    setKitModalOpen(false);
    fetchData();
  };

  const handleDeleteKit = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este kit?')) {
      await dbService.deleteKit(id);
      fetchData();
    }
  };

  // Filter products by query
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>Gestión de Catálogo</h1>
          <p style={{ color: 'var(--text-secondary)' }}>CRUD de productos, stock de componentes e ingeniería de kits.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={activeTab === 'products' ? openNewProductModal : openNewKitModal} 
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            <Plus size={16} /> {activeTab === 'products' ? 'Crear Producto' : 'Crear Kit'}
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-glass)' }}>
        <button 
          onClick={() => setActiveTab('products')} 
          style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'products' ? '3px solid var(--accent-neon)' : 'none', color: activeTab === 'products' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
        >
          Productos de Catálogo ({products.length})
        </button>
        <button 
          onClick={() => setActiveTab('kits')} 
          style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'kits' ? '3px solid var(--accent-neon)' : 'none', color: activeTab === 'kits' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
        >
          Kits de Cultivo ({kits.length})
        </button>
      </div>

      {/* TAB PRODUCTS */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Search bar list */}
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <input 
              type="text" 
              placeholder="Buscar producto por nombre, marca o categoría…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: '40px', fontSize: '0.85rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {/* Table list */}
          <div className="glass-card" style={{ padding: '0px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '16px' }}>Cód</th>
                  <th style={{ padding: '16px' }}>Nombre</th>
                  <th style={{ padding: '16px' }}>Categoría</th>
                  <th style={{ padding: '16px' }}>Marca</th>
                  <th style={{ padding: '16px' }}>Precio</th>
                  <th style={{ padding: '16px' }}>Stock</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="tr-row">
                    <td style={{ padding: '14px', color: 'var(--text-muted)', fontWeight: 700 }}>{p.id.slice(0, 5).toUpperCase()}</td>
                    <td style={{ padding: '14px', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '14px' }}>{p.category}</td>
                    <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{p.brand}</td>
                    <td style={{ padding: '14px', fontWeight: 600 }}>
                      {p.promotional_price ? (
                        <span style={{ color: 'var(--action-yellow)' }}>${p.promotional_price.toLocaleString()}</span>
                      ) : (
                        <span>${p.price.toLocaleString()}</span>
                      )}
                    </td>
                    <td style={{ padding: '14px', color: p.stock > 0 ? 'var(--accent-neon)' : '#ef5350' }}>{p.stock}</td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button onClick={() => openEditProductModal(p)} aria-label={`Editar ${p.name}`} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', marginRight: '12px', cursor: 'pointer' }}><Edit2 size={14} aria-hidden="true" /></button>
                      <button onClick={() => handleDeleteProduct(p.id)} aria-label={`Eliminar ${p.name}`} style={{ background: 'none', border: 'none', color: '#ef5350', cursor: 'pointer' }}><Trash2 size={14} aria-hidden="true" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB KITS */}
      {activeTab === 'kits' && (
        <div className="grid grid-cols-2">
          {kits.map(k => (
            <div key={k.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '4px solid var(--action-yellow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="badge badge-yellow">Ahorro: {k.discount_percentage}%</span>
                <button onClick={() => handleDeleteKit(k.id)} aria-label={`Eliminar kit ${k.name}`} style={{ background: 'none', border: 'none', color: '#ef5350', cursor: 'pointer' }}><Trash2 size={16} aria-hidden="true" /></button>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{k.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{k.description}</p>
              </div>

              {/* Components preview */}
              <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Componentes del Kit:</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)' }}>
                  {k.products.map(kp => (
                    <li key={kp.product_id}>• {kp.quantity}x {kp.product?.name} ({kp.product?.brand})</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Precio Kit:</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>${k.price.toLocaleString()}</div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dificultad: {k.difficulty_level}</span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* PRODUCT CREATION/EDIT MODAL */}
      {productModalOpen && (
        <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleProductSubmit} className="glass-card" style={{ width: '90%', maxWidth: '600px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-title)', fontSize: '1.2rem' }}>
                {editingProduct ? `Editar Producto: ${editingProduct.id}` : 'Crear Nuevo Producto'}
              </span>
              <button type="button" onClick={() => setProductModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nombre del Producto *</span>
                <input type="text" value={prodName} onChange={(e) => setProdName(e.target.value)} className="input" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Categoría *</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="input" style={{ flex: 1 }}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button type="button" onClick={handleAddNewCategory} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>+ Nueva</button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Costo Insumo ($)</span>
                <input type="number" step="0.01" value={prodCost} onChange={(e) => setProdCost(e.target.value)} className="input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Precio Venta ($) *</span>
                <input type="number" step="0.01" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="input" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Precio Promo ($)</span>
                <input type="number" step="0.01" value={prodPromoPrice} onChange={(e) => setProdPromoPrice(e.target.value)} className="input" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: '12px', alignItems: 'end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Marca *</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select value={prodBrand} onChange={(e) => setProdBrand(e.target.value)} className="input" style={{ flex: 1 }}>
                    <option value="">Selecciona…</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <button type="button" onClick={handleAddNewBrand} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>+ Nueva</button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Stock Unidades *</span>
                <input type="number" value={prodStock} onChange={(e) => setProdStock(e.target.value)} className="input" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nivel de Cultivo</span>
                <select value={prodDiff} onChange={(e) => setProdDiff(e.target.value as any)} className="input">
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Descripción del Producto</span>
              <textarea value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="input" style={{ height: '80px', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>URL de la Imagen del Producto</span>
              <input type="text" placeholder="https://example.com/imagen.jpg" value={prodImageUrl} onChange={(e) => setProdImageUrl(e.target.value)} className="input" />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={prodSpecialized} onChange={(e) => setProdSpecialized(e.target.checked)} style={{ accentColor: 'var(--accent-neon)' }} />
              ¿Es un equipamiento especializado? (Requiere especificaciones / calculadoras)
            </label>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
              {editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
            </button>
          </form>
        </div>
      )}

      {/* KIT CREATION / ASSEMBLY MODAL */}
      {kitModalOpen && (
        <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleKitSubmit} className="glass-card" style={{ width: '90%', maxWidth: '650px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-title)', fontSize: '1.2rem' }}>Armador de Kit de Cultivo</span>
              <button type="button" onClick={() => setKitModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nombre Comercial del Kit *</span>
                <input type="text" value={kitName} onChange={(e) => setKitName(e.target.value)} className="input" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dificultad Recomendada</span>
                <select value={kitDiff} onChange={(e) => setKitDiff(e.target.value as any)} className="input">
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Precio Especial del Kit ($) *</span>
                <input type="number" value={kitPrice} onChange={(e) => setKitPrice(e.target.value)} className="input" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Porcentaje de Descuento (%)</span>
                <input type="number" step="0.01" value={kitDiscount} onChange={(e) => setKitDiscount(e.target.value)} className="input" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Descripción / Propósito Comercial *</span>
              <textarea value={kitDesc} onChange={(e) => setKitDesc(e.target.value)} className="input" style={{ height: '60px', resize: 'vertical' }} required />
            </div>

            {/* Component Adder Section */}
            <div style={{ border: '1px solid var(--border-glass)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--action-yellow)', display: 'block', marginBottom: '10px' }}>Ensamblar Componentes</span>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <select 
                  value={tempProdId} 
                  onChange={(e) => setTempProdId(e.target.value)} 
                  className="input"
                  style={{ flex: 3 }}
                >
                  <option value="">Selecciona un producto del catálogo…</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  min="1" 
                  value={tempProdQty} 
                  onChange={(e) => setTempProdQty(parseInt(e.target.value) || 1)} 
                  className="input" 
                  style={{ flex: 1 }} 
                />
                <button type="button" onClick={addProductToKitForm} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>Agregar</button>
              </div>

              {/* Selected components list */}
              {kitSelectedProducts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {kitSelectedProducts.map(ksp => {
                    const prod = products.find(p => p.id === ksp.product_id);
                    return (
                      <div key={ksp.product_id} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', backgroundColor: 'rgba(0,0,0,0.15)', padding: '8px 12px', borderRadius: '4px' }}>
                        <span>• <strong>{ksp.quantity}x</strong> {prod?.name || 'Insumo'} ({prod?.brand})</span>
                        <button type="button" onClick={() => removeProductFromKitForm(ksp.product_id)} style={{ background: 'none', border: 'none', color: '#ef5350', cursor: 'pointer' }}>Quitar</button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '6px', alignItems: 'center' }}><AlertCircle size={14} /> Aún no agregaste ningún producto a este kit.</div>
              )}
            </div>

            <button type="submit" className="btn btn-yellow" style={{ padding: '12px', fontWeight: 700 }}>
              Guardar e Imprimir Kit
            </button>
          </form>
        </div>
      )}

      <style>{`
        .tr-row:hover {
          background-color: rgba(255,255,255,0.01) !important;
        }
      `}</style>
    </div>
  );
};
