import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { Medication, User } from '../../types';

interface MedicationManagerProps {
  selectedMember: User | null;
  medications: Medication[];
  setMedications: Dispatch<SetStateAction<Medication[]>>;
}

const MedicationManager: React.FC<MedicationManagerProps> = ({ selectedMember, medications, setMedications }) => {
  const memberId = selectedMember?.user_id || '';
  const memberMedications = medications.filter(medication => medication.member_id === memberId);
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: 'once daily', time: '08:00' });

  const addMedication = () => {
    const medication: Medication = {
      id: Date.now().toString(),
      name: newMedication.name || 'New Medication',
      dosage: newMedication.dosage || '10mg',
      frequency: newMedication.frequency,
      times: [newMedication.time],
      start_date: new Date().toISOString().slice(0, 10),
      active: true,
      taken_today: false,
      member_id: memberId
    };
    setMedications([...medications, medication]);
    setNewMedication({ name: '', dosage: '', frequency: 'once daily', time: '08:00' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 p-6 rounded-2xl border">
        <h3 className="text-xl font-bold mb-4">Medications for {selectedMember?.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberMedications.map(medication => (
            <div key={medication.id} className="relative p-[1px] rounded-2xl overflow-hidden group">
              <div className="absolute -inset-[1px] bg-gradient-to-br from-blue-400 via-indigo-300 to-emerald-400 opacity-60 blur-md group-hover:opacity-90 transition" />
              <div className="relative p-4 bg-white/80 rounded-2xl border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">{medication.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${medication.taken_today ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {medication.taken_today ? 'Taken' : 'Due'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{medication.dosage} • {medication.frequency}</p>
                <p className="text-sm text-gray-600">Times: {medication.times.join(', ')}</p>
                <div className="flex space-x-2 mt-3">
                  <button onClick={() => setMedications(medications.map(item => item.id === medication.id ? { ...item, taken_today: true } : item))} className="flex-1 bg-green-500 text-white py-2 rounded-xl">
                    Mark Taken
                  </button>
                  <button onClick={() => setMedications(medications.filter(item => item.id !== medication.id))} className="flex-1 bg-red-500 text-white py-2 rounded-xl">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/80 p-6 rounded-2xl border">
        <h4 className="font-bold mb-3">Add Medication</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="p-3 border rounded-xl" placeholder="Name" value={newMedication.name} onChange={event => setNewMedication({ ...newMedication, name: event.target.value })} />
          <input className="p-3 border rounded-xl" placeholder="Dosage" value={newMedication.dosage} onChange={event => setNewMedication({ ...newMedication, dosage: event.target.value })} />
          <select className="p-3 border rounded-xl" value={newMedication.frequency} onChange={event => setNewMedication({ ...newMedication, frequency: event.target.value })}>
            <option>once daily</option>
            <option>twice daily</option>
            <option>thrice daily</option>
          </select>
          <input type="time" className="p-3 border rounded-xl" value={newMedication.time} onChange={event => setNewMedication({ ...newMedication, time: event.target.value })} />
        </div>
        <button onClick={addMedication} className="mt-3 bg-blue-500 text-white px-6 py-3 rounded-xl">Add</button>
      </div>
    </div>
  );
};

export default MedicationManager;
