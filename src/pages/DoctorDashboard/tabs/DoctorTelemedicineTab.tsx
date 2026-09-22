import React from 'react';
import { Appointment } from '../../../types';

interface DoctorTelemedicineTabProps {
  appointments: Appointment[];
  onNewVisit: () => void;
}

export const DoctorTelemedicineTab: React.FC<DoctorTelemedicineTabProps> = ({
  appointments,
  onNewVisit
}) => {
  const teleAppointments = appointments.filter((a) => a.type === 'telemedicine');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Telemedicine</h3>
        <button
          onClick={onNewVisit}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
        >
          New Telemedicine Visit
        </button>
      </div>
      <div className="bg-white/80 p-6 rounded-2xl border">
        <h4 className="font-bold mb-4">Scheduled Telemedicine</h4>
        <div className="space-y-2">
          {teleAppointments.map((a) => (
            <div key={a.id} className="p-3 bg-gray-50 rounded-xl border flex items-center justify-between">
              <div>
                <p className="font-semibold">{a.title}</p>
                <p className="text-xs text-gray-600">
                  {new Date(a.appointment_date).toLocaleString()} • {a.doctor_name}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                {a.status}
              </span>
            </div>
          ))}
          {teleAppointments.length === 0 && (
            <p className="text-sm text-gray-500">No telemedicine visits scheduled</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorTelemedicineTab;

