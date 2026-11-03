import React, { useState } from 'react';
import { CartItem } from '../types';
import { calculateCartPricing, formatCurrency } from '../utils/pricing';
import { X, Trash2, ShoppingBag, Lock, ChevronRight, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: (isTaxExempt: boolean, deliveryMethod: 'single_hq' | 'individual_addresses') => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [isTaxExempt, setIsTaxExempt] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'single_hq' | 'individual_addresses'>('single_hq');

  if (!isOpen) return null;

  const pricing = calculateCartPricing(items, isTaxExempt, deliveryMethod);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-stone-200 text-stone-900 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
              <h2 className="font-serif text-lg font-bold">Shopping Cart</h2>
              <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                {pricing.totalUnits} Units
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-sm text-stone-500">Your cart is currently empty.</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2.5"
                >
                  <div className="flex gap-3">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-lg object-cover bg-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-[11px] text-stone-500">
                        {formatCurrency(item.unitPrice)} each
                      </div>

                      {/* Branding summary */}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.branding.companyName && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                            Logo: {item.branding.companyName}
                          </span>
                        )}
                        <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded capitalize">
                          {item.branding.vesselFinish.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="text-stone-400 hover:text-red-600 p-1 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-200/80">
                    <div className="flex items-center bg-white border border-stone-200 rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 5))}
                        className="px-2 py-0.5 text-stone-600 hover:text-stone-900 text-xs font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(idx, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 text-center bg-transparent text-xs text-stone-800 outline-none font-semibold"
                      />
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 5)}
                        className="px-2 py-0.5 text-stone-600 hover:text-stone-900 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-xs font-bold text-stone-900">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing & Checkout Section */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50 space-y-4">
              {/* Shipping selection & Tax exempt */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600 font-medium">Shipping Mode:</span>
                  <select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value as any)}
                    className="bg-white border border-stone-200 rounded px-2 py-1 text-xs text-stone-800 outline-none"
                  >
                    <option value="single_hq">Consolidated HQ Delivery</option>
                    <option value="individual_addresses">Direct Employee Delivery</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="taxExemptCheck"
                    checked={isTaxExempt}
                    onChange={(e) => setIsTaxExempt(e.target.checked)}
                    className="w-3.5 h-3.5 accent-amber-600 rounded cursor-pointer"
                  />
                  <label htmlFor="taxExemptCheck" className="text-stone-600 text-[11px] cursor-pointer">
                    Tax-Exempt / 501(c)(3) Entity
                  </label>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs border-t border-stone-200 pt-3">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({pricing.totalUnits} items):</span>
                  <span>{formatCurrency(pricing.subtotal)}</span>
                </div>

                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Volume Discount ({pricing.discountPercent}% off):</span>
                    <span>-{formatCurrency(pricing.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Laser Engraving Branding:</span>
                  <span>
                    {pricing.brandingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      formatCurrency(pricing.brandingFee)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Shipping:</span>
                  <span>{pricing.shippingFee === 0 ? 'FREE' : formatCurrency(pricing.shippingFee)}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Sales Tax ({isTaxExempt ? '0%' : '8.25%'}):</span>
                  <span>{formatCurrency(pricing.taxAmount)}</span>
                </div>

                <div className="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-stone-200">
                  <span>Total:</span>
                  <span className="text-amber-700 text-base">{formatCurrency(pricing.total)}</span>
                </div>
              </div>

              {/* Stripe Checkout Button */}
              <button
                onClick={() => onProceedToCheckout(isTaxExempt, deliveryMethod)}
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-white" />
                <span>Checkout with Stripe</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted • Stripe PCI-DSS Level 1</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
