import React, { useState } from 'react';
import { FileWarning, Plus, Search, ShoppingBag } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { EmptyState } from '../../components/ui';
import { useToastStore } from '../../store/toastStore';

interface TelepharmacyModalProps {
  onClose: () => void;
}

const categories = ['all', 'prescription', 'otc', 'vitamins', 'supplements', 'first-aid'];

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All categories',
  prescription: 'Prescription',
  otc: 'Over the counter',
  vitamins: 'Vitamins',
  supplements: 'Supplements',
  'first-aid': 'First aid'
};

const availableMedications = [
  { id: '1', name: 'Lisinopril 10mg', category: 'prescription', price: 25.99, description: 'Blood pressure medication', requires_rx: true },
  { id: '2', name: 'Ibuprofen 200mg', category: 'otc', price: 8.99, description: 'Pain relief and anti-inflammatory', requires_rx: false },
  { id: '3', name: 'Multivitamin Complex', category: 'vitamins', price: 15.99, description: 'Daily essential vitamins', requires_rx: false },
  { id: '4', name: 'Omega-3 Fish Oil', category: 'supplements', price: 22.99, description: 'Heart and brain health support', requires_rx: false },
  { id: '5', name: 'First Aid Kit', category: 'first-aid', price: 35.99, description: 'Complete emergency first aid kit', requires_rx: false }
];

const TelepharmacyModal: React.FC<TelepharmacyModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<any[]>([]);

  const filteredMedications = availableMedications.filter((med) => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medication: any) => {
    setCart([...cart, { ...medication, quantity: 1 }]);
  };

  const placeOrder = () => {
    if (cart.length === 0) return;
    useToastStore.getState().showToast(`Order placed: ${cart.length} items, delivered within 2–3 business days.`, 'success');
    setCart([]);
    onClose();
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Telepharmacy"
      description="Order medications and health products for delivery."
      icon={ShoppingBag}
      maxWidth="max-w-3xl"
      headerExtra={
        <span className="badge badge-neutral mr-1 mt-1 tabular-nums" aria-live="polite">
          {cart.length} in cart
        </span>
      }
      footer={
        <>
          <p className="mr-auto text-sm">
            <span className="text-slate-500">Total </span>
            <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">${total.toFixed(2)}</span>
          </p>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button type="button" onClick={placeOrder} disabled={cart.length === 0} className="btn btn-primary">
            Place order
          </button>
        </>
      }
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            placeholder="Search products"
            aria-label="Search products"
            className="input pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="select sm:w-52"
          aria-label="Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>

      {filteredMedications.length === 0 ? (
        <EmptyState compact icon={Search} title="No products match your search" />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {filteredMedications.map((medication) => {
            const inCart = cart.filter((c) => c.id === medication.id).length;
            return (
              <li key={medication.id} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-13 font-medium text-slate-900 dark:text-slate-100">
                    {medication.name}
                    {medication.requires_rx && (
                      <span className="badge badge-warning">
                        <FileWarning aria-hidden />
                        Prescription required
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">{medication.description}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">${medication.price.toFixed(2)}</span>
                <button type="button" onClick={() => addToCart(medication)} className="btn btn-secondary btn-sm">
                  <Plus />
                  Add{inCart ? ` (${inCart})` : ''}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {cart.length > 0 && (
        <div className="mt-5">
          <p className="eyebrow mb-2">Cart</p>
          <ul className="space-y-1.5">
            {cart.map((item, idx) => (
              <li key={idx} className="flex justify-between text-13">
                <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                <span className="tabular-nums text-slate-900 dark:text-slate-100">${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
};

export default TelepharmacyModal;
