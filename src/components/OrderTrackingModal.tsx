import React, { useState } from 'react';
import { Order } from '../types';
import { generateTrackingCheckpoints } from '../utils/tracking';
import { Truck, CheckCircle2, Clock, Search, MapPin, Package, Building2, Users } from 'lucide-react';

interface OrderTrackingModalProps {
  orders: Order[];
  activeOrder?: Order | null;
  onSelectOrder?: (order: Order) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  orders,
  activeOrder,
  onSelectOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const currentOrder = activeOrder || orders[0];

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Truck className="w-3.5 h-3.5" />
          Carrier Logistics &amp; Live Telemetry
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100">
          Real-Time Corporate Order Tracking
        </h2>
        <p className="text-sm text-stone-400 max-w-xl mx-auto">
          Monitor your corporate batch through precision laser engraving, curing, white-glove packaging, and carrier dispatch.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, Tracking Code, or Company..."
            className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-10 pr-4 py-3 text-xs text-stone-200 outline-none focus:border-amber-500 shadow-lg"
          />
        </div>
      </div>

      {/* Main Order Tracking Card */}
      {currentOrder ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Order Banner */}
          <div className="bg-stone-950 p-6 sm:p-8 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {currentOrder.id}
                </span>
                <span className="text-stone-500">•</span>
                <span className="text-xs text-stone-300 font-medium">
                  {currentOrder.companyName}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
                {currentOrder.totalUnits} Units Corporate Gifting Package
              </h3>
              <p className="text-xs text-stone-400 flex items-center gap-1.5 pt-1">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Carrier: {currentOrder.courier}</span>
                <span className="text-stone-500">|</span>
                <span className="font-mono text-stone-300">Tracking #{currentOrder.trackingNumber}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-stone-400 uppercase tracking-wider block">
                Fulfillment Status
              </span>
              <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {currentOrder.orderStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="p-6 sm:p-10 space-y-8">
            <div className="relative">
              {/* Stepper Line */}
              <div className="hidden md:block absolute left-4 top-8 bottom-8 w-0.5 bg-stone-800" />

              <div className="space-y-8 relative">
                {generateTrackingCheckpoints(currentOrder).map((cp, idx) => (
                  <div key={idx} className="flex items-start gap-4 sm:gap-6">
                    {/* Step Icon */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                        cp.completed
                          ? 'bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-950/40'
                          : cp.current
                          ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-500/20 shadow-lg'
                          : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {cp.completed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="flex-1 bg-stone-950/70 border border-stone-800/80 rounded-2xl p-4 sm:p-5 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-stone-100">{cp.title}</h4>
                        <span className="text-xs text-stone-400 font-mono">{cp.timestamp}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-amber-400/80">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{cp.location}</span>
                      </div>

                      <p className="text-xs text-stone-400 pt-1 leading-relaxed">{cp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination & Distribution Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-stone-800">
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-300 uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Destination Specs
                </div>
                <div className="text-xs text-stone-400 space-y-1">
                  <div>Attention: {currentOrder.shippingAddress.attention || 'HR Department'}</div>
                  <div>Street: {currentOrder.shippingAddress.street}</div>
                  <div>
                    {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zip}
                  </div>
                </div>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-300 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-amber-400" />
                  Employee Recipients
                </div>
                <div className="text-xs text-stone-400 space-y-1">
                  <div>Distribution Mode: {currentOrder.deliveryMethod === 'individual_addresses' ? 'Direct Employee Drop-Ship' : 'Single Corporate Office Freight'}</div>
                  <div>Recipient Count: {currentOrder.recipientCount} packages</div>
                  <div className="text-emerald-400 font-semibold">100% Thermal Insulated Transit Packaging</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center text-stone-400 space-y-3">
          <Package className="w-10 h-10 text-stone-600 mx-auto" />
          <p className="text-sm">No corporate orders found matching your search.</p>
        </div>
      )}

      {/* Recent Orders Quick Switcher */}
      {orders.length > 1 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Switch Monitored Corporate Order
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {filteredOrders.map((ord) => (
              <button
                key={ord.id}
                onClick={() => onSelectOrder && onSelectOrder(ord)}
                className={`p-3.5 rounded-xl border text-left transition ${
                  currentOrder?.id === ord.id
                    ? 'bg-amber-500/20 border-amber-400 text-stone-100'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="text-xs font-bold text-stone-200 font-mono">{ord.id}</div>
                <div className="text-[11px] text-stone-400 truncate">{ord.companyName}</div>
                <div className="text-[10px] text-amber-400 font-semibold mt-1">
                  {ord.totalUnits} units • {ord.orderStatus.replace('_', ' ')}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
