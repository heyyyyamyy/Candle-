import { Order, OrderStatus, TrackingCheckpoint } from '../types';

export function generateTrackingCheckpoints(order: Order): TrackingCheckpoint[] {
  const baseTime = new Date(order.createdAt).getTime();
  const hour = 3600 * 1000;

  const milestones = [
    {
      title: 'Order Received & Specifications Confirmed',
      location: 'Corporate Studio HQ, Portland OR',
      desc: `Corporate gifting order #${order.id.slice(0, 8)} confirmed with ${order.totalUnits} items.`,
      statusMin: 'received' as OrderStatus,
      offsetHours: 1,
    },
    {
      title: 'Custom Laser Engraving & Foil Stamping',
      location: 'Artisanal Workshop Lab 3, Portland OR',
      desc: order.items[0]?.branding?.companyName
        ? `Branding applied: "${order.items[0].branding.companyName}" laser etched on lid & vessel.`
        : 'Vessels prepared with artisanal batch labels.',
      statusMin: 'branding_engraving' as OrderStatus,
      offsetHours: 18,
    },
    {
      title: 'Hand-Poured Soy Curing & White-Glove Kitting',
      location: 'Fulfillment & Fragrance Facility',
      desc: '100% natural botanical wax cured and nestled in eco-crinkle gift packaging.',
      statusMin: 'processing' as OrderStatus,
      offsetHours: 36,
    },
    {
      title: `Handed to Carrier (${order.courier || 'FedEx Priority'})`,
      location: 'Regional Logistics Center',
      desc: `Tracking #${order.trackingNumber || 'FX-9821849021'}. Dispatched for corporate distribution.`,
      statusMin: 'dispatched' as OrderStatus,
      offsetHours: 54,
    },
    {
      title: order.deliveryMethod === 'individual_addresses'
        ? `Delivered to ${order.recipientCount || order.totalUnits} Employee Addresses`
        : 'Delivered & Signed at Corporate Headquarters',
      location: order.shippingAddress.city ? `${order.shippingAddress.city}, ${order.shippingAddress.state}` : 'Corporate Office',
      desc: 'All packages safely delivered with climate-controlled protective packaging.',
      statusMin: 'delivered' as OrderStatus,
      offsetHours: 96,
    },
  ];

  const statusHierarchy: OrderStatus[] = [
    'received',
    'branding_engraving',
    'processing',
    'dispatched',
    'delivered',
  ];

  const currentIdx = statusHierarchy.indexOf(order.orderStatus);

  return milestones.map((m, idx) => {
    const isCompleted = currentIdx >= idx;
    const isCurrent = currentIdx === idx;
    const time = new Date(baseTime + m.offsetHours * hour).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      title: m.title,
      location: m.location,
      timestamp: isCompleted || isCurrent ? time : 'Estimated',
      completed: isCompleted,
      current: isCurrent,
      description: m.desc,
    };
  });
}
