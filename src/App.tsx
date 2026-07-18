import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';

// Public Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Kits } from './pages/Kits';
import { KitDetails } from './pages/KitDetails';
import { Hydroponics } from './pages/Hydroponics';
import { Diagnostic } from './pages/Diagnostic';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCRM } from './pages/admin/AdminCRM';
import { AdminCarts } from './pages/admin/AdminCarts';
import { AdminSales } from './pages/admin/AdminSales';
import { AdminMarketing } from './pages/admin/AdminMarketing';
import { AdminTraffic } from './pages/admin/AdminTraffic';
import { AdminFinance } from './pages/admin/AdminFinance';

const App: React.FC = () => {
  return (
    <ToastProvider>
    <CartProvider>
      <BrowserRouter>
        <Routes>
          
          {/* PUBLIC CLIENT ROUTING */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/productos" element={<Layout><Shop /></Layout>} />
          <Route path="/productos/:categoria" element={<Layout><Shop /></Layout>} />
          <Route path="/productos/:categoria/:id" element={<Layout><ProductDetails /></Layout>} />
          <Route path="/kits" element={<Layout><Kits /></Layout>} />
          <Route path="/kits/:id" element={<Layout><KitDetails /></Layout>} />
          <Route path="/hidroponia" element={<Layout><Hydroponics /></Layout>} />
          <Route path="/resolver" element={<Layout><Diagnostic /></Layout>} />
          <Route path="/resolver/:problema" element={<Layout><Diagnostic /></Layout>} />
          <Route path="/carrito" element={<Layout><Cart /></Layout>} />
          <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
          
          {/* Fallback to home for simple Guides links */}
          <Route path="/guias" element={<Layout><Home /></Layout>} />
          <Route path="/guias/:slug" element={<Layout><Home /></Layout>} />

          {/* ADMIN ROUTING */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="productos" element={<AdminProducts />} />
            <Route path="ventas" element={<AdminSales />} />
            <Route path="crm" element={<AdminCRM />} />
            <Route path="abandonados" element={<AdminCarts />} />
            <Route path="marketing" element={<AdminMarketing />} />
            <Route path="trafico" element={<AdminTraffic />} />
            <Route path="finanzas" element={<AdminFinance />} />
          </Route>

          {/* CATCH-ALL REDIRECT */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </CartProvider>
    </ToastProvider>
  );
};

export default App;
