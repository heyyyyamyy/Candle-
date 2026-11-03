import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartPricing, getBulkDiscountTier, BULK_TIERS } from './pricing';
import { CartItem, Product } from '../types';

const sampleCandle: Product = {
  id: 'prod-amber-noir',
  name: 'Amber & Smoked Fig Luxury Soy Candle',
  category: 'candle',
  description: 'Hand-poured coconut soy candle',
  basePrice: 48,
  stock: 2500,
  minOrderQty: 1,
  burnTimeHours: 65,
  fragranceNotes: 'Amber Resin, Smoked Fig, French Oak',
  customBrandingAvailable: true,
  brandingSetupFee: 150,
  finishOptions: ['amber-glass', 'matte-noir'],
  imageUrl: '',
};

test('getBulkDiscountTier returns correct tiers', () => {
  assert.equal(getBulkDiscountTier(5).discountPercent, 0);
  assert.equal(getBulkDiscountTier(25).discountPercent, 10);
  assert.equal(getBulkDiscountTier(100).discountPercent, 18);
  assert.equal(getBulkDiscountTier(250).discountPercent, 25);
  assert.equal(getBulkDiscountTier(250).freeBranding, true);
  assert.equal(getBulkDiscountTier(600).discountPercent, 35);
});

test('calculateCartPricing handles empty items', () => {
  const result = calculateCartPricing([]);
  assert.equal(result.totalUnits, 0);
  assert.equal(result.total, 0);
  assert.equal(result.subtotal, 0);
});

test('calculateCartPricing applies 18% tier discount and branding fee for 50 units', () => {
  const item: CartItem = {
    product: sampleCandle,
    quantity: 50,
    unitPrice: 48,
    branding: {
      companyName: 'Acme Corp',
      logoText: 'ACME',
      engravingText: 'Holiday 2026',
      vesselFinish: 'amber-glass',
      lidFinish: 'walnut',
      scentChoice: 'Amber Resin',
      giftCardMessage: 'Thank you team',
      ribbonColor: 'gold',
    },
  };

  const result = calculateCartPricing([item], false, 'single_hq', 0);
  // Subtotal = 50 * 48 = 2400
  assert.equal(result.subtotal, 2400);
  // Tier: 50 is in 50-199 => 18%
  assert.equal(result.discountPercent, 18);
  // Discount = 2400 * 0.18 = 432
  assert.equal(result.discountAmount, 432);
  // Net subtotal = 2400 - 432 = 1968
  assert.equal(result.netSubtotal, 1968);
  // Free branding is false for 50 units => 150 fee
  assert.equal(result.brandingFee, 150);
  // Freight over $1000 is free
  assert.equal(result.shippingFee, 0);
  // Taxable base = 1968 + 150 = 2118; Tax = 2118 * 0.0825 = 174.74
  assert.equal(result.taxAmount, 174.74);
  // Total = 1968 + 150 + 0 + 174.74 = 2292.74
  assert.equal(result.total, 2292.74);
});

test('calculateCartPricing waives branding fee and gives 25% discount for 200+ units', () => {
  const item: CartItem = {
    product: sampleCandle,
    quantity: 200,
    unitPrice: 48,
    branding: {
      companyName: 'Stripe Inc',
      logoText: 'STRIPE',
      engravingText: 'Annual Summit',
      vesselFinish: 'matte-noir',
      lidFinish: 'bamboo',
      scentChoice: 'Amber Resin',
      giftCardMessage: 'Celebrate together',
      ribbonColor: 'champagne',
    },
  };

  const result = calculateCartPricing([item], false, 'single_hq', 0);
  // Subtotal = 200 * 48 = 9600
  assert.equal(result.subtotal, 9600);
  assert.equal(result.discountPercent, 25);
  // 9600 * 0.25 = 2400 discount
  assert.equal(result.discountAmount, 2400);
  assert.equal(result.netSubtotal, 7200);
  // Free branding setup for Enterprise tier
  assert.equal(result.brandingFee, 0);
});

test('calculateCartPricing correctly supports tax exempt corporate orders', () => {
  const item: CartItem = {
    product: sampleCandle,
    quantity: 10,
    unitPrice: 48,
    branding: {
      companyName: 'Nonprofit Foundation',
      logoText: '',
      engravingText: '',
      vesselFinish: 'amber-glass',
      lidFinish: 'bamboo',
      scentChoice: 'Amber Resin',
      giftCardMessage: '',
      ribbonColor: 'champagne',
    },
  };

  const result = calculateCartPricing([item], true, 'single_hq', 0);
  assert.equal(result.taxAmount, 0);
});
