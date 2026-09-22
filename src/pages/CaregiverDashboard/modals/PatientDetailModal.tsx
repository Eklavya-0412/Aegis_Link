import React from 'react';
import { XCircle } from 'lucide-react';
import { Appointment, Medication, User, Vital } from '../../../types';

interface PatientDetailModalProps {
  patient: User;
  medications: Medication[];
  appointments: Appointment[];
  vitals: Vital[];
  onClose: () => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  medications,
  appointments,
  vitals,
  onClose
}) => {
  const patientMeds = medications.filter((m) => m.member_id === patient.user_id);
  const patientAppts = appointments.filter((a) => a.member_id === patient.user_id);
  const patientVitals = vitals.filter((v) => v.member_id === patient.user_id).slice(0, 6);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{patient.name} • Details</h3>
            <p className="text-sm text-gray-600">Age {patient.age} • {patient.gender}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XCircle className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border">
              <p className="text-xs text-gray-600">Patient ID</p>
              <p className="font-mono font-bold text-blue-700">{patient.patient_id || 'N/A'}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border">
              <p className="text-xs text-gray-600">Medications</p>
              <p className="font-bold text-emerald-700">{patientMeds.length}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border">
              <p className="text-xs text-gray-600">Appointments</p>
              <p className="font-bold text-purple-700">{patientAppts.length}</p>
            </div>
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white/70 p-4 rounded-xl border">
              <h4 className="font-bold mb-3">Recent Vitals</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {patientVitals.map((v) => (
                  <div key={v.id} className="p-3 bg-gray-50 rounded-xl border">
                    <p className="font-semibold text-gray-800">{v.type.toUpperCase()} • {v.value} {v.unit}</p>
                    <p className="text-xs text-gray-500">{new Date(v.recorded_at).toLocaleString()}</p>
                  </div>
                ))}
                {patientVitals.length === 0 && (
                  <p className="text-sm text-gray-500">No vitals available</p>
                )}
              </div>
            </div>
            <div className="bg-white/70 p-4 rounded-xl border">
              <h4 className="font-bold mb-3">Medications</h4>
              <div className="space-y-2">
                {patientMeds.map((m) => (
                  <div key={m.id} className="p-3 bg-gray-50 rounded-xl border flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{m.name}</p>
                      <p className="text-xs text-gray-600">{m.dosage} • {m.frequency}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${m.taken_today ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {m.taken_today ? 'Taken' : 'Due'}
                    </span>
                  </div>
                ))}
                {patientMeds.length === 0 && (
                  <p className="text-sm text-gray-500">No medications</p>
                )}
              </div>
            </div>
            <div className="bg-white/70 p-4 rounded-xl border">
              <h4 className="font-bold mb-3">Appointments</h4>
              <div className="space-y-2">
                {patientAppts.map((a) => (
                  <div key={a.id} className="p-3 bg-gray-50 rounded-xl border">
                    <p className="font-semibold text-gray-800">{a.title}</p>
                    <p className="text-xs text-gray-600">{new Date(a.appointment_date).toLocaleString()} • {a.type}</p>
                  </div>
                ))}
                {patientAppts.length === 0 && (
                  <p className="text-sm text-gray-500">No appointments</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailModal;

