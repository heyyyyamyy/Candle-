import React, { useState } from 'react';
import { Product, Order, OrderStatus } from '../types';
import { formatCurrency } from '../utils/pricing';
import { Shield, Box, ShoppingBag, Activity, Plus, Edit3, CheckCircle2, Download, Lock, LogOut, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';

interface AdminCMSProps {
  products: Product[];
  orders: Order[];
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onUpdateProductPrice: (productId: string, newPrice: number) => void;
  onAddNewProduct: (product: Product) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => void;
  isAdminLoggedIn: boolean;
  onAdminLogin: (email: string, pass: string) => boolean;
  onAdminLogout: () => void;
  onBackToStore: () => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  products,
  orders,
  onUpdateProductStock,
  onUpdateProductPrice,
  onAddNewProduct,
  onUpdateOrderStatus,
  isAdminLoggedIn,
  onAdminLogin,
  onAdminLogout,
  onBackToStore,
}) => {
  // Login form state
  const [loginEmail, setLoginEmail] = useState('cruisesufiyan2@gmail.com');
  const [loginPasscode, setLoginPasscode] = useState('admin2026');
  const [loginError, setLoginError] = useState('');

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'analytics'>('inventory');

  // Quick edit stock state
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);

  // New product form modal state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'candle' | 'hamper' | 'bundle'>('candle');
  const [newPrice, setNewPrice] = useState(52);
  const [newStock, setNewStock] = useState(1000);
  const [newFragrance, setNewFragrance] = useState('Smoked Cedar & Bourbon Vanilla');
  const [newDesc, setNewDesc] = useState('');

  // Analytics metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const totalUnitsSold = orders.reduce((sum, o) => sum + o.totalUnits, 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const corporateClientCount = new Set(orders.map((o) => o.companyName)).size;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = onAdminLogin(loginEmail, loginPasscode);
    if (!success) {
      setLoginError('Invalid administrator credentials. Please check your passcode.');
    }
  };

  const handleQuickDemoLogin = () => {
    onAdminLogin('cruisesufiyan2@gmail.com', 'admin2026');
  };

  const handleSaveStock = (productId: string) => {
    onUpdateProductStock(productId, tempStockValue);
    setEditingStockId(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `prod-${Date.now().toString(36)}`;
    const newProduct: Product = {
      id,
      name: newName,
      category: newCategory,
      description: newDesc || `${newCategory === 'candle' ? 'Artisan soy candle' : 'Curated corporate hamper'} featuring ${newFragrance}.`,
      basePrice: newPrice,
      stock: newStock,
      minOrderQty: newCategory === 'candle' ? 1 : 5,
      burnTimeHours: newCategory === 'candle' ? 65 : undefined,
      fragranceNotes: newFragrance,
      customBrandingAvailable: true,
      brandingSetupFee: 150,
      finishOptions: ['amber-glass', 'matte-noir', 'rose-copper'],
      imageUrl: newCategory === 'candle'
        ? 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    };
    onAddNewProduct(newProduct);
    setIsAddProductOpen(false);
    setNewName('');
    setNewDesc('');
  };

  const handleExportCSV = () => {
    const csvContent =
      'Order ID,Company,Total Units,Total Paid,Status,Tracking,Created At\n' +
      orders
        .map(
          (o) =>
            `"${o.id}","${o.companyName}",${o.totalUnits},${o.total},"${o.orderStatus}","${o.trackingNumber}","${o.createdAt}"`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `Corporate_Orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 1. SEPARATE ADMIN LOGIN SCREEN
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 text-stone-900">
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Admin Portal Login
            </h2>
            <p className="text-xs text-stone-500">
              Restricted management console for inventory and corporate orders.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-600 font-medium mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-medium mb-1">
                Security Passcode
              </label>
              <input
                type="password"
                required
                value={loginPasscode}
                onChange={(e) => setLoginPasscode(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 outline-none focus:border-amber-600 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In to Admin Dashboard</span>
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs transition"
            >
              One-Click Demo Admin Login
            </button>

            <button
              type="button"
              onClick={onBackToStore}
              className="text-center text-xs text-stone-500 hover:text-stone-800 transition pt-1 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-stone-900">
      {/* Top Admin Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Shield className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Admin Management Console
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Logged in as <span className="font-semibold text-stone-700">{loginEmail}</span>
          </p>
        </div>

        {/* Sub-navigation tabs & Logout */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-stone-100 border border-stone-200 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-amber-700" />
              Inventory CMS
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
              Orders ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-700" />
              Analytics
            </button>
          </div>

          <button
            onClick={onBackToStore}
            className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-medium transition"
          >
            View Store
          </button>

          <button
            onClick={onAdminLogout}
            className="px-3 py-1.5 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-600 rounded-xl text-xs font-medium transition flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INVENTORY CMS */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Product Catalog &amp; Live Stock Levels
            </h3>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </button>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Base Price</th>
                    <th className="py-3 px-4">Inventory Stock</th>
                    <th className="py-3 px-4">Custom Branding</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-stone-100" />
                        <div>
                          <div className="font-bold text-stone-900">{p.name}</div>
                          <div className="text-[10px] text-stone-500">{p.fragranceNotes}</div>
                        </div>
                      </td>

                      <td className="py-3 px-4 capitalize">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-medium">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        {formatCurrency(p.basePrice)}
                      </td>

                      <td className="py-3 px-4">
                        {editingStockId === p.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={tempStockValue}
                              onChange={(e) => setTempStockValue(parseInt(e.target.value) || 0)}
                              className="w-20 bg-stone-50 border border-amber-500 rounded px-2 py-0.5 text-xs text-stone-900 outline-none"
                            />
                            <button
                              onClick={() => handleSaveStock(p.id)}
                              className="p-1 text-emerald-700 hover:text-emerald-800"
                              title="Save"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${p.stock < 500 ? 'text-amber-700' : 'text-stone-900'}`}>
                              {p.stock.toLocaleString()} units
                            </span>
                            <button
                              onClick={() => {
                                setEditingStockId(p.id);
                                setTempStockValue(p.stock);
                              }}
                              className="text-stone-400 hover:text-amber-700"
                              title="Edit Stock"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Supported
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            const newPriceInput = prompt(`Update Base Price for ${p.name}:`, p.basePrice.toString());
                            if (newPriceInput) {
                              const parsed = parseFloat(newPriceInput);
                              if (!isNaN(parsed) && parsed > 0) {
                                onUpdateProductPrice(p.id, parsed);
                              }
                            }
                          }}
                          className="text-stone-700 hover:text-amber-800 text-xs font-medium px-2 py-1 rounded bg-stone-100 hover:bg-stone-200"
                        >
                          Edit Price
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CORPORATE ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Corporate Orders &amp; Fulfillment Pipeline
            </h3>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              Export Orders CSV
            </button>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Order ID &amp; Client</th>
                    <th className="py-3 px-4">Units</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Tracking Code</th>
                    <th className="py-3 px-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-amber-800">{o.id}</div>
                        <div className="text-stone-900 font-semibold">{o.companyName}</div>
                        <div className="text-[10px] text-stone-500">{o.userEmail}</div>
                      </td>

                      <td className="py-3 px-4 font-bold text-stone-900">
                        {o.totalUnits} items
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        {formatCurrency(o.total)}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          o.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.orderStatus === 'dispatched'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.orderStatus.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-stone-600">
                        {o.trackingNumber || 'Pending Dispatch'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => {
                            const newStatus = e.target.value as OrderStatus;
                            onUpdateOrderStatus(o.id, newStatus);
                          }}
                          className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-800 outline-none"
                        >
                          <option value="received">Received</option>
                          <option value="branding_engraving">Branding / Engraving</option>
                          <option value="processing">Kitting</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-1 shadow-xs">
              <span className="text-xs text-stone-500 uppercase font-semibold">Total Revenue</span>
              <div className="text-2xl font-serif font-bold text-amber-800">
                {formatCurrency(totalRevenue)}
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">Processed via Stripe</span>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-1 shadow-xs">
              <span className="text-xs text-stone-500 uppercase font-semibold">Units Sold</span>
              <div className="text-2xl font-serif font-bold text-stone-900">
                {totalUnitsSold.toLocaleString()}
              </div>
              <span className="text-[11px] text-stone-500">Candles &amp; Hampers</span>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-1 shadow-xs">
              <span className="text-xs text-stone-500 uppercase font-semibold">Average Order Value</span>
              <div className="text-2xl font-serif font-bold text-stone-900">
                {formatCurrency(averageOrderValue)}
              </div>
              <span className="text-[11px] text-stone-500">Corporate Batch Average</span>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-1 shadow-xs">
              <span className="text-xs text-stone-500 uppercase font-semibold">Corporate Accounts</span>
              <div className="text-2xl font-serif font-bold text-stone-900">
                {corporateClientCount}
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">Active Enterprise Clients</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Product */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-stone-900 shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold">Add Catalog Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-600 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 outline-none focus:border-amber-600"
                  placeholder="e.g. Vanilla Bourbon & Smoked Oak Candle"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 outline-none"
                  >
                    <option value="candle">Candle</option>
                    <option value="hamper">Gift Hamper</option>
                    <option value="bundle">Employee Bundle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 1)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 1)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1">Fragrance Notes</label>
                  <input
                    type="text"
                    required
                    value={newFragrance}
                    onChange={(e) => setNewFragrance(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
