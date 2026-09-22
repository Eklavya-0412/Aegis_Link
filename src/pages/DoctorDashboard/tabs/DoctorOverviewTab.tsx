import React from 'react';
import { Appointment, Medication, User, Vital } from '../../../types';
import LineChart from '../../../components/charts/LineChart';
import DonutChart from '../../../components/charts/DonutChart';

interface DoctorOverviewTabProps {
  patients: User[];
  selectedPatient: User | null;
  vitals: Vital[];
  medications: Medication[];
  appointments: Appointment[];
  onOpenTelemedicine: () => void;
  onOpenLabResults: () => void;
  onOpenPrescription: () => void;
}

export const DoctorOverviewTab: React.FC<DoctorOverviewTabProps> = ({
  patients,
  selectedPatient,
  vitals,
  medications,
  appointments,
  onOpenTelemedicine,
  onOpenLabResults,
  onOpenPrescription
}) => {
  const activePatientId = selectedPatient?.user_id || patients[0]?.user_id;

  const bpSeries = vitals.filter((v) => v.member_id === activePatientId && v.type === 'bp').slice(-12);
  const bpData = bpSeries.map((v) => parseInt(v.value.split('/')[0]) || 0);
  const bpLabels = bpSeries.map((v) => new Date(v.recorded_at).toLocaleDateString());

  const medsCount = medications.filter((m) => m.member_id === activePatientId).length;
  const apptCount = appointments.filter((a) => a.member_id === activePatientId).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-gradient-to-br from-white/90 to-blue-50/50 p-8 rounded-2xl shadow-xl border border-blue-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Patient Overview</h3>
          <div className="space-y-6">
            <div className="bg-white/80 p-6 rounded-2xl border">
              <h4 className="font-bold mb-3">Selected Patient Vitals Trend</h4>
              <LineChart
                data={bpData.length ? bpData : [115, 116, 118, 119]}
                labels={bpLabels.length ? bpLabels : ['Mon', 'Tue', 'Wed', 'Thu']}
                color="#3b82f6"
                title="Systolic BP"
              />
            </div>
            <div className="bg-white/80 p-6 rounded-2xl border">
              <DonutChart
                values={[medsCount, apptCount]}
                labels={['Meds', 'Appts']}
                colors={['#06b6d4', '#8b5cf6']}
                title="Meds vs Appointments"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white/80 p-6 rounded-2xl border">
          <h4 className="font-bold mb-3">Quick Actions</h4>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={onOpenTelemedicine}
              className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium"
            >
              Schedule Virtual Visit
            </button>
            <button
              onClick={onOpenLabResults}
              className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition-colors font-medium"
            >
              Review Lab Results
            </button>
            <button
              onClick={onOpenPrescription}
              className="w-full bg-purple-500 text-white py-3 rounded-xl hover:bg-purple-600 transition-colors font-medium"
            >
              Send Prescriptions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorOverviewTab;

