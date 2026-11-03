import React, { useState } from 'react';
import { Product, BrandingConfig } from '../types';
import { Sparkles, ShoppingBag, Flame, Check } from 'lucide-react';
import { formatCurrency } from '../utils/pricing';

interface ProductCardProps {
  product: Product;
  onCustomizeIn3D: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, branding: BrandingConfig) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onCustomizeIn3D,
  onAddToCart,
}) => {
  const [qty, setQty] = useState(product.minOrderQty || 1);
  const [justAdded, setJustAdded] = useState(false);

  // Bulk tier estimate (assuming 50 units gives 18% off)
  const bulkTierPrice = product.basePrice * 0.82;

  const handleQuickAdd = () => {
    const defaultBranding: BrandingConfig = {
      companyName: 'LUMINA & OAK',
      logoText: 'LUMINA & OAK',
      engravingText: 'CORPORATE EDITION',
      vesselFinish: (product.finishOptions[0] as any) || 'amber-glass',
      lidFinish: 'bamboo',
      scentChoice: product.fragranceNotes.split(',')[0] || 'Amber & Fig',
      giftCardMessage: 'Thank you for your dedicated partnership and excellence.',
      ribbonColor: 'champagne',
    };

    onAddToCart(product, qty, defaultBranding);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div className="group bg-white border border-stone-200 hover:border-amber-400/80 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col shadow-xs hover:shadow-md text-stone-900">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {product.badge && (
            <span className="bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
              {product.badge}
            </span>
          )}
          <span className="bg-white/90 text-stone-700 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
            {product.category}
          </span>
        </div>

        {/* Burn time badge */}
        {product.burnTimeHours && (
          <div className="absolute bottom-3 left-3 bg-white/90 text-stone-700 text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
            <Flame className="w-3 h-3 text-amber-600" />
            <span>{product.burnTimeHours}h Burn Time</span>
          </div>
        )}

        {/* 3D Button */}
        <button
          onClick={() => onCustomizeIn3D(product)}
          className="absolute bottom-3 right-3 bg-white/95 hover:bg-amber-600 text-stone-800 hover:text-white border border-stone-200 hover:border-amber-600 px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 group-hover:text-white" />
          <span>3D View</span>
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-serif text-base font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Fragrance Notes */}
          <div className="mt-2.5 py-1 px-2.5 bg-stone-50 border border-stone-200/80 rounded-lg text-[11px] text-stone-600 flex items-center gap-1.5">
            <span className="text-stone-400 font-semibold uppercase text-[9px]">Scent:</span>
            <span className="truncate font-medium text-stone-700">{product.fragranceNotes}</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-stone-100 space-y-2.5">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-[11px] text-stone-500 block">Unit Price</span>
              <span className="text-base font-bold text-stone-900">
                {formatCurrency(product.basePrice)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wide block">
                Bulk (50+ units)
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {formatCurrency(bulkTierPrice)} <span className="text-[10px] text-stone-500">(-18%)</span>
              </span>
            </div>
          </div>

          {/* Quantity and Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQty(Math.max(product.minOrderQty, qty - (qty >= 50 ? 10 : 5)))}
                className="px-2 py-1 text-stone-600 hover:text-stone-900 text-xs font-bold"
              >
                -
              </button>
              <input
                type="number"
                min={product.minOrderQty}
                value={qty}
                onChange={(e) => setQty(Math.max(product.minOrderQty, parseInt(e.target.value) || product.minOrderQty))}
                className="w-10 text-center bg-transparent text-xs font-semibold text-stone-800 outline-none"
              />
              <button
                onClick={() => setQty(qty + (qty >= 50 ? 10 : 5))}
                className="px-2 py-1 text-stone-600 hover:text-stone-900 text-xs font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={handleQuickAdd}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs ${
                justAdded
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-900 hover:bg-amber-700 text-white'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added {qty} to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add {qty} to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
