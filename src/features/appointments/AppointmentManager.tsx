import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { Appointment, User } from '../../types';
import { useToastStore } from '../../store/toastStore';

interface AppointmentManagerProps {
  selectedMember: User | null;
  appointments: Appointment[];
  setAppointments: Dispatch<SetStateAction<Appointment[]>>;
}

type AppointmentType = 'doctor' | 'telemedicine' | 'lab_test';

const AppointmentManager: React.FC<AppointmentManagerProps> = ({ selectedMember, appointments, setAppointments }) => {
  const memberId = selectedMember?.user_id || '';
  const memberAppointments = appointments.filter(appointment => appointment.member_id === memberId);
  const [newAppointment, setNewAppointment] = useState({ title: '', type: 'doctor' as AppointmentType, when: '' });
  const [errors, setErrors] = useState<{ title?: string; when?: string }>({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToastStore();

  const handleBlur = (field: 'title' | 'when', val: string) => {
    if (!val.trim()) {
      setErrors((prev) => ({ ...prev, [field]: `${field === 'title' ? 'Title' : 'Date & Time'} is required` }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const addAppointment = async () => {
    if (!newAppointment.title.trim()) {
      setErrors((prev) => ({ ...prev, title: 'Title is required' }));
      return;
    }
    setLoading(true);
    try {
      const appointment: Appointment = {
        id: Date.now().toString(),
        title: newAppointment.title,
        type: newAppointment.type,
        appointment_date: newAppointment.when || new Date().toISOString(),
        member_id: memberId,
        status: 'scheduled'
      };
      setAppointments([...appointments, appointment]);
      setNewAppointment({ title: '', type: 'doctor', when: '' });
      setErrors({});
      showToast(`Appointment "${appointment.title}" booked successfully!`, 'success');
    } catch {
      showToast('Failed to book appointment. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = (id: string, title: string) => {
    setAppointments(appointments.filter(item => item.id !== id));
    showToast(`Appointment "${title}" cancelled.`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Appointments for {selectedMember?.name || 'Patient'}
        </h3>
        <div className="space-y-4">
          {memberAppointments.map(appointment => (
            <div key={appointment.id} className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-850 rounded-2xl border border-purple-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{appointment.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{appointment.type} • {new Date(appointment.appointment_date).toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 capitalize">{appointment.status}</span>
                <button
                  onClick={() => cancelAppointment(appointment.id, appointment.title)}
                  className="min-h-[44px] px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
          {memberAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No appointments scheduled for {selectedMember?.name || 'this member'}.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
        <h4 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Schedule Appointment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              className={`w-full min-h-[44px] p-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Appointment Title"
              value={newAppointment.title}
              onChange={event => setNewAppointment({ ...newAppointment, title: event.target.value })}
              onBlur={event => handleBlur('title', event.target.value)}
            />
            {errors.title && <p className="text-xs text-red-600 font-medium mt-1">{errors.title}</p>}
          </div>

          <select
            className="w-full min-h-[44px] p-4 text-base border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500"
            value={newAppointment.type}
            onChange={event => setNewAppointment({ ...newAppointment, type: event.target.value as AppointmentType })}
          >
            <option value="doctor">Doctor Visit</option>
            <option value="telemedicine">Telemedicine Consultation</option>
            <option value="lab_test">Lab Test</option>
          </select>

          <div>
            <input
              type="datetime-local"
              className={`w-full min-h-[44px] p-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-blue-500 ${errors.when ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              value={newAppointment.when}
              onChange={event => setNewAppointment({ ...newAppointment, when: event.target.value })}
              onBlur={event => handleBlur('when', event.target.value)}
            />
            {errors.when && <p className="text-xs text-red-600 font-medium mt-1">{errors.when}</p>}
          </div>
        </div>
        <button
          onClick={addAppointment}
          disabled={loading}
          className="mt-4 min-h-[48px] px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Scheduling...' : 'Book Appointment'}
        </button>
      </div>
    </div>
  );
};

export default AppointmentManager;
