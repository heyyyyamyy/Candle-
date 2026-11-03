import React, { useState } from 'react';
import { Product, BrandingConfig } from '../types';
import { BULK_TIERS, getBulkDiscountTier, formatCurrency, STANDARD_BRANDING_SETUP_FEE, TAX_RATE, INDIVIDUAL_RECIPIENT_SHIPPING_RATE } from '../utils/pricing';
import { Box, CheckCircle2, Download, Send, Truck, Check } from 'lucide-react';

interface BulkOrderCalculatorProps {
  products: Product[];
  onAddBulkToCart: (product: Product, quantity: number, branding: BrandingConfig) => void;
}

export const BulkOrderCalculator: React.FC<BulkOrderCalculatorProps> = ({
  products,
  onAddBulkToCart,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(75);
  const [deliveryMethod, setDeliveryMethod] = useState<'single_hq' | 'individual_addresses'>('single_hq');
  const [includeCustomBranding, setIncludeCustomBranding] = useState(true);
  const [companyName, setCompanyName] = useState('Acme Technologies');
  const [quoteDownloaded, setQuoteDownloaded] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const tier = getBulkDiscountTier(quantity);
  const unitPrice = selectedProduct?.basePrice || 48;
  const rawSubtotal = unitPrice * quantity;
  const discountAmount = rawSubtotal * (tier.discountPercent / 100);
  const netSubtotal = rawSubtotal - discountAmount;
  const brandingFee = includeCustomBranding ? (tier.freeBranding ? 0 : STANDARD_BRANDING_SETUP_FEE) : 0;
  const shippingFee = deliveryMethod === 'individual_addresses' ? quantity * INDIVIDUAL_RECIPIENT_SHIPPING_RATE : (netSubtotal > 1000 ? 0 : 45);
  const tax = Math.round((netSubtotal + brandingFee) * TAX_RATE * 100) / 100;
  const total = Math.round((netSubtotal + brandingFee + shippingFee + tax) * 100) / 100;
  const effectiveUnitPrice = Math.round((total / quantity) * 100) / 100;

  const handleApplyToCart = () => {
    if (!selectedProduct) return;
    const branding: BrandingConfig = {
      companyName,
      logoText: companyName,
      engravingText: 'EST. 2026 • ANNUAL RECOGNITION',
      vesselFinish: 'amber-glass',
      lidFinish: 'bamboo',
      scentChoice: selectedProduct.fragranceNotes.split(',')[0] || 'Amber & Fig',
      giftCardMessage: `Presented with highest appreciation to our dedicated team at ${companyName}.`,
      ribbonColor: 'gold',
    };
    onAddBulkToCart(selectedProduct, quantity, branding);
  };

  const handleDownloadQuote = () => {
    setQuoteDownloaded(true);
    setTimeout(() => setQuoteDownloaded(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-stone-900">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider">
          <Box className="w-3.5 h-3.5 text-amber-700" />
          Volume Pricing Matrix
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Bulk Corporate Gifting Calculator
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
          Calculate volume discounts, laser engraving options, and direct-to-employee delivery pricing.
        </p>
      </div>

      {/* Tier Progress Visualizer */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
          Discount Tiers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {BULK_TIERS.map((t, idx) => {
            const isActive = quantity >= t.minQty && quantity <= t.maxQty;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-center transition ${
                  isActive
                    ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-300'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <div className="text-[11px] font-medium text-stone-500">{t.minQty}{t.maxQty > 1000 ? '+' : `-${t.maxQty}`} Units</div>
                <div className="text-base font-bold text-stone-900 mt-0.5">
                  {t.discountPercent > 0 ? `${t.discountPercent}% OFF` : 'Standard'}
                </div>
                <div className="text-[10px] text-amber-700 mt-1 font-semibold">
                  {t.freeBranding ? 'Free Branding' : 'Setup: $150'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Column */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 space-y-5 shadow-xs">
          {/* Select Product */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none focus:border-amber-600"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCurrency(p.basePrice)}/unit
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Slider & Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Order Quantity
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-right text-sm font-bold text-stone-900 outline-none"
                />
                <span className="text-xs text-stone-500">units</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={600}
              step={5}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-stone-400 mt-1">
              <span>1</span>
              <span>50 (18% off)</span>
              <span>200 (25% off)</span>
              <span>500+ (35% off)</span>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Company / Client Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none focus:border-amber-600"
              placeholder="e.g. Acme Corp"
            />
          </div>

          {/* Delivery Method Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Delivery Destination
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('single_hq')}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  deliveryMethod === 'single_hq'
                    ? 'bg-amber-50 border-amber-400 text-stone-900'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900'
                }`}
              >
                <Truck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">Single Corporate Office</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Bulk consolidated freight to main HQ. Free over $1,000.</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('individual_addresses')}
                className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                  deliveryMethod === 'individual_addresses'
                    ? 'bg-amber-50 border-amber-400 text-stone-900'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900'
                }`}
              >
                <Send className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">Direct to Employee Homes</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Individual doorstep drop-shipping for distributed teams.</div>
                </div>
              </button>
            </div>
          </div>

          {/* Custom Branding Checkbox */}
          <div className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl">
            <input
              type="checkbox"
              id="customBrandCheck"
              checked={includeCustomBranding}
              onChange={(e) => setIncludeCustomBranding(e.target.checked)}
              className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
            />
            <label htmlFor="customBrandCheck" className="text-xs text-stone-700 cursor-pointer flex-1">
              Include custom corporate laser engraving on lids &amp; gift cards
            </label>
            <span className="text-xs font-bold text-amber-800">
              {tier.freeBranding ? 'FREE' : '$150 setup'}
            </span>
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="border-b border-stone-100 pb-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Estimated Total
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
              {formatCurrency(total)}
            </h3>
            <div className="text-xs text-emerald-700 mt-1 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Effective Unit Cost: {formatCurrency(effectiveUnitPrice)} / unit
            </div>
          </div>

          {/* Line item breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Base Retail ({quantity} × {formatCurrency(unitPrice)}):</span>
              <span className="font-mono">{formatCurrency(rawSubtotal)}</span>
            </div>

            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Volume Discount ({tier.discountPercent}% off):</span>
              <span className="font-mono">-{formatCurrency(discountAmount)}</span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Net Subtotal:</span>
              <span className="font-mono">{formatCurrency(netSubtotal)}</span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Laser Engraving Branding:</span>
              <span className="font-mono">
                {brandingFee === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE ($0.00)</span>
                ) : (
                  formatCurrency(brandingFee)
                )}
              </span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Shipping &amp; Logistics:</span>
              <span className="font-mono">
                {shippingFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : formatCurrency(shippingFee)}
              </span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Estimated Sales Tax (8.25%):</span>
              <span className="font-mono">{formatCurrency(tax)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 space-y-2.5">
            <button
              onClick={handleApplyToCart}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              <Box className="w-4 h-4" />
              Add {quantity} Units to Cart
            </button>

            <button
              onClick={handleDownloadQuote}
              className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              {quoteDownloaded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Estimate Saved</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-stone-500" />
                  <span>Download Formal Estimate PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
