import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { Appointment, User } from '../../types';

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

  const addAppointment = () => {
    const appointment: Appointment = {
      id: Date.now().toString(),
      title: newAppointment.title || 'Checkup',
      type: newAppointment.type,
      appointment_date: newAppointment.when || new Date().toISOString(),
      member_id: memberId,
      status: 'scheduled'
    };
    setAppointments([...appointments, appointment]);
    setNewAppointment({ title: '', type: 'doctor', when: '' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 p-6 rounded-2xl border">
        <h3 className="text-xl font-bold mb-4">Appointments for {selectedMember?.name}</h3>
        <div className="space-y-3">
          {memberAppointments.map(appointment => (
            <div key={appointment.id} className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{appointment.title}</p>
                <p className="text-sm text-gray-600">{appointment.type} • {new Date(appointment.appointment_date).toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">{appointment.status}</span>
                <button onClick={() => setAppointments(appointments.filter(item => item.id !== appointment.id))} className="bg-red-500 text-white px-3 py-2 rounded-xl">Cancel</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/80 p-6 rounded-2xl border">
        <h4 className="font-bold mb-3">Add Appointment</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="p-3 border rounded-xl" placeholder="Title" value={newAppointment.title} onChange={event => setNewAppointment({ ...newAppointment, title: event.target.value })} />
          <select className="p-3 border rounded-xl" value={newAppointment.type} onChange={event => setNewAppointment({ ...newAppointment, type: event.target.value as AppointmentType })}>
            <option value="doctor">doctor</option>
            <option value="telemedicine">telemedicine</option>
            <option value="lab_test">lab_test</option>
          </select>
          <input type="datetime-local" className="p-3 border rounded-xl" value={newAppointment.when} onChange={event => setNewAppointment({ ...newAppointment, when: event.target.value })} />
          <button onClick={addAppointment} className="bg-blue-500 text-white px-6 py-3 rounded-xl">Add</button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManager;
