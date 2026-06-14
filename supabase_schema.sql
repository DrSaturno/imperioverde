-- SCRIPT DE CREACIÓN DE TABLAS PARA IMPERIO VERDE GROW SHOP

-- 1. Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  cost NUMERIC(10, 2),
  price NUMERIC(10, 2) NOT NULL,
  promotional_price NUMERIC(10, 2),
  brand TEXT DEFAULT 'Varios',
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  description TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('principiante', 'intermedio', 'avanzado')) DEFAULT 'principiante',
  is_specialized BOOLEAN DEFAULT false,
  specifications JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Kits de Cultivo
CREATE TABLE IF NOT EXISTS kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
  difficulty_level TEXT CHECK (difficulty_level IN ('principiante', 'intermedio', 'avanzado')) DEFAULT 'principiante',
  interests TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Relación de Productos por Kit
CREATE TABLE IF NOT EXISTS kit_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES kits(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- 4. Tabla de Clientes (CRM)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  interests TEXT[] DEFAULT '{}'::text[],
  is_subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de Sesiones de Carrito
CREATE TABLE IF NOT EXISTS cart_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('active', 'abandoned', 'converted')) DEFAULT 'active',
  items_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  contact_captured TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de Pedidos / Órdenes
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  shipping_method TEXT CHECK (shipping_method IN ('delivery', 'pickup')) NOT NULL,
  shipping_address TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabla de Detalle de Órdenes
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL
);

-- 8. Tabla de Eventos de Analíticas
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso libre para lectura de catálogo (público)
-- Nota: En producción, configurar las políticas de escritura solo para administradores autenticados.

-- Procedimiento Almacenado (RPC) para Descuento Atómico de Stock
CREATE OR REPLACE FUNCTION process_order_stock_deduction(items_to_deduct JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  item RECORD;
BEGIN
  -- Iterar sobre el array de productos y cantidades
  FOR item IN SELECT * FROM jsonb_to_recordset(items_to_deduct) AS x(product_id UUID, qty INT) LOOP
    -- Validar stock actual
    IF (SELECT stock FROM products WHERE id = item.product_id) < item.qty THEN
      RAISE EXCEPTION 'Stock insuficiente para el producto %', item.product_id;
    END IF;
    
    -- Descontar stock
    UPDATE products 
    SET stock = stock - item.qty
    WHERE id = item.product_id;
  END LOOP;
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
