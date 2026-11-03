import React from 'react';
import { Sparkles, ArrowRight, Box, ShieldCheck, Truck, Award } from 'lucide-react';

interface HeroProps {
  onOpenCustomizer: () => void;
  onOpenBulkCalculator: () => void;
  onExploreCatalog: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenCustomizer,
  onOpenBulkCalculator,
  onExploreCatalog,
}) => {
  return (
    <div className="relative overflow-hidden bg-[#f7f5f0] border-b border-stone-200 py-12 lg:py-16 text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Handcrafted Soy Candles &amp; Corporate Hampers
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-[1.2]">
              Artisanal Candle Gifting &amp; Luxury Hampers for <span className="text-amber-700">Team Recognition</span>.
            </h1>

            <p className="text-sm sm:text-base text-stone-600 max-w-xl font-normal leading-relaxed">
              100% natural botanical coconut soy candles and curated wooden gift hampers. Featuring bespoke corporate laser engraving, tiered volume discounts, and white-glove employee delivery.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onExploreCatalog}
                className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition shadow-sm flex items-center gap-2 group"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onOpenCustomizer}
                className="px-5 py-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-semibold text-sm transition flex items-center gap-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                Customize in 3D
              </button>

              <button
                onClick={onOpenBulkCalculator}
                className="px-4 py-3 rounded-xl text-stone-600 hover:text-stone-900 text-xs sm:text-sm font-medium transition"
              >
                Volume Discounts (Up to 35% Off)
              </button>
            </div>

            {/* Value Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-stone-200">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-xs font-medium text-stone-700">Volume Discounts</span>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-xs font-medium text-stone-700">Laser Engraving</span>
              </div>

              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-xs font-medium text-stone-700">Employee Delivery</span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-xs font-medium text-stone-700">Secure Stripe Checkout</span>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Product Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden relative bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80"
                  alt="Corporate Luxury Hamper"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/95 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                  Best Seller
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    The Executive Welcome Hamper
                  </h3>
                  <span className="text-amber-700 font-bold text-base">$145.00</span>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2">
                  12oz botanical soy candle, apothecary matches, solid brass wick trimmer, Italian leather notebook, and embossed company gift card.
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <span className="text-stone-500">Bulk price (50+ units):</span>
                  <span className="text-emerald-700 font-bold">$118.90 / unit (-18%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
