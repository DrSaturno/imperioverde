import { supabase } from './supabaseClient';
import productsSeed from '../data/products_seed.json';

// TYPES DEFINITIONS
export interface Product {
  id: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  promotional_price: number | null;
  brand: string;
  stock: number;
  image_url: string;
  description: string;
  difficulty_level: 'principiante' | 'intermedio' | 'avanzado';
  is_specialized: boolean;
  specifications: Record<string, string>;
  created_at?: string;
}

export interface KitProduct {
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Kit {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percentage: number;
  difficulty_level: 'principiante' | 'intermedio' | 'avanzado';
  interests: string[];
  products: KitProduct[];
  created_at?: string;
}

export interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  interests: string[];
  is_subscribed: boolean;
  created_at?: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
}

export interface CartSession {
  id: string;
  session_token: string;
  customer_id?: string | null;
  status: 'active' | 'abandoned' | 'converted';
  items_summary: CartItem[];
  contact_captured?: string | null;
  last_activity: string;
  created_at?: string;
}

export interface OrderItem {
  id?: string;
  product_id: string;
  quantity: number;
  price: number;
  cost?: number; // added for cogs tracking
  product?: Product;
}

export interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_method: 'delivery' | 'pickup';
  shipping_address?: string;
  payment_method?: string;
  items: OrderItem[];
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  session_token: string;
  event_type: string;
  payload: Record<string, any>;
  created_at: string;
}

export interface Coupon {
  code: string;
  discount_percentage: number;
  is_active: boolean;
}

// LOCAL STORAGE KEYS
const KEYS = {
  PRODUCTS: 'imperio_verde_products',
  KITS: 'imperio_verde_kits',
  CUSTOMERS: 'imperio_verde_customers',
  CARTS: 'imperio_verde_carts',
  ORDERS: 'imperio_verde_orders',
  EVENTS: 'imperio_verde_events',
  CATEGORIES: 'imperio_verde_categories',
  BRANDS: 'imperio_verde_brands',
  COUPONS: 'imperio_verde_coupons'
};

// DEFAULT KITS SEED
const initialKits: Kit[] = [
  {
    id: 'k-001',
    name: 'Kit Nutrición Esencial',
    description: 'Solución de inicio básico en suelo orgánico. Estimula las raíces y aporta nutrientes base en crecimiento.',
    price: 30500,
    discount_percentage: 15.2,
    difficulty_level: 'principiante',
    interests: ['indoor', 'exterior'],
    products: [
      { product_id: 'p-002', quantity: 1 }, // Amazonia Roots 150gr ($16000)
      { product_id: 'p-029', quantity: 1 }, // Deeper Underground 100ml ($7000)
      { product_id: 'p-014', quantity: 1 }  // Bio Roots 125ml ($13000)
    ]
  },
  {
    id: 'k-002',
    name: 'Kit Indoor Pro Ciclo Completo',
    description: 'Nutrición avanzada y aditivos para todo el ciclo de cultivo (vegetativo, enraizado y floración explosiva).',
    price: 95000,
    discount_percentage: 18.8,
    difficulty_level: 'intermedio',
    interests: ['indoor'],
    products: [
      { product_id: 'p-003', quantity: 1 }, // Amazonia Roots 300g ($30000)
      { product_id: 'p-009', quantity: 1 }, // Big One 250ml ($25000)
      { product_id: 'p-011', quantity: 1 }, // Bio CarboPlus 250ml ($24000)
      { product_id: 'p-001', quantity: 1 }  // Alien Skin Silicio 1lt ($38000)
    ]
  },
  {
    id: 'k-003',
    name: 'Kit Nutrición Hidroponía Inicial',
    description: 'El kit perfecto para adentrarte en el cultivo hidropónico. Nutrientes tri-componente Vega-Micro-Flora y balanza de precisión.',
    price: 75000,
    discount_percentage: 23.8,
    difficulty_level: 'intermedio',
    interests: ['hidroponia'],
    products: [
      { product_id: 'p-063', quantity: 1 }, // Floramix Vega 1lt ($28000)
      { product_id: 'p-064', quantity: 1 }, // Floramix Micro 1lt ($28000)
      { product_id: 'p-065', quantity: 1 }, // Floramix Flora 1lt ($28000)
      { product_id: 'p-004', quantity: 1 }  // Balanza Digital 500gr ($14500)
    ]
  }
];

// GENERATE REALISTIC MOCK DATA (SPREAD OVER LAST 90 DAYS)
function generateMockData() {
  const products = productsSeed as Product[];
  const dates: Date[] = [];
  const now = new Date();
  
  // Create dates for the last 90 days
  for (let i = 1; i <= 90; i++) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    dates.push(d);
  }

  // Seed default categories and brands lists
  const defaultCategories = Array.from(new Set(products.map(p => p.category))).sort();
  const defaultBrands = Array.from(new Set(products.map(p => p.brand))).sort();
  localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  localStorage.setItem(KEYS.BRANDS, JSON.stringify(defaultBrands));

  // Seed default coupons
  const defaultCoupons: Coupon[] = [
    { code: 'IMPERIOVERDE10', discount_percentage: 10, is_active: true },
    { code: 'HIDROPRO', discount_percentage: 15, is_active: true },
    { code: 'BIOPROYECT20', discount_percentage: 20, is_active: true },
    { code: 'OTOÑO25', discount_percentage: 25, is_active: true }
  ];
  localStorage.setItem(KEYS.COUPONS, JSON.stringify(defaultCoupons));

  // Seed Mock CRM Customers
  const mockCustomers: Customer[] = [
    { id: 'c-1', email: 'nicolas.gomez@gmail.com', full_name: 'Nicolás Gómez', phone: '1134215982', interests: ['indoor', 'fertilizantes'], is_subscribed: true, created_at: dates[80].toISOString() },
    { id: 'c-2', email: 'florencia.p@hotmail.com', full_name: 'Florencia Peralta', phone: '1169025184', interests: ['hidroponia', 'medicion'], is_subscribed: true, created_at: dates[50].toISOString() },
    { id: 'c-3', email: 'marcelo.grow@yahoo.com.ar', full_name: 'Marcelo Rossi', phone: '3416550219', interests: ['ventilacion', 'indoor'], is_subscribed: false, created_at: dates[30].toISOString() },
    { id: 'c-4', email: 'agustin_cultivo@gmail.com', full_name: 'Agustín Fernández', phone: '2615409214', interests: ['fertilizantes', 'sustratos'], is_subscribed: true, created_at: dates[15].toISOString() },
    { id: 'c-5', email: 'valeria.m@outlook.com', full_name: 'Valeria Mansilla', phone: '1129035412', interests: ['boletin_novedades'], is_subscribed: true, created_at: dates[5].toISOString() },
    { id: 'c-6', email: 'tomas.h@gmail.com', full_name: 'Tomás Herrera', phone: '1159834120', interests: ['fertilizantes'], is_subscribed: true, created_at: dates[60].toISOString() },
    { id: 'c-7', email: 'lucas_grower@gmail.com', full_name: 'Lucas Martínez', phone: '1130985521', interests: ['iluminacion', 'indoor'], is_subscribed: true, created_at: dates[42].toISOString() },
    { id: 'c-8', email: 'sofi.planta@yahoo.com', full_name: 'Sofía Díaz', phone: '2616895541', interests: ['macetas', 'riego'], is_subscribed: true, created_at: dates[18].toISOString() }
  ];
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(mockCustomers));

  // Seed Mock Orders (16 orders spread across last 90 days)
  const mockOrders: Order[] = [
    {
      id: 'o-001',
      customer_name: 'Nicolás Gómez',
      customer_email: 'nicolas.gomez@gmail.com',
      customer_phone: '1134215982',
      total_amount: 52000,
      payment_status: 'paid',
      shipping_method: 'delivery',
      shipping_address: 'Av. Santa Fe 2345, CABA',
      payment_method: 'Tarjeta de Crédito (Simulada)',
      created_at: dates[75].toISOString(),
      items: [
        { product_id: 'p-001', quantity: 1, price: 36000, cost: 17149.0 }, // Alien Skin
        { product_id: 'p-002', quantity: 1, price: 16000, cost: 7800.0 }   // Amazonia roots
      ]
    },
    {
      id: 'o-002',
      customer_name: 'Florencia Peralta',
      customer_email: 'florencia.p@hotmail.com',
      customer_phone: '1169025184',
      total_amount: 94000,
      payment_status: 'paid',
      shipping_method: 'pickup',
      shipping_address: 'Retiro en Grow Sucursal',
      payment_method: 'Transferencia Bancaria',
      created_at: dates[65].toISOString(),
      items: [
        { product_id: 'p-063', quantity: 1, price: 28000, cost: 11600.0 }, // Floramix Vega
        { product_id: 'p-064', quantity: 1, price: 28000, cost: 11600.0 }, // Floramix Micro
        { product_id: 'p-065', quantity: 1, price: 28000, cost: 11600.0 }, // Floramix Flora
        { product_id: 'p-004', quantity: 1, price: 10000, cost: 4500.0 }   // Balanza
      ]
    },
    {
      id: 'o-003',
      customer_name: 'Marcelo Rossi',
      customer_email: 'marcelo.grow@yahoo.com.ar',
      customer_phone: '3416550219',
      total_amount: 32000,
      payment_status: 'paid',
      shipping_method: 'delivery',
      shipping_address: 'Bv. Oroño 456, Rosario',
      payment_method: 'Tarjeta de Crédito (Simulada)',
      created_at: dates[58].toISOString(),
      items: [
        { product_id: 'p-030', quantity: 2, price: 16000, cost: 7200.0 }   // Extractor Cooler 4"
      ]
    },
    {
      id: 'o-004',
      customer_name: 'Agustín Fernández',
      customer_email: 'agustin_cultivo@gmail.com',
      customer_phone: '2615409214',
      total_amount: 70500,
      payment_status: 'paid',
      shipping_method: 'pickup',
      shipping_address: 'Retiro en Grow Sucursal',
      payment_method: 'Mercado Pago (Simulado)',
      created_at: dates[50].toISOString(),
      items: [
        { product_id: 'p-063', quantity: 1, price: 28000, cost: 11600.0 },
        { product_id: 'p-064', quantity: 1, price: 28000, cost: 11600.0 },
        { product_id: 'p-004', quantity: 1, price: 14500, cost: 6500.0 }
      ]
    },
    {
      id: 'o-005',
      customer_name: 'Valeria Mansilla',
      customer_email: 'valeria.m@outlook.com',
      customer_phone: '1129035412',
      total_amount: 45000,
      payment_status: 'paid',
      shipping_method: 'delivery',
      shipping_address: 'Guatemala 4820, CABA',
      payment_method: 'Tarjeta de Crédito (Simulada)',
      created_at: dates[45].toISOString(),
      items: [
        { product_id: 'p-009', quantity: 2, price: 22500, cost: 11400.0 }  // Big One 250ml
      ]
    },
    {
      id: 'o-006',
      customer_name: 'Tomás Herrera',
      customer_email: 'tomas.h@gmail.com',
      customer_phone: '1159834120',
      total_amount: 16000,
      payment_status: 'paid',
      shipping_method: 'delivery',
      shipping_address: 'Corrientes 1500, CABA',
      payment_method: 'Mercado Pago',
      created_at: dates[38].toISOString(),
      items: [
        { product_id: 'p-002', quantity: 1, price: 16000, cost: 7800.0 }
      ]
    },
    {
      id: 'o-007',
      customer_name: 'Lucas Martínez',
      customer_email: 'lucas_grower@gmail.com',
      customer_phone: '1130985521',
      total_amount: 112000,
      payment_status: 'paid',
      shipping_method: 'delivery',
      shipping_address: 'Juramento 2400, CABA',
      payment_method: 'Tarjeta de Débito',
      created_at: dates[28].toISOString(),
      items: [
        { product_id: 'p-001', quantity: 2, price: 36000, cost: 17149.0 },
        { product_id: 'p-030', quantity: 1, price: 16000, cost: 7200.0 },
        { product_id: 'p-003', quantity: 1, price: 24000, cost: 12000.0 }  // Amazonia 300g
      ]
    },
    {
      id: 'o-008',
      customer_name: 'Sofía Díaz',
      customer_email: 'sofi.planta@yahoo.com',
      customer_phone: '2616895541',
      total_amount: 28500,
      payment_status: 'paid',
      shipping_method: 'pickup',
      shipping_address: 'Retiro en Grow Sucursal',
      payment_method: 'Efectivo',
      created_at: dates[22].toISOString(),
      items: [
        { product_id: 'p-004', quantity: 1, price: 14500, cost: 6500.0 },
        { product_id: 'p-014', quantity: 1, price: 14000, cost: 6800.0 }   // Bio Roots 125ml
      ]
    },
    {
      id: 'o-009',
      customer_name: 'Carlos Ruiz',
      customer_email: 'carlosruiz@gmail.com',
      customer_phone: '1148902312',
      total_amount: 72000,
      payment_status: 'paid',
      shipping_method: 'delivery',
      shipping_address: 'Rivadavia 4200, CABA',
      payment_method: 'Transferencia',
      created_at: dates[15].toISOString(),
      items: [
        { product_id: 'p-063', quantity: 1, price: 28000, cost: 11600.0 },
        { product_id: 'p-001', quantity: 1, price: 36000, cost: 17149.0 },
        { product_id: 'p-029', quantity: 1, price: 8000, cost: 3500.0 }     // Deeper underground 100ml
      ]
    },
    {
      id: 'o-010',
      customer_name: 'Mariana Sosa',
      customer_email: 'marianasosa@outlook.com',
      customer_phone: '3519803412',
      total_amount: 32000,
      payment_status: 'paid',
      shipping_method: 'delivery',
      shipping_address: 'San Martín 120, Córdoba',
      payment_method: 'Tarjeta de Crédito',
      created_at: dates[10].toISOString(),
      items: [
        { product_id: 'p-030', quantity: 2, price: 16000, cost: 7200.0 }
      ]
    },
    {
      id: 'o-011',
      customer_name: 'Pedro Giménez',
      customer_email: 'pedrogim@gmail.com',
      customer_phone: '2615498877',
      total_amount: 16000,
      payment_status: 'paid',
      shipping_method: 'pickup',
      shipping_address: 'Retiro en Grow Sucursal',
      payment_method: 'Mercado Pago',
      created_at: dates[8].toISOString(),
      items: [
        { product_id: 'p-002', quantity: 1, price: 16000, cost: 7800.0 }
      ]
    },
    {
      id: 'o-012',
      customer_name: 'Julieta Vega',
      customer_email: 'juli_veg@hotmail.com',
      customer_phone: '1134098254',
      total_amount: 60000,
      payment_status: 'paid',
      shipping_method: 'delivery',
      shipping_address: 'Alberdi 600, Quilmes',
      payment_method: 'Tarjeta de Crédito',
      created_at: dates[5].toISOString(),
      items: [
        { product_id: 'p-001', quantity: 1, price: 36000, cost: 17149.0 },
        { product_id: 'p-003', quantity: 1, price: 24000, cost: 12000.0 }
      ]
    },
    {
      id: 'o-013',
      customer_name: 'Diego Lopez',
      customer_email: 'diegolopez@gmail.com',
      customer_phone: '1154029184',
      total_amount: 14500,
      payment_status: 'pending',
      shipping_method: 'pickup',
      shipping_address: 'Retiro en Grow Sucursal',
      payment_method: 'Efectivo en local',
      created_at: dates[4].toISOString(),
      items: [
        { product_id: 'p-004', quantity: 1, price: 14500, cost: 6500.0 }
      ]
    },
    {
      id: 'o-014',
      customer_name: 'Paula Torres',
      customer_email: 'paulatorres@gmail.com',
      customer_phone: '3419082341',
      total_amount: 44000,
      payment_status: 'paid',
      shipping_method: 'delivery',
      shipping_address: 'Pellegrini 1200, Rosario',
      payment_method: 'Transferencia',
      created_at: dates[3].toISOString(),
      items: [
        { product_id: 'p-064', quantity: 1, price: 28000, cost: 11600.0 },
        { product_id: 'p-002', quantity: 1, price: 16000, cost: 7800.0 }
      ]
    },
    {
      id: 'o-015',
      customer_name: 'Esteban Quito',
      customer_email: 'estebanquito@yahoo.com',
      customer_phone: '1122334455',
      total_amount: 124000,
      payment_status: 'paid',
      shipping_method: 'delivery',
      shipping_address: 'La Pampa 1500, CABA',
      payment_method: 'Tarjeta de Crédito',
      created_at: dates[2].toISOString(),
      items: [
        { product_id: 'p-063', quantity: 2, price: 28000, cost: 11600.0 },
        { product_id: 'p-064', quantity: 2, price: 28000, cost: 11600.0 },
        { product_id: 'p-030', quantity: 1, price: 12000, cost: 7200.0 }
      ]
    },
    {
      id: 'o-016',
      customer_name: 'Federico Bal',
      customer_email: 'fedebal@hotmail.com',
      customer_phone: '1190234120',
      total_amount: 28000,
      payment_status: 'paid',
      shipping_method: 'pickup',
      shipping_address: 'Retiro en Grow Sucursal',
      payment_method: 'Mercado Pago',
      created_at: dates[1].toISOString(),
      items: [
        { product_id: 'p-063', quantity: 1, price: 28000, cost: 11600.0 }
      ]
    }
  ];
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(mockOrders));

  // Seed Mock Cart Sessions - 20 sessions total (12 converted, 2 active, 6 abandoned)
  // We make sure at least 8 have captured contact details (phone / email)
  const mockCarts: CartSession[] = [
    { id: 'cart-1', session_token: 'sess-001', contact_captured: 'martincultiva@gmail.com (1150493821)', status: 'abandoned', last_activity: dates[2].toISOString(), items_summary: [{ product_id: 'p-001', quantity: 1 }, { product_id: 'p-030', quantity: 1 }] },
    { id: 'cart-2', session_token: 'sess-002', contact_captured: 'lucia.verde@outlook.com', status: 'abandoned', last_activity: dates[5].toISOString(), items_summary: [{ product_id: 'p-002', quantity: 2 }] },
    { id: 'cart-3', session_token: 'sess-003', contact_captured: 'tobias.hidro@yahoo.com (1129384910)', status: 'abandoned', last_activity: dates[9].toISOString(), items_summary: [{ product_id: 'p-063', quantity: 1 }, { product_id: 'p-064', quantity: 1 }] },
    { id: 'cart-4', session_token: 'sess-004', contact_captured: null, status: 'active', last_activity: dates[0].toISOString(), items_summary: [{ product_id: 'p-004', quantity: 1 }] },
    { id: 'cart-5', session_token: 'sess-005', contact_captured: 'lucas_grower@gmail.com', status: 'converted', last_activity: dates[28].toISOString(), items_summary: [{ product_id: 'p-001', quantity: 2 }] },
    { id: 'cart-6', session_token: 'sess-006', contact_captured: 'gaston_paz@hotmail.com (1139485021)', status: 'abandoned', last_activity: dates[14].toISOString(), items_summary: [{ product_id: 'p-009', quantity: 1 }, { product_id: 'p-002', quantity: 1 }] },
    { id: 'cart-7', session_token: 'sess-007', contact_captured: 'florencia.p@hotmail.com', status: 'converted', last_activity: dates[65].toISOString(), items_summary: [{ product_id: 'p-063', quantity: 1 }] },
    { id: 'cart-8', session_token: 'sess-008', contact_captured: 'marce_grow@yahoo.com.ar', status: 'converted', last_activity: dates[58].toISOString(), items_summary: [{ product_id: 'p-030', quantity: 2 }] },
    { id: 'cart-9', session_token: 'sess-009', contact_captured: 'agustinfer@gmail.com (2615409214)', status: 'converted', last_activity: dates[50].toISOString(), items_summary: [{ product_id: 'p-063', quantity: 1 }] },
    { id: 'cart-10', session_token: 'sess-010', contact_captured: 'valeria.mans@outlook.com', status: 'converted', last_activity: dates[45].toISOString(), items_summary: [{ product_id: 'p-009', quantity: 2 }] },
    { id: 'cart-11', session_token: 'sess-011', contact_captured: 'mariacultivo@gmail.com (1134098231)', status: 'abandoned', last_activity: dates[18].toISOString(), items_summary: [{ product_id: 'p-001', quantity: 1 }] },
    { id: 'cart-12', session_token: 'sess-012', contact_captured: 'leandro_h@hotmail.com', status: 'abandoned', last_activity: dates[24].toISOString(), items_summary: [{ product_id: 'p-003', quantity: 1 }, { product_id: 'p-004', quantity: 2 }] },
    { id: 'cart-13', session_token: 'sess-013', contact_captured: null, status: 'abandoned', last_activity: dates[40].toISOString(), items_summary: [{ product_id: 'p-030', quantity: 1 }] },
    { id: 'cart-14', session_token: 'sess-014', contact_captured: 'nico.gom@gmail.com (1134215982)', status: 'converted', last_activity: dates[75].toISOString(), items_summary: [{ product_id: 'p-001', quantity: 1 }] },
    { id: 'cart-15', session_token: 'sess-015', contact_captured: 'paula.tor@gmail.com', status: 'converted', last_activity: dates[3].toISOString(), items_summary: [{ product_id: 'p-064', quantity: 1 }] },
    { id: 'cart-16', session_token: 'sess-016', contact_captured: 'estebanquito@yahoo.com', status: 'converted', last_activity: dates[2].toISOString(), items_summary: [{ product_id: 'p-063', quantity: 2 }] },
    { id: 'cart-17', session_token: 'sess-017', contact_captured: 'carlosruiz@gmail.com (1148902312)', status: 'converted', last_activity: dates[15].toISOString(), items_summary: [{ product_id: 'p-063', quantity: 1 }] },
    { id: 'cart-18', session_token: 'sess-018', contact_captured: 'mariana_sosa@outlook.com', status: 'converted', last_activity: dates[10].toISOString(), items_summary: [{ product_id: 'p-030', quantity: 2 }] },
    { id: 'cart-19', session_token: 'sess-019', contact_captured: null, status: 'active', last_activity: dates[0].toISOString(), items_summary: [{ product_id: 'p-002', quantity: 1 }] },
    { id: 'cart-20', session_token: 'sess-020', contact_captured: 'santiagocultiva@gmail.com (1167098432)', status: 'abandoned', last_activity: dates[3].toISOString(), items_summary: [{ product_id: 'p-001', quantity: 1 }, { product_id: 'p-002', quantity: 1 }] }
  ];
  localStorage.setItem(KEYS.CARTS, JSON.stringify(mockCarts));

  // Seed Mock Analytics Events (80+ events spread over last 90 days)
  const mockEvents: AnalyticsEvent[] = [
    // Page Views
    { id: 'e-1', session_token: 'sess-001', event_type: 'page_view', payload: { page: '/' }, created_at: dates[80].toISOString() },
    { id: 'e-2', session_token: 'sess-001', event_type: 'filter_category', payload: { category: 'Fertilizantes' }, created_at: dates[80].toISOString() },
    { id: 'e-3', session_token: 'sess-002', event_type: 'page_view', payload: { page: '/hidroponia' }, created_at: dates[50].toISOString() },
    { id: 'e-4', session_token: 'sess-002', event_type: 'product_view', payload: { category: 'Medición' }, created_at: dates[50].toISOString() },
    { id: 'e-5', session_token: 'sess-003', event_type: 'page_view', payload: { page: '/' }, created_at: dates[10].toISOString() },
    { id: 'e-6', session_token: 'sess-004', event_type: 'page_view', payload: { page: '/productos' }, created_at: dates[2].toISOString() },
    // Referral Traffic Sources
    { id: 'e-100', session_token: 'sess-001', event_type: 'referrer', payload: { source: 'Google' }, created_at: dates[80].toISOString() },
    { id: 'e-101', session_token: 'sess-002', event_type: 'referrer', payload: { source: 'Meta Ads' }, created_at: dates[50].toISOString() },
    { id: 'e-102', session_token: 'sess-003', event_type: 'referrer', payload: { source: 'Instagram' }, created_at: dates[10].toISOString() },
    { id: 'e-103', session_token: 'sess-004', event_type: 'referrer', payload: { source: 'Directo' }, created_at: dates[2].toISOString() },
    { id: 'e-104', session_token: 'sess-005', event_type: 'referrer', payload: { source: 'Google' }, created_at: dates[28].toISOString() },
    { id: 'e-105', session_token: 'sess-006', event_type: 'referrer', payload: { source: 'Instagram' }, created_at: dates[14].toISOString() },
    { id: 'e-106', session_token: 'sess-007', event_type: 'referrer', payload: { source: 'Referido' }, created_at: dates[65].toISOString() },
    { id: 'e-107', session_token: 'sess-008', event_type: 'referrer', payload: { source: 'Directo' }, created_at: dates[58].toISOString() },
    { id: 'e-108', session_token: 'sess-009', event_type: 'referrer', payload: { source: 'Meta Ads' }, created_at: dates[50].toISOString() },
    { id: 'e-109', session_token: 'sess-010', event_type: 'referrer', payload: { source: 'Google' }, created_at: dates[45].toISOString() },
    { id: 'e-110', session_token: 'sess-011', event_type: 'referrer', payload: { source: 'Instagram' }, created_at: dates[18].toISOString() },
    { id: 'e-111', session_token: 'sess-012', event_type: 'referrer', payload: { source: 'Meta Ads' }, created_at: dates[24].toISOString() },
    { id: 'e-112', session_token: 'sess-013', event_type: 'referrer', payload: { source: 'Directo' }, created_at: dates[40].toISOString() },
    { id: 'e-113', session_token: 'sess-015', event_type: 'referrer', payload: { source: 'Google' }, created_at: dates[3].toISOString() },
    { id: 'e-114', session_token: 'sess-016', event_type: 'referrer', payload: { source: 'Referido' }, created_at: dates[2].toISOString() },
    { id: 'e-115', session_token: 'sess-020', event_type: 'referrer', payload: { source: 'Instagram' }, created_at: dates[3].toISOString() },
    // Internal Search Queries
    { id: 'e-7', session_token: 'sess-001', event_type: 'search', payload: { query: 'silicio' }, created_at: dates[10].toISOString() },
    { id: 'e-8', session_token: 'sess-002', event_type: 'search', payload: { query: 'medidor ph' }, created_at: dates[10].toISOString() },
    { id: 'e-9', session_token: 'sess-003', event_type: 'search', payload: { query: 'armario' }, created_at: dates[15].toISOString() },
    { id: 'e-10', session_token: 'sess-004', event_type: 'search', payload: { query: 'estimulante de raices' }, created_at: dates[5].toISOString() },
    { id: 'e-11', session_token: 'sess-005', event_type: 'search', payload: { query: 'maceta geotextil' }, created_at: dates[12].toISOString() },
    { id: 'e-12', session_token: 'sess-006', event_type: 'search', payload: { query: 'ph' }, created_at: dates[8].toISOString() },
    { id: 'e-13', session_token: 'sess-007', event_type: 'search', payload: { query: 'plagas' }, created_at: dates[20].toISOString() },
    { id: 'e-14', session_token: 'sess-008', event_type: 'search', payload: { query: 'kit indoor' }, created_at: dates[11].toISOString() },
    { id: 'e-15', session_token: 'sess-009', event_type: 'search', payload: { query: 'ec' }, created_at: dates[4].toISOString() },
    { id: 'e-16', session_token: 'sess-010', event_type: 'search', payload: { query: 'top crop' }, created_at: dates[13].toISOString() },
    // Empty Search Queries (Gaps)
    { id: 'e-20', session_token: 'sess-002', event_type: 'search', payload: { query: 'led quantum board' }, created_at: dates[5].toISOString() },
    { id: 'e-21', session_token: 'sess-003', event_type: 'search', payload: { query: 'carpa 120x120' }, created_at: dates[8].toISOString() },
    { id: 'e-22', session_token: 'sess-004', event_type: 'search', payload: { query: 'humus de lombriz' }, created_at: dates[12].toISOString() },
    { id: 'e-23', session_token: 'sess-005', event_type: 'search', payload: { query: 'led quantum board' }, created_at: dates[14].toISOString() },
    { id: 'e-24', session_token: 'sess-006', event_type: 'search', payload: { query: 'ventilador pinza' }, created_at: dates[19].toISOString() },
    { id: 'e-25', session_token: 'sess-007', event_type: 'search', payload: { query: 'carpa 120x120' }, created_at: dates[22].toISOString() },
    { id: 'e-26', session_token: 'sess-008', event_type: 'search', payload: { query: 'ozonizador' }, created_at: dates[25].toISOString() },
    { id: 'e-27', session_token: 'sess-009', event_type: 'search', payload: { query: 'led quantum board' }, created_at: dates[3].toISOString() }
  ];
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(mockEvents));
}

// INVOCATION OF SEED / STORAGE CHECK
const isSeeded = localStorage.getItem(KEYS.PRODUCTS);
const isV3Seeded = localStorage.getItem('imperio_verde_mock_v3');

if (!supabase && (!isSeeded || !isV3Seeded)) {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(productsSeed));
  localStorage.setItem(KEYS.KITS, JSON.stringify(initialKits));
  generateMockData();
  localStorage.setItem('imperio_verde_mock_v3', 'true');
} else if (!supabase && isSeeded) {
  // Check if categories list is set, if not rebuild it
  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    const products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    const uniqueCats = Array.from(new Set(products.map((p: any) => p.category))).sort();
    const uniqueBrands = Array.from(new Set(products.map((p: any) => p.brand))).sort();
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(uniqueCats));
    localStorage.setItem(KEYS.BRANDS, JSON.stringify(uniqueBrands));
  }
  if (!localStorage.getItem(KEYS.COUPONS)) {
    localStorage.setItem(KEYS.COUPONS, JSON.stringify([
      { code: 'IMPERIOVERDE10', discount_percentage: 10, is_active: true }
    ]));
  }
}

// Helper local database retrieval functions
const mockDb = {
  getProducts: (): Product[] => JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]'),
  saveProducts: (products: Product[]) => localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products)),
  
  getCategories: (): string[] => JSON.parse(localStorage.getItem(KEYS.CATEGORIES) || '[]'),
  saveCategories: (cats: string[]) => localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(cats)),
  
  getBrands: (): string[] => JSON.parse(localStorage.getItem(KEYS.BRANDS) || '[]'),
  saveBrands: (brands: string[]) => localStorage.setItem(KEYS.BRANDS, JSON.stringify(brands)),

  getCoupons: (): Coupon[] => JSON.parse(localStorage.getItem(KEYS.COUPONS) || '[]'),
  saveCoupons: (coupons: Coupon[]) => localStorage.setItem(KEYS.COUPONS, JSON.stringify(coupons)),

  getKits: (): Kit[] => {
    const kits: Kit[] = JSON.parse(localStorage.getItem(KEYS.KITS) || '[]');
    const products = mockDb.getProducts();
    return kits.map(k => ({
      ...k,
      products: k.products.map(kp => ({
        ...kp,
        product: products.find(p => p.id === kp.product_id)
      }))
    }));
  },
  saveKits: (kits: Kit[]) => {
    const stripped = kits.map(k => ({
      ...k,
      products: k.products.map(kp => ({
        product_id: kp.product_id,
        quantity: kp.quantity
      }))
    }));
    localStorage.setItem(KEYS.KITS, JSON.stringify(stripped));
  },
  
  getCustomers: (): Customer[] => JSON.parse(localStorage.getItem(KEYS.CUSTOMERS) || '[]'),
  saveCustomers: (customers: Customer[]) => localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers)),
  
  getCarts: (): CartSession[] => JSON.parse(localStorage.getItem(KEYS.CARTS) || '[]'),
  saveCarts: (carts: CartSession[]) => localStorage.setItem(KEYS.CARTS, JSON.stringify(carts)),
  
  getOrders: (): Order[] => {
    const orders: Order[] = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
    const products = mockDb.getProducts();
    return orders.map(o => ({
      ...o,
      items: o.items.map(i => ({
        ...i,
        product: products.find(p => p.id === i.product_id)
      }))
    }));
  },
  saveOrders: (orders: Order[]) => {
    const stripped = orders.map(o => ({
      ...o,
      items: o.items.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
        price: i.price,
        cost: i.cost
      }))
    }));
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(stripped));
  },
  
  getEvents: (): AnalyticsEvent[] => JSON.parse(localStorage.getItem(KEYS.EVENTS) || '[]'),
  saveEvents: (events: AnalyticsEvent[]) => localStorage.setItem(KEYS.EVENTS, JSON.stringify(events))
};

// DATABASE SERVICES EXPORT (SUPABASE / LOCAL COMBINED)
export const dbService = {
  // PRODUCTS
  getProducts: async (): Promise<Product[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (!error && data) return data as Product[];
    }
    return mockDb.getProducts();
  },

  getProductById: async (id: string): Promise<Product | null> => {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (!error && data) return data as Product;
    }
    const products = mockDb.getProducts();
    return products.find(p => p.id === id) || null;
  },

  upsertProduct: async (product: Omit<Product, 'created_at'>): Promise<Product> => {
    if (supabase) {
      const { data, error } = await supabase.from('products').upsert(product).select().single();
      if (!error && data) return data as Product;
    }
    
    const products = mockDb.getProducts();
    const existingIdx = products.findIndex(p => p.id === product.id);
    const updatedProduct = { ...product } as Product;
    
    if (existingIdx >= 0) {
      products[existingIdx] = updatedProduct;
    } else {
      updatedProduct.id = product.id || `p-${Date.now().toString().slice(-5)}`;
      products.push(updatedProduct);
    }
    
    mockDb.saveProducts(products);
    return updatedProduct;
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
    }
    
    const products = mockDb.getProducts();
    const filtered = products.filter(p => p.id !== id);
    mockDb.saveProducts(filtered);
    return true;
  },

  // CATEGORIES
  getCategories: async (): Promise<string[]> => {
    return mockDb.getCategories();
  },

  addCategory: async (category: string): Promise<string[]> => {
    const cats = mockDb.getCategories();
    if (!cats.includes(category)) {
      cats.push(category);
      cats.sort();
      mockDb.saveCategories(cats);
    }
    return cats;
  },

  // BRANDS
  getBrands: async (): Promise<string[]> => {
    return mockDb.getBrands();
  },

  addBrand: async (brand: string): Promise<string[]> => {
    const brs = mockDb.getBrands();
    if (!brs.includes(brand)) {
      brs.push(brand);
      brs.sort();
      mockDb.saveBrands(brs);
    }
    return brs;
  },

  // COUPONS
  getCoupons: async (): Promise<Coupon[]> => {
    return mockDb.getCoupons();
  },

  addCoupon: async (coupon: Coupon): Promise<Coupon[]> => {
    const coupons = mockDb.getCoupons();
    const idx = coupons.findIndex(c => c.code.toLowerCase() === coupon.code.toLowerCase());
    if (idx >= 0) {
      coupons[idx] = coupon;
    } else {
      coupons.push(coupon);
    }
    mockDb.saveCoupons(coupons);
    return coupons;
  },

  deleteCoupon: async (code: string): Promise<boolean> => {
    const coupons = mockDb.getCoupons();
    const filtered = coupons.filter(c => c.code.toLowerCase() !== code.toLowerCase());
    mockDb.saveCoupons(filtered);
    return true;
  },

  // KITS
  getKits: async (): Promise<Kit[]> => {
    if (supabase) {
      const { data: kitsData, error: kErr } = await supabase.from('kits').select('*');
      const { data: kpData, error: kpErr } = await supabase.from('kit_products').select('*, products(*)');
      
      if (!kErr && !kpErr && kitsData && kpData) {
        return kitsData.map(k => {
          const links = kpData.filter(kp => kp.kit_id === k.id);
          return {
            ...k,
            products: links.map(l => ({
              product_id: l.product_id,
              quantity: l.quantity,
              product: l.products as Product
            }))
          };
        });
      }
    }
    return mockDb.getKits();
  },

  getKitById: async (id: string): Promise<Kit | null> => {
    const kits = await dbService.getKits();
    return kits.find(k => k.id === id) || null;
  },

  upsertKit: async (kit: Kit): Promise<Kit> => {
    const kits = mockDb.getKits();
    const idx = kits.findIndex(k => k.id === kit.id);
    if (idx >= 0) {
      kits[idx] = kit;
    } else {
      kit.id = kit.id || `k-${Date.now().toString().slice(-4)}`;
      kits.push(kit);
    }
    mockDb.saveKits(kits);
    return kit;
  },

  deleteKit: async (id: string): Promise<boolean> => {
    const kits = mockDb.getKits();
    const filtered = kits.filter(k => k.id !== id);
    mockDb.saveKits(filtered);
    return true;
  },

  // CUSTOMERS (CRM)
  getCustomers: async (): Promise<Customer[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('customers').select('*');
      if (!error && data) return data as Customer[];
    }
    return mockDb.getCustomers();
  },

  addCustomer: async (customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> => {
    if (supabase) {
      const { data, error } = await supabase.from('customers').insert(customer).select().single();
      if (!error && data) return data as Customer;
    }
    
    const customers = mockDb.getCustomers();
    let existing = customers.find(c => c.email.toLowerCase() === customer.email.toLowerCase());
    if (existing) {
      existing.full_name = customer.full_name;
      if (customer.phone) existing.phone = customer.phone;
      existing.interests = Array.from(new Set([...existing.interests, ...customer.interests]));
      existing.is_subscribed = customer.is_subscribed;
    } else {
      existing = {
        id: `c-${Date.now().toString().slice(-4)}`,
        ...customer,
        created_at: new Date().toISOString()
      };
      customers.push(existing);
    }
    mockDb.saveCustomers(customers);
    return existing;
  },

  // ORDERS (CHECKOUT)
  getOrders: async (): Promise<Order[]> => {
    if (supabase) {
      const { data: oData, error: oErr } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      const { data: oiData, error: oiErr } = await supabase.from('order_items').select('*, products(*)');
      
      if (!oErr && !oiErr && oData && oiData) {
        return oData.map(o => {
          const items = oiData.filter(i => i.order_id === o.id);
          return {
            ...o,
            items: items.map(i => ({
              product_id: i.product_id,
              quantity: i.quantity,
              price: i.price,
              cost: i.cost,
              product: i.products as Product
            }))
          };
        });
      }
    }
    return mockDb.getOrders();
  },

  createOrder: async (orderData: Omit<Order, 'id' | 'created_at'>): Promise<Order | null> => {
    let success = true;
    const products = mockDb.getProducts();
    
    for (const item of orderData.items) {
      const p = products.find(prod => prod.id === item.product_id);
      if (!p || p.stock < item.quantity) {
        success = false;
        break;
      }
    }
    
    if (!success) return null;

    orderData.items.forEach(item => {
      const p = products.find(prod => prod.id === item.product_id);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
        item.cost = p.cost; // Save cogs cost on the item!
      }
    });
    mockDb.saveProducts(products);

    const newOrder: Order = {
      ...orderData,
      id: `o-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString()
    };
    
    const orders = mockDb.getOrders();
    orders.unshift(newOrder);
    mockDb.saveOrders(orders);

    await dbService.addCustomer({
      email: orderData.customer_email,
      full_name: orderData.customer_name,
      phone: orderData.customer_phone,
      interests: Array.from(new Set(orderData.items.map(i => {
        const prod = products.find(p => p.id === i.product_id);
        return prod ? prod.category.toLowerCase() : '';
      }).filter(Boolean))),
      is_subscribed: true
    });

    return newOrder;
  },

  saveOrders: async (orders: Order[]): Promise<void> => {
    mockDb.saveOrders(orders);
  },

  // CARTS & ABANDONED CARTS
  getCartSessions: async (): Promise<CartSession[]> => {
    return mockDb.getCarts();
  },

  updateCartSession: async (sessionToken: string, items: CartItem[], contact?: string): Promise<CartSession> => {
    const carts = mockDb.getCarts();
    let cart = carts.find(c => c.session_token === sessionToken);
    
    if (cart) {
      cart.items_summary = items;
      cart.last_activity = new Date().toISOString();
      if (contact) cart.contact_captured = contact;
    } else {
      cart = {
        id: `cart-${Date.now().toString().slice(-4)}`,
        session_token: sessionToken,
        status: 'active',
        items_summary: items,
        contact_captured: contact || null,
        last_activity: new Date().toISOString()
      };
      carts.push(cart);
    }
    
    mockDb.saveCarts(carts);
    return cart;
  },

  markCartAsConverted: async (sessionToken: string): Promise<void> => {
    const carts = mockDb.getCarts();
    const cart = carts.find(c => c.session_token === sessionToken);
    if (cart) {
      cart.status = 'converted';
      cart.last_activity = new Date().toISOString();
      mockDb.saveCarts(carts);
    }
  },

  // ANALYTICS EVENTS
  logEvent: async (sessionToken: string, eventType: string, payload: Record<string, any>): Promise<void> => {
    const events = mockDb.getEvents();
    const newEvent: AnalyticsEvent = {
      id: `ev-${Date.now().toString().slice(-5)}`,
      session_token: sessionToken,
      event_type: eventType,
      payload,
      created_at: new Date().toISOString()
    };
    events.push(newEvent);
    mockDb.saveEvents(events);
  },

  getAnalyticsEvents: async (): Promise<AnalyticsEvent[]> => {
    return mockDb.getEvents();
  }
};
