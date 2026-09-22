import React from 'react';
import { Activity, FileText, Heart, TestTube, XCircle, Zap } from 'lucide-react';
import { User } from '../../../types';
import { LabPanelItem, LabResult } from '../types';

interface LabResultsModalProps {
  patients: User[];
  selectedPatient: User | null;
  onSelectPatient: (patient: User | null) => void;
  labResults: LabResult[];
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal': return 'text-green-600 bg-green-50';
    case 'high': return 'text-red-600 bg-red-50';
    case 'low': return 'text-blue-600 bg-blue-50';
    case 'borderline': return 'text-yellow-600 bg-yellow-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const renderPanel = (title: string, icon: React.ReactNode, panel?: Record<string, LabPanelItem>) => {
  if (!panel) return null;
  return (
    <div className="bg-white p-4 rounded-xl border">
      <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        {icon}
        {title}
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(panel).map(([key, val]) => (
          <div
            key={key}
            className={`p-3 rounded-lg border-l-4 ${
              val.status === 'normal' ? 'border-green-500 bg-green-50' :
              val.status === 'high' ? 'border-red-500 bg-red-50' :
              val.status === 'low' ? 'border-blue-500 bg-blue-50' :
              'border-yellow-500 bg-yellow-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 uppercase">{key.replace('_', ' ')}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(val.status)}`}>
                {val.status}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-800">{val.value} {val.unit}</p>
            <p className="text-xs text-gray-500">Normal/Target: {val.normal}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LabResultsModal: React.FC<LabResultsModalProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  labResults,
  onClose
}) => {
  const patientResults = selectedPatient
    ? labResults.filter((r) => r.patient_id === selectedPatient.user_id || r.patient_name === selectedPatient.name)
    : [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold">Lab Results</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XCircle className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-4 border-b bg-gray-50 flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Select Patient:</span>
          <select
            className="p-2 border rounded-lg"
            value={selectedPatient?.user_id || ''}
            onChange={(e) => onSelectPatient(patients.find((m) => m.user_id === e.target.value) || null)}
          >
            <option value="">Choose patient</option>
            {patients.map((m) => (
              <option key={m.user_id} value={m.user_id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {selectedPatient ? (
            patientResults.length > 0 ? (
              patientResults.map((result) => (
                <div key={result.id} className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{result.patient_name}</h4>
                      <p className="text-sm text-gray-600">Test Date: {new Date(result.test_date).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Ordered by: {result.ordered_by}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">Lab Report</span>
                  </div>

                  {renderPanel('Complete Blood Count (CBC)', <Activity className="h-5 w-5 mr-2 text-red-500" />, result.results.cbc)}
                  {renderPanel('Comprehensive Metabolic Panel (CMP)', <Zap className="h-5 w-5 mr-2 text-blue-500" />, result.results.metabolic)}
                  {renderPanel('Lipid Panel', <Heart className="h-5 w-5 mr-2 text-purple-500" />, result.results.lipid)}

                  <div className="bg-gray-50 p-4 rounded-xl border">
                    <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-gray-500" />
                      Clinical Notes
                    </h5>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Overall Assessment:</strong> Most values within normal limits.
                      {result.results.metabolic?.glucose?.status === 'high' && " Slightly elevated glucose noted - recommend dietary counseling and follow-up in 3 months."}
                      {result.results.lipid?.ldl?.status === 'borderline' && " LDL cholesterol is borderline high - lifestyle modifications recommended."}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Recommendations:</strong> Continue current medications, maintain healthy diet, regular exercise.
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No Lab Results Available</h4>
                <p className="text-gray-500">No lab results found for {selectedPatient.name}.</p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">Select a Patient</h4>
              <p className="text-gray-500">Choose a patient from the dropdown above to view their lab results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabResultsModal;

