import React, { useState } from 'react';
import { CartItem, Order, UserProfile } from '../types';
import { calculateCartPricing, formatCurrency } from '../utils/pricing';
import { X, Lock, CreditCard, CheckCircle2, ShieldCheck, Download, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  isTaxExempt: boolean;
  deliveryMethod: 'single_hq' | 'individual_addresses';
  currentUser: UserProfile;
  onOrderSuccess: (order: Order) => void;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  isTaxExempt,
  deliveryMethod,
  currentUser,
  onOrderSuccess,
}) => {
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('921');
  const [cardName, setCardName] = useState(currentUser.displayName || 'Corporate Officer');
  const [companyName, setCompanyName] = useState(currentUser.companyName || 'Corporate Client Inc');
  const [poNumber, setPoNumber] = useState('PO-2026-8819');
  const [taxId, setTaxId] = useState(isTaxExempt ? 'US-EIN-948190281' : '');

  // Shipping fields
  const [street, setStreet] = useState('100 Innovation Way, Suite 400');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('94105');
  const [attention, setAttention] = useState('People Operations / Employee Recognition Team');

  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const pricing = calculateCartPricing(items, isTaxExempt, deliveryMethod);

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    setTimeout(() => {
      // Simulate successful Stripe PaymentIntent confirmation
      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;
      const trackingCode = `FX-${Math.floor(Math.random() * 899999999 + 100000000)}`;

      const newOrder: Order = {
        id: orderId,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        companyName,
        items,
        totalUnits: pricing.totalUnits,
        subtotal: pricing.subtotal,
        discountRate: pricing.discountPercent,
        discountAmount: pricing.discountAmount,
        brandingFee: pricing.brandingFee,
        tax: pricing.taxAmount,
        total: pricing.total,
        paymentStatus: 'paid',
        stripePaymentIntentId: `pi_${Date.now()}_secret_${Math.random().toString(36).substring(2, 9)}`,
        orderStatus: 'received',
        trackingNumber: trackingCode,
        courier: 'FedEx Corporate Priority Express',
        deliveryMethod,
        shippingAddress: {
          attention,
          street,
          city,
          state,
          zip,
          country: 'United States',
        },
        recipientCount: deliveryMethod === 'individual_addresses' ? pricing.totalUnits : 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setConfirmedOrder(newOrder);
      setStep('success');
      onOrderSuccess(newOrder);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#d97706', '#b45309', '#059669'],
        });
      } catch (err) {
        // ignore
      }
    }, 1600);
  };

  const handleDownloadInvoice = () => {
    if (!confirmedOrder) return;
    const invoiceContent = `
LUMINA & OAK | CORPORATE BESPOKE GIFTING
=========================================
INVOICE / RECEIPT
Order ID: ${confirmedOrder.id}
Stripe Payment Reference: ${confirmedOrder.stripePaymentIntentId}
Date: ${new Date(confirmedOrder.createdAt).toLocaleDateString()}
Status: PAID (Processed via Stripe Enterprise)

BILL TO:
Company: ${confirmedOrder.companyName}
Contact: ${confirmedOrder.userEmail}
PO Number: ${poNumber}
${taxId ? `Tax ID / EIN: ${taxId}` : ''}

DELIVERY DESTINATION:
${confirmedOrder.shippingAddress.attention || ''}
${confirmedOrder.shippingAddress.street}
${confirmedOrder.shippingAddress.city}, ${confirmedOrder.shippingAddress.state} ${confirmedOrder.shippingAddress.zip}
Delivery Mode: ${confirmedOrder.deliveryMethod === 'individual_addresses' ? 'Direct Employee Drop-Ship' : 'Single Corporate HQ'}
Courier Tracking: ${confirmedOrder.courier} (${confirmedOrder.trackingNumber})

ORDER BREAKDOWN:
-----------------------------------------
${confirmedOrder.items
  .map(
    (item) =>
      `• ${item.product.name} (Qty: ${item.quantity}) - ${formatCurrency(item.unitPrice * item.quantity)}
   Branding: ${item.branding.companyName || 'Standard'} | Finish: ${item.branding.vesselFinish} | Scent: ${item.branding.scentChoice}`
  )
  .join('\n')}

Subtotal: ${formatCurrency(confirmedOrder.subtotal)}
Volume Discount (${confirmedOrder.discountRate}% off): -${formatCurrency(confirmedOrder.discountAmount)}
Custom Branding Setup: ${confirmedOrder.brandingFee === 0 ? 'FREE ($0.00)' : formatCurrency(confirmedOrder.brandingFee)}
Sales Tax: ${formatCurrency(confirmedOrder.tax)}
TOTAL AMOUNT CHARGED: ${formatCurrency(confirmedOrder.total)}
=========================================
Thank you for choosing Lumina & Oak.
`.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${confirmedOrder.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto text-stone-900">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Stripe Secure Checkout
              </h3>
              <p className="text-[11px] text-stone-500">
                PCI-DSS Level 1 Encrypted Payment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State 1: Payment Form */}
        {step === 'payment' && (
          <form onSubmit={handleSubmitPayment} className="p-6 space-y-5">
            {/* Order Brief Bar */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 block">Total Due</span>
                <span className="text-2xl font-bold text-amber-700">
                  {formatCurrency(pricing.total)}
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="text-stone-800 font-semibold block">
                  {pricing.totalUnits} Units Order
                </span>
                <span className="text-emerald-700 text-[11px] font-medium">
                  {pricing.discountPercent > 0 ? `${pricing.discountPercent}% Volume Discount` : 'Standard Pricing'}
                </span>
              </div>
            </div>

            {/* Corporate Entity Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Billing &amp; Procurement Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">PO Number (Optional)</label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none focus:border-amber-600"
                    placeholder="e.g. PO-2026-9901"
                  />
                </div>

                {isTaxExempt && (
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-stone-600 mb-1">Tax-Exempt Certificate ID / EIN</label>
                    <input
                      type="text"
                      required
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none focus:border-amber-600"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Stripe Card Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Payment Method
                </h4>
                <div className="flex gap-1.5 text-stone-400 text-xs font-medium">
                  <span>Visa</span> • <span>Mastercard</span> • <span>Amex</span>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-3 py-2 text-xs text-stone-900 font-mono outline-none focus:border-amber-600"
                    />
                    <CreditCard className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] text-stone-600 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">CVC</label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Delivery Address
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-stone-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">ZIP</label>
                    <input
                      type="text"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Pay {formatCurrency(pricing.total)}</span>
            </button>
          </form>
        )}

        {/* State 2: Processing Spinner */}
        {step === 'processing' && (
          <div className="py-20 px-6 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto" />
            <h4 className="font-serif text-lg font-bold text-stone-900">
              Processing Payment...
            </h4>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Connecting securely to Stripe API and confirming order.
            </p>
          </div>
        )}

        {/* State 3: Confirmed Success */}
        {step === 'success' && confirmedOrder && (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
                Order Confirmed
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                Order #{confirmedOrder.id}
              </h3>
              <p className="text-xs text-stone-500">
                Receipt and tracking details sent to {confirmedOrder.userEmail}.
              </p>
            </div>

            {/* Summary */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Carrier:</span>
                <span className="text-stone-800 font-semibold">{confirmedOrder.courier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tracking Code:</span>
                <span className="font-mono text-amber-700 font-bold">{confirmedOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Stripe Payment Ref:</span>
                <span className="font-mono text-stone-600">{confirmedOrder.stripePaymentIntentId}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={handleDownloadInvoice}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-stone-600" />
                Download Receipt (TXT)
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Done</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
