import React, { useState } from 'react';
import { ShoppingCart, XCircle } from 'lucide-react';

interface TelepharmacyModalProps {
  onClose: () => void;
}

const categories = ['all', 'prescription', 'otc', 'vitamins', 'supplements', 'first-aid'];

const availableMedications = [
  {
    id: '1',
    name: 'Lisinopril 10mg',
    category: 'prescription',
    price: 25.99,
    description: 'Blood pressure medication',
    requires_rx: true
  },
  {
    id: '2',
    name: 'Ibuprofen 200mg',
    category: 'otc',
    price: 8.99,
    description: 'Pain relief and anti-inflammatory',
    requires_rx: false
  },
  {
    id: '3',
    name: 'Multivitamin Complex',
    category: 'vitamins',
    price: 15.99,
    description: 'Daily essential vitamins',
    requires_rx: false
  },
  {
    id: '4',
    name: 'Omega-3 Fish Oil',
    category: 'supplements',
    price: 22.99,
    description: 'Heart and brain health support',
    requires_rx: false
  },
  {
    id: '5',
    name: 'First Aid Kit',
    category: 'first-aid',
    price: 35.99,
    description: 'Complete emergency first aid kit',
    requires_rx: false
  }
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
    alert(
      `Order placed successfully! ${cart.length} items will be delivered within 2-3 business days.`
    );
    setCart([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white/95 to-green-50/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Telepharmacy</h3>
                <p className="text-gray-600">Order medications and health products online</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Search medications..."
                className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredMedications.map((medication) => (
              <div
                key={medication.id}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-green-100"
              >
                <div className="mb-4">
                  <h4 className="font-bold text-gray-800 text-lg">{medication.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{medication.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">${medication.price}</span>
                    {medication.requires_rx && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                        Prescription Required
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => addToCart(medication)}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 font-semibold shadow-lg"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200 mb-6">
              <h4 className="font-bold text-gray-800 mb-4">Your Cart ({cart.length} items)</h4>
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white/60 p-3 rounded-xl"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="font-bold text-green-600">${item.price}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-green-200">
                <span className="text-xl font-bold">
                  Total: ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                </span>
                <button
                  onClick={placeOrder}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 font-semibold shadow-lg"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TelepharmacyModal;

