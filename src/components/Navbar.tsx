import React, { useState } from 'react';
import { Sparkles, ShoppingBag, Box, Menu, X, Lock } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  cartCount: number;
  openCart: () => void;
  onOpenAdminPortal: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  cartCount,
  openCart,
  onOpenAdminPortal,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-stone-200 shadow-xs backdrop-blur-md text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentTab('catalog')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-900/10 group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="leading-tight">
            <span className="font-serif text-base sm:text-xl md:text-2xl font-bold tracking-wider text-stone-900 uppercase group-hover:text-amber-700 transition-colors whitespace-nowrap block">
              Lumina &amp; Oak
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-wider text-amber-700 font-semibold uppercase whitespace-nowrap block">
              Artisan Candles &amp; Hampers
            </span>
          </div>
        </div>

        {/* Desktop E-Commerce Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setCurrentTab('catalog')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              currentTab === 'catalog'
                ? 'bg-stone-100 text-amber-800 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            Catalog
          </button>

          <button
            onClick={() => setCurrentTab('customizer')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
              currentTab === 'customizer'
                ? 'bg-stone-100 text-amber-800 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            3D Customizer
          </button>

          <button
            onClick={() => setCurrentTab('bulk')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
              currentTab === 'bulk'
                ? 'bg-stone-100 text-amber-800 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Box className="w-4 h-4 text-stone-500" />
            Bulk Pricing Quotes
          </button>
        </nav>

        {/* Right Customer Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Login/Dashboard Portal Trigger */}
          <button
            onClick={onOpenAdminPortal}
            title={isAdminLoggedIn ? 'Admin Dashboard (Active)' : 'Admin Staff Login'}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${
              isAdminLoggedIn
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">
              {isAdminLoggedIn ? 'Admin Panel' : 'Admin Login'}
            </span>
          </button>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="bg-amber-800 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-stone-100 text-stone-700 border border-stone-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1">
          <button
            onClick={() => {
              setCurrentTab('catalog');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100"
          >
            Catalog
          </button>
          <button
            onClick={() => {
              setCurrentTab('customizer');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            3D Customizer
          </button>
          <button
            onClick={() => {
              setCurrentTab('bulk');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100"
          >
            Bulk Pricing Quotes
          </button>
          <button
            onClick={() => {
              onOpenAdminPortal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2 border-t border-stone-100 mt-1"
          >
            <Lock className="w-4 h-4" />
            {isAdminLoggedIn ? 'Open Admin Dashboard' : 'Admin Staff Portal Login'}
          </button>
        </div>
      )}
    </header>
  );
};
