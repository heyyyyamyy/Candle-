import { BulkDiscountTier, CartItem } from '../types';

export const BULK_TIERS: BulkDiscountTier[] = [
  { minQty: 1, maxQty: 9, discountPercent: 0, label: 'Standard Retail (1-9 units)', freeBranding: false },
  { minQty: 10, maxQty: 49, discountPercent: 10, label: 'Team Tier (10-49 units)', freeBranding: false },
  { minQty: 50, maxQty: 199, discountPercent: 18, label: 'Department Tier (50-199 units)', freeBranding: false },
  { minQty: 200, maxQty: 499, discountPercent: 25, label: 'Enterprise Tier (200-499 units)', freeBranding: true },
  { minQty: 500, maxQty: 100000, discountPercent: 35, label: 'Global Corp Tier (500+ units)', freeBranding: true },
];

export const STANDARD_BRANDING_SETUP_FEE = 150;
export const TAX_RATE = 0.0825; // 8.25%
export const INDIVIDUAL_RECIPIENT_SHIPPING_RATE = 5.5; // per employee direct drop-ship

export function getBulkDiscountTier(totalUnits: number): BulkDiscountTier {
  const found = BULK_TIERS.find(tier => totalUnits >= tier.minQty && totalUnits <= tier.maxQty);
  return found || BULK_TIERS[0];
}

export interface PricingCalculationResult {
  totalUnits: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  netSubtotal: number;
  brandingFee: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
  effectivePricePerUnit: number;
}

export function calculateCartPricing(
  items: CartItem[],
  isTaxExempt: boolean = false,
  deliveryMethod: 'single_hq' | 'individual_addresses' | 'recipient_portal' = 'single_hq',
  recipientCount: number = 0
): PricingCalculationResult {
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  if (totalUnits === 0) {
    return {
      totalUnits: 0,
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      netSubtotal: 0,
      brandingFee: 0,
      shippingFee: 0,
      taxAmount: 0,
      total: 0,
      effectivePricePerUnit: 0,
    };
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tier = getBulkDiscountTier(totalUnits);
  const discountPercent = tier.discountPercent;
  const discountAmount = Math.round((subtotal * (discountPercent / 100)) * 100) / 100;
  const netSubtotal = Math.max(0, subtotal - discountAmount);

  const hasCustomBranding = items.some(
    item => (item.branding.logoText || item.branding.engravingText) && item.product.customBrandingAvailable
  );

  let brandingFee = 0;
  if (hasCustomBranding) {
    brandingFee = tier.freeBranding ? 0 : STANDARD_BRANDING_SETUP_FEE;
  }

  let shippingFee = 0;
  if (deliveryMethod === 'individual_addresses' || deliveryMethod === 'recipient_portal') {
    const count = recipientCount > 0 ? recipientCount : totalUnits;
    shippingFee = count * INDIVIDUAL_RECIPIENT_SHIPPING_RATE;
  } else {
    // Bulk freight to Single HQ: Free if order > $1000, else $45
    shippingFee = netSubtotal > 1000 ? 0 : 45;
  }

  const taxableBase = netSubtotal + brandingFee;
  const taxAmount = isTaxExempt ? 0 : Math.round(taxableBase * TAX_RATE * 100) / 100;
  const total = Math.round((netSubtotal + brandingFee + shippingFee + taxAmount) * 100) / 100;
  const effectivePricePerUnit = totalUnits > 0 ? Math.round((total / totalUnits) * 100) / 100 : 0;

  return {
    totalUnits,
    subtotal: Math.round(subtotal * 100) / 100,
    discountPercent,
    discountAmount,
    netSubtotal: Math.round(netSubtotal * 100) / 100,
    brandingFee,
    shippingFee: Math.round(shippingFee * 100) / 100,
    taxAmount,
    total,
    effectivePricePerUnit,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}
