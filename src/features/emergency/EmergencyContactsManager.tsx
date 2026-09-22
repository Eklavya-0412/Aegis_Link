import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { Phone, Plus } from 'lucide-react';
import { EmergencyContact, Family } from '../../types';

interface EmergencyContactsManagerProps {
  currentFamily: Family | null;
  emergencyContacts: EmergencyContact[];
  setEmergencyContacts: Dispatch<SetStateAction<EmergencyContact[]>>;
}

const EmergencyContactsManager: React.FC<EmergencyContactsManagerProps> = ({
  currentFamily,
  emergencyContacts,
  setEmergencyContacts
}) => {
  const [showForm, setShowForm] = useState(false);
  const [contactData, setContactData] = useState({
    name: '',
    relationship: '',
    phone: '',
    priority: 'secondary' as 'primary' | 'secondary'
  });

  const addContact = () => {
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: contactData.name,
      relationship: contactData.relationship,
      phone: contactData.phone,
      priority: contactData.priority,
      family_id: currentFamily?.family_id || ''
    };

    setEmergencyContacts([...emergencyContacts, newContact]);
    setContactData({ name: '', relationship: '', phone: '', priority: 'secondary' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <Phone className="h-6 w-6 mr-2 text-red-600" />
          Emergency Contacts
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-lg"
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Add Contact
        </button>
      </div>

      {showForm && (
        <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl border border-red-200">
          <h4 className="font-bold text-gray-800 mb-4">Add Emergency Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={contactData.name}
              onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Relationship"
              className="p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={contactData.relationship}
              onChange={(e) => setContactData({ ...contactData, relationship: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={contactData.phone}
              onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
            />
            <select
              className="p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={contactData.priority}
              onChange={(e) =>
                setContactData({ ...contactData, priority: e.target.value as 'primary' | 'secondary' })
              }
            >
              <option value="primary">Primary Contact</option>
              <option value="secondary">Secondary Contact</option>
            </select>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={addContact}
              disabled={!contactData.name || !contactData.phone}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 font-medium"
            >
              Add Contact
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {emergencyContacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-gradient-to-br from-white/90 to-red-50/50 p-6 rounded-2xl shadow-xl border border-red-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    contact.priority === 'primary'
                      ? 'bg-gradient-to-br from-red-500 to-pink-500'
                      : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  }`}
                >
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{contact.name}</h4>
                  <p className="text-sm text-gray-600">{contact.relationship}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  contact.priority === 'primary'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {contact.priority}
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-white/60 p-3 rounded-xl">
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="font-bold text-gray-800">{contact.phone}</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                  className="flex-1 bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition-colors font-medium"
                >
                  Call
                </button>
                <button
                  onClick={() => window.open(`sms:${contact.phone}`, '_self')}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition-colors font-medium"
                >
                  Text
                </button>
              </div>
            </div>
          </div>
        ))}

        {emergencyContacts.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-lg font-medium">No emergency contacts added yet</p>
            <p className="text-sm">Add contacts for emergency situations</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyContactsManager;

