export type Role = 'admin' | 'corporate' | 'employee';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  companyName: string;
  role: Role;
  mfaEnabled: boolean;
  createdAt: string;
}

export type ProductCategory = 'candle' | 'hamper' | 'bundle';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  basePrice: number;
  stock: number;
  minOrderQty: number;
  burnTimeHours?: number;
  fragranceNotes: string;
  hamperContents?: string;
  customBrandingAvailable: boolean;
  brandingSetupFee: number;
  finishOptions: string[];
  imageUrl: string;
  badge?: string;
}

export interface BrandingConfig {
  companyName: string;
  logoText: string;
  engravingText: string;
  vesselFinish: 'matte-noir' | 'amber-glass' | 'alabaster-white' | 'emerald-forest' | 'rose-copper';
  lidFinish: 'bamboo' | 'walnut' | 'brass';
  scentChoice: string;
  giftCardMessage: string;
  ribbonColor: 'champagne' | 'forest-green' | 'burgundy' | 'gold' | 'charcoal';
}

export interface CartItem {
  product: Product;
  quantity: number;
  branding: BrandingConfig;
  unitPrice: number;
}

export interface BulkDiscountTier {
  minQty: number;
  maxQty: number;
  discountPercent: number;
  label: string;
  freeBranding: boolean;
}

export type OrderStatus =
  | 'received'
  | 'processing'
  | 'branding_engraving'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface TrackingCheckpoint {
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
  description: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  companyName: string;
  items: CartItem[];
  totalUnits: number;
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  tax: number;
  brandingFee: number;
  total: number;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId: string;
  orderStatus: OrderStatus;
  trackingNumber: string;
  courier: string;
  deliveryMethod: 'single_hq' | 'individual_addresses' | 'recipient_portal';
  shippingAddress: {
    attention?: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  recipientCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  action: string;
  resource: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
  ipAddress?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'order_update' | 'inventory_alert' | 'corporate_approval' | 'security';
  read: boolean;
  createdAt: string;
  orderId?: string;
}
