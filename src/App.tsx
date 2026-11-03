/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, CartItem, Order, UserProfile, BrandingConfig, OrderStatus } from './types';
import { INITIAL_PRODUCTS } from './data/mockProducts';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ThreeCustomizer } from './components/ThreeCustomizer';
import { BulkOrderCalculator } from './components/BulkOrderCalculator';
import { CartDrawer } from './components/CartDrawer';
import { StripeCheckoutModal } from './components/StripeCheckoutModal';
import { AdminCMS } from './components/AdminCMS';
import { Sparkles, ArrowRight, Award, Truck, ShieldCheck, Box, Lock } from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [currentTab, setCurrentTab] = useState<string>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Product Catalog state
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Active customizer product
  const [customizerProduct, setCustomizerProduct] = useState<Product>(INITIAL_PRODUCTS[0]);
  const [customizerMode, setCustomizerMode] = useState<'candle' | 'hamper'>('candle');

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: INITIAL_PRODUCTS[0],
      quantity: 50,
      unitPrice: INITIAL_PRODUCTS[0].basePrice,
      branding: {
        companyName: 'Acme Corp',
        logoText: 'ACME',
        engravingText: 'EST. 2026 • ANNUAL SUMMIT',
        vesselFinish: 'amber-glass',
        lidFinish: 'bamboo',
        scentChoice: 'Amber & Smoked Fig',
        giftCardMessage: 'In appreciation of your exceptional dedication and excellence.',
        ribbonColor: 'champagne',
      },
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutTaxExempt, setCheckoutTaxExempt] = useState(false);
  const [checkoutDeliveryMethod, setCheckoutDeliveryMethod] = useState<'single_hq' | 'individual_addresses'>('single_hq');

  // Admin authentication state (separate login)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // User profile
  const [currentUser] = useState<UserProfile>({
    uid: 'user-client-1',
    email: 'client@company.com',
    displayName: 'Elena Vance',
    companyName: 'Acme Corp',
    role: 'corporate',
    mfaEnabled: true,
    createdAt: new Date().toISOString(),
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-2026-9812',
      userId: 'user-client-1',
      userEmail: 'client@company.com',
      companyName: 'Acme Technologies Inc.',
      items: [
        {
          product: INITIAL_PRODUCTS[0],
          quantity: 50,
          unitPrice: 48,
          branding: {
            companyName: 'Acme Technologies',
            logoText: 'ACME',
            engravingText: 'ANNUAL RECOGNITION 2026',
            vesselFinish: 'amber-glass',
            lidFinish: 'bamboo',
            scentChoice: 'Amber & Smoked Fig',
            giftCardMessage: 'Thank you for an incredible year.',
            ribbonColor: 'champagne',
          },
        },
      ],
      totalUnits: 50,
      subtotal: 2400,
      discountRate: 18,
      discountAmount: 432,
      brandingFee: 150,
      tax: 174.74,
      total: 2292.74,
      paymentStatus: 'paid',
      stripePaymentIntentId: 'pi_3MtwxX2eZvKYlo2C1928374',
      orderStatus: 'branding_engraving',
      trackingNumber: 'FX-8819204910',
      courier: 'FedEx Priority Express',
      deliveryMethod: 'single_hq',
      shippingAddress: {
        attention: 'Elena Vance / People Ops',
        street: '100 Innovation Way, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'United States',
      },
      recipientCount: 50,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Handler: Add to cart
  const handleAddToCart = (product: Product, quantity: number, branding: BrandingConfig) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id && i.branding.companyName === branding.companyName
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        return copy;
      }
      return [...prev, { product, quantity, unitPrice: product.basePrice, branding }];
    });
    setIsCartOpen(true);
  };

  // Handler: Update cart quantity
  const handleUpdateCartQuantity = (index: number, quantity: number) => {
    setCartItems((prev) => {
      const copy = [...prev];
      copy[index].quantity = quantity;
      return copy;
    });
  };

  // Handler: Remove cart item
  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Handler: Open checkout
  const handleProceedToCheckout = (isTaxExempt: boolean, deliveryMethod: 'single_hq' | 'individual_addresses') => {
    setCheckoutTaxExempt(isTaxExempt);
    setCheckoutDeliveryMethod(deliveryMethod);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Handler: Successful checkout
  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
  };

  // Admin login logic
  const handleAdminLogin = (email: string, pass: string): boolean => {
    if (pass === 'admin2026' || pass === 'admin') {
      setIsAdminLoggedIn(true);
      setCurrentTab('admin');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentTab('catalog');
  };

  // Admin CMS handlers
  const handleUpdateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, basePrice: newPrice } : p))
    );
  };

  const handleAddNewProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus, trackingNumber?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: status,
              trackingNumber: trackingNumber || o.trackingNumber,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );
  };

  // Filter products by category
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const cartTotalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Top Header Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        cartCount={cartTotalCount}
        openCart={() => setIsCartOpen(true)}
        onOpenAdminPortal={() => setCurrentTab('admin')}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {/* VIEW 1: PRODUCT CATALOG & E-COMMERCE STOREFRONT */}
        {currentTab === 'catalog' && (
          <div className="space-y-10 pb-16">
            {/* Hero Section */}
            <Hero
              onOpenCustomizer={() => setCurrentTab('customizer')}
              onOpenBulkCalculator={() => setCurrentTab('bulk')}
              onExploreCatalog={() => {
                const el = document.getElementById('catalog-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Catalog Filter Bar */}
            <div id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-6">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                    Artisan Candles &amp; Curated Hampers
                  </h2>
                  <p className="text-xs text-stone-600 mt-1">
                    Small-batch coconut soy candles and handcrafted pine gift crates.
                  </p>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
                  {[
                    { id: 'all', label: 'All Products' },
                    { id: 'candle', label: 'Candles' },
                    { id: 'hamper', label: 'Gift Hampers' },
                    { id: 'bundle', label: 'Bundles' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selectedCategory === cat.id
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onCustomizeIn3D={(product) => {
                      setCustomizerProduct(product);
                      setCustomizerMode(product.category === 'hamper' ? 'hamper' : 'candle');
                      setCurrentTab('customizer');
                    }}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>

            {/* Custom 3D Studio Promo Card */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    3D Customizer
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Preview Your Company Logo &amp; Laser Engraving
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Rotate 360°, inspect vessel finishes (Amber Glass, Matte Noir, Rose Copper), test turned bamboo lids, and view exploded diagrams.
                  </p>
                </div>

                <button
                  onClick={() => setCurrentTab('customizer')}
                  className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition shadow-xs flex items-center gap-2 shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Open 3D Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Value Highlights */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-2 shadow-xs">
                  <Award className="w-5 h-5 text-amber-700" />
                  <h4 className="font-serif text-sm font-bold text-stone-900">
                    100% Pure Soy Wax
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Clean-burning coconut soy wax with natural essential oil fragrance blends and lead-free cotton wicks.
                  </p>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-2 shadow-xs">
                  <Truck className="w-5 h-5 text-amber-700" />
                  <h4 className="font-serif text-sm font-bold text-stone-900">
                    Direct Employee Delivery
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    We handle logistics whether delivering to one headquarters or directly to remote employees worldwide.
                  </p>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-2 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <h4 className="font-serif text-sm font-bold text-stone-900">
                    Stripe Secure Invoicing
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Credit card checkout, company PO support, tax exemption IDs, and instant downloadable invoice receipts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: 3D STUDIO CUSTOMIZER */}
        {currentTab === 'customizer' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  3D Brand Customizer
                </h2>
                <p className="text-xs text-stone-600">
                  Rotate 360°, inspect finishes, test lid engravings, and apply your branding to bulk orders.
                </p>
              </div>

              <button
                onClick={() => setCurrentTab('bulk')}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 hover:border-amber-500 text-stone-700 text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <Box className="w-4 h-4 text-amber-700" />
                Calculate Volume Pricing
              </button>
            </div>

            {/* 3D Canvas */}
            <ThreeCustomizer
              productName={customizerProduct.name}
              defaultMode={customizerMode}
              initialConfig={{
                companyName: currentUser.companyName,
                engravingText: 'EST. 2026 • ANNUAL RECOGNITION',
                vesselFinish: 'amber-glass',
                lidFinish: 'bamboo',
                scentChoice: customizerProduct.fragranceNotes.split(',')[0] || 'Amber & Smoked Fig',
                giftCardMessage: 'In appreciation of your exceptional dedication.',
                ribbonColor: 'champagne',
              }}
              onSaveConfig={(config) => {
                handleAddToCart(customizerProduct, 50, config);
              }}
            />
          </div>
        )}

        {/* VIEW 3: BULK PRICING CALCULATOR */}
        {currentTab === 'bulk' && (
          <BulkOrderCalculator
            products={products}
            onAddBulkToCart={handleAddToCart}
          />
        )}

        {/* VIEW 4: SEPARATE ADMIN DASHBOARD (PROTECTED) */}
        {currentTab === 'admin' && (
          <AdminCMS
            products={products}
            orders={orders}
            onUpdateProductStock={handleUpdateProductStock}
            onUpdateProductPrice={handleUpdateProductPrice}
            onAddNewProduct={handleAddNewProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            isAdminLoggedIn={isAdminLoggedIn}
            onAdminLogin={handleAdminLogin}
            onAdminLogout={handleAdminLogout}
            onBackToStore={() => setCurrentTab('catalog')}
          />
        )}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Stripe Checkout Modal */}
      <StripeCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        isTaxExempt={checkoutTaxExempt}
        deliveryMethod={checkoutDeliveryMethod}
        currentUser={currentUser}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Clean Light Footer */}
      <footer className="bg-white border-t border-stone-200 py-10 text-stone-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span className="font-serif text-base font-bold text-stone-900 tracking-wider">
                  LUMINA &amp; OAK
                </span>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed">
                Handcrafted botanical soy candles and curated luxury employee gift hampers with bespoke corporate branding.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-stone-800 uppercase tracking-wider mb-2">Shop &amp; Customize</h5>
              <ul className="space-y-1.5">
                <li><button onClick={() => setCurrentTab('catalog')} className="hover:text-amber-800">All Products &amp; Hampers</button></li>
                <li><button onClick={() => setCurrentTab('customizer')} className="hover:text-amber-800">3D Brand Visualizer</button></li>
                <li><button onClick={() => setCurrentTab('bulk')} className="hover:text-amber-800">Volume Pricing Quotes</button></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-stone-800 uppercase tracking-wider mb-2">Staff &amp; Operations</h5>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => setCurrentTab('admin')}
                    className="hover:text-amber-800 flex items-center gap-1 font-semibold text-amber-800"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isAdminLoggedIn ? 'Admin Management Dashboard' : 'Admin Staff Portal Login'}</span>
                  </button>
                </li>
                <li><span className="text-stone-400">Inventory CMS</span></li>
                <li><span className="text-stone-400">Stripe PCI-DSS Gateway</span></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-stone-800 uppercase tracking-wider mb-2">Corporate Support</h5>
              <p className="text-stone-500 text-xs leading-relaxed">
                Need assistance with bulk orders, custom logo formats, or employee addresses?
              </p>
              <div className="mt-2">
                <span className="text-amber-800 font-semibold block">support@luminaoak.com</span>
                <span className="text-stone-400 text-[11px]">Mon-Fri 9am-6pm PT</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-400">
            <div>
              © 2026 Lumina &amp; Oak Artisanal Candles &amp; Hampers. All rights reserved.
            </div>
            <div className="flex items-center gap-3">
              <span>Secure Payments via Stripe</span>
              <span>•</span>
              <span>100% Botanical Soy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
