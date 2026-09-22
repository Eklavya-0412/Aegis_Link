import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { AlertTriangle, CheckCircle, Stethoscope, Video, XCircle } from 'lucide-react';
import { Appointment, User } from '../../types';

interface TelemedicineModalProps {
  onClose: () => void;
  selectedMember: User | null;
  appointments: Appointment[];
  setAppointments: Dispatch<SetStateAction<Appointment[]>>;
}

const TelemedicineModal: React.FC<TelemedicineModalProps> = ({
  onClose,
  selectedMember,
  appointments,
  setAppointments
}) => {
  const [appointmentType, setAppointmentType] = useState<'consultation' | 'followup' | 'emergency'>(
    'consultation'
  );
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [symptoms, setSymptoms] = useState('');

  const specialties = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Psychiatry',
    'Pediatrics',
    'Gynecology',
    'Orthopedics',
    'Neurology'
  ];

  const handleBooking = () => {
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      title: `Telemedicine - ${selectedSpecialty}`,
      type: 'telemedicine',
      doctor_name: 'Dr. Virtual Care',
      appointment_date: preferredDate,
      location: 'Online Video Call',
      notes: symptoms,
      member_id: selectedMember?.user_id || '',
      status: 'scheduled'
    };

    setAppointments([...appointments, newAppointment]);
    alert('Telemedicine appointment booked successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white/95 to-blue-50/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Telemedicine Consultation</h3>
                <p className="text-gray-600">Book a virtual appointment with specialists</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <XCircle className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'consultation', label: 'New Consultation', icon: Stethoscope },
                  { key: 'followup', label: 'Follow-up', icon: CheckCircle },
                  { key: 'emergency', label: 'Urgent Care', icon: AlertTriangle }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAppointmentType(key as any)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      appointmentType === key
                        ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">{label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medical Specialty</label>
              <select
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                required
              >
                <option value="">Select Specialty</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date & Time</label>
              <input
                type="datetime-local"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms & Reason for Visit</label>
              <textarea
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                rows={4}
                placeholder="Please describe your symptoms and reason for the consultation..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                required
              />
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-2xl border border-blue-200">
              <h4 className="font-bold text-gray-800 mb-3">Consultation Features:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>HD video consultation with board-certified doctors</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Digital prescription delivery to your pharmacy</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Follow-up care and health monitoring</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Integration with your health records</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleBooking}
              disabled={!selectedSpecialty || !preferredDate || !symptoms.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-4 rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-300 disabled:opacity-50 font-semibold text-lg shadow-lg"
            >
              Book Telemedicine Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemedicineModal;

