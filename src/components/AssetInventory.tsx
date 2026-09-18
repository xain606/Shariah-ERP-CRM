import React, { useState } from 'react';
import {
  Smartphone,
  Bike,
  Tv,
  Sun,
  Laptop,
  Search,
  Plus,
  Tag,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { ProductCategory, ProductItem } from '../types';
import { formatPKR } from '../utils/formatters';

interface AssetInventoryProps {
  products: ProductItem[];
  onAddProduct: (product: ProductItem) => void;
}

export const AssetInventory: React.FC<AssetInventoryProps> = ({ products, onAddProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Smartphones');
  const [brand, setBrand] = useState('Samsung');
  const [model, setModel] = useState('');
  const [cashPrice, setCashPrice] = useState<number>(85000);
  const [costPrice, setCostPrice] = useState<number>(75000);
  const [serialOrImei, setSerialOrImei] = useState('');
  const [secondaryImeiOrChassis, setSecondaryImeiOrChassis] = useState('');

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.serialOrImei.toLowerCase().includes(q) ||
      (p.secondaryImeiOrChassis && p.secondaryImeiOrChassis.toLowerCase().includes(q));

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProd: ProductItem = {
      id: `PROD-${Math.floor(100 + Math.random() * 900)}`,
      name,
      category,
      brand,
      model,
      cashPrice,
      costPrice,
      serialOrImei,
      secondaryImeiOrChassis: secondaryImeiOrChassis || undefined,
      status: 'In Stock',
    };

    onAddProduct(newProd);
    setShowAddModal(false);
  };

  const getCategoryIcon = (cat: ProductCategory) => {
    switch (cat) {
      case 'Smartphones':
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      case 'Motorcycles':
        return <Bike className="w-4 h-4 text-emerald-600" />;
      case 'Home Appliances':
        return <Tv className="w-4 h-4 text-amber-600" />;
      case 'Solar Energy':
        return <Sun className="w-4 h-4 text-orange-600" />;
      case 'Laptops & IT':
        return <Laptop className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            IMEI, Engine & Chassis Inventory Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track exact serial identities of collateral assets (Bikes, Smartphones with Knox locks, Inverter ACs).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by IMEI, Chassis, Brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
          >
            <option value="all">All Categories</option>
            <option value="Motorcycles">Motorcycles (Bikes)</option>
            <option value="Smartphones">Smartphones</option>
            <option value="Home Appliances">Home Appliances</option>
            <option value="Solar Energy">Solar Energy Systems</option>
            <option value="Laptops & IT">Laptops & IT</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item & Model</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">IMEI / Engine / Serial #</th>
                <th className="py-3 px-4">Secondary / Chassis #</th>
                <th className="py-3 px-4">Cash Price</th>
                <th className="py-3 px-4">Dealer Cost</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-500">
                      Brand: {p.brand} | Model: {p.model}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 font-medium text-slate-800">
                      {getCategoryIcon(p.category)}
                      <span>{p.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-800 font-semibold">
                    {p.serialOrImei}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {p.secondaryImeiOrChassis || '-'}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatPKR(p.cashPrice)}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {formatPKR(p.costPrice)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        p.status === 'In Stock'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : p.status === 'Contract Assigned'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Inventory Stock</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsung Galaxy A55 5G (8GB/256GB)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Smartphones">Smartphones</option>
                    <option value="Motorcycles">Motorcycles</option>
                    <option value="Home Appliances">Home Appliances</option>
                    <option value="Solar Energy">Solar Energy</option>
                    <option value="Laptops & IT">Laptops & IT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="Samsung / Honda / Haier"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cash Retail Price</label>
                  <input
                    type="number"
                    required
                    value={cashPrice}
                    onChange={(e) => setCashPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Wholesale Cost Price</label>
                  <input
                    type="number"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Primary IMEI (SIM 1) / Engine Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 359182049182741 or ENG-CD70-881920"
                  value={serialOrImei}
                  onChange={(e) => setSerialOrImei(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Secondary IMEI (SIM 2) / Chassis Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 359182049182742 or CHS-AHL-2026-8819"
                  value={secondaryImeiOrChassis}
                  onChange={(e) => setSecondaryImeiOrChassis(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
