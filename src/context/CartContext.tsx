import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbService, CartItem, Product, Kit } from '../services/db';

interface CartItemDetail {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItemDetail[];
  sessionToken: string;
  contactCaptured: string | null;
  addToCart: (product: Product, qty: number) => Promise<void>;
  addKitToCart: (kit: Kit) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  setContactInfo: (contact: string) => Promise<void>;
  totalAmount: number;
  totalSavings: number;
  rawTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItemDetail[]>([]);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [contactCaptured, setContactCaptured] = useState<string | null>(null);

  // Initialize session token and cart cache
  useEffect(() => {
    let token = localStorage.getItem('imperio_verde_session_token');
    if (!token) {
      token = 'session-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
      localStorage.setItem('imperio_verde_session_token', token);
    }
    setSessionToken(token);

    const savedCart = localStorage.getItem('imperio_verde_cart_items');
    const savedContact = localStorage.getItem('imperio_verde_contact');
    if (savedContact) setContactCaptured(savedContact);

    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart) as { product_id: string; quantity: number }[];
        // Fetch detailed product info to rebuild full cart details
        dbService.getProducts().then(allProducts => {
          const detailed: CartItemDetail[] = parsed
            .map(item => {
              const p = allProducts.find(x => x.id === item.product_id);
              if (p) return { product: p, quantity: item.quantity };
              return null;
            })
            .filter((x): x is CartItemDetail => x !== null);
          setCart(detailed);
        });
      } catch (e) {
        console.error('Error parsing cart from storage:', e);
      }
    }

    // Log landing page view event
    dbService.logEvent(token, 'page_view', { page: window.location.pathname });
  }, []);

  // Update Supabase session and localStorage when cart changes
  useEffect(() => {
    if (!sessionToken) return;

    const itemsSummary: CartItem[] = cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    }));

    localStorage.setItem('imperio_verde_cart_items', JSON.stringify(itemsSummary));

    // Update db session (runs async in background)
    dbService.updateCartSession(sessionToken, itemsSummary, contactCaptured || undefined);
  }, [cart, sessionToken, contactCaptured]);

  const addToCart = async (product: Product, qty: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      let updated;
      if (existing) {
        updated = prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + qty } 
            : item
        );
      } else {
        updated = [...prev, { product, quantity: qty }];
      }
      return updated;
    });

    dbService.logEvent(sessionToken, 'cart_add', { 
      product_id: product.id, 
      name: product.name, 
      quantity: qty,
      price: product.promotional_price || product.price
    });
  };

  const addKitToCart = async (kit: Kit) => {
    // Add each component individual of the kit with a prorated discount price
    // This allows seamless stock deduction and checkout in Supabase
    dbService.logEvent(sessionToken, 'kit_view_add', { kit_id: kit.id, name: kit.name, price: kit.price });

    const productsList = await dbService.getProducts();

    setCart(prev => {
      let updated = [...prev];
      kit.products.forEach(kp => {
        const prod = productsList.find(p => p.id === kp.product_id);
        if (prod) {
          // calculate discounted price for this item based on kit discount
          const discountedProduct = {
            ...prod,
            // override price to apply prorated kit discount
            promotional_price: Number((prod.price * (1 - kit.discount_percentage / 100)).toFixed(2))
          };

          const existingIdx = updated.findIndex(item => item.product.id === prod.id);
          if (existingIdx >= 0) {
            updated[existingIdx] = {
              ...updated[existingIdx],
              quantity: updated[existingIdx].quantity + kp.quantity
            };
          } else {
            updated.push({
              product: discountedProduct,
              quantity: kp.quantity
            });
          }
        }
      });
      return updated;
    });
  };

  const removeFromCart = async (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    dbService.logEvent(sessionToken, 'cart_remove', { product_id: productId });
  };

  const updateQuantity = async (productId: string, qty: number) => {
    if (qty <= 0) {
      await removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: qty } 
        : item
    ));
    dbService.logEvent(sessionToken, 'cart_quantity_change', { product_id: productId, quantity: qty });
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem('imperio_verde_cart_items');
  };

  const setContactInfo = async (contact: string) => {
    setContactCaptured(contact);
    localStorage.setItem('imperio_verde_contact', contact);
  };

  // CALCULATE TOTALS
  // rawTotal: sum of regular price * quantity
  // totalAmount: sum of actual price (promotional if exists) * quantity
  // totalSavings: rawTotal - totalAmount
  const rawTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalAmount = cart.reduce((sum, item) => sum + ((item.product.promotional_price || item.product.price) * item.quantity), 0);
  const totalSavings = rawTotal - totalAmount;

  return (
    <CartContext.Provider value={{
      cart,
      sessionToken,
      contactCaptured,
      addToCart,
      addKitToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setContactInfo,
      rawTotal,
      totalAmount,
      totalSavings
    }}>
      {children}
    </CartContext.Provider>
  );
};
