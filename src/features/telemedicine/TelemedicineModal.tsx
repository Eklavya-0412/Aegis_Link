import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { AlertTriangle, CheckCircle2, RotateCcw, Stethoscope, Video } from 'lucide-react';
import { Appointment, User } from '../../types';
import Modal from '../../components/common/Modal';
import { Field } from '../../components/ui';
import { useToastStore } from '../../store/toastStore';

interface TelemedicineModalProps {
  onClose: () => void;
  selectedMember: User | null;
  appointments: Appointment[];
  setAppointments: Dispatch<SetStateAction<Appointment[]>>;
}

const VISIT_TYPES = [
  { key: 'consultation', label: 'New consultation', icon: Stethoscope },
  { key: 'followup', label: 'Follow-up', icon: RotateCcw },
  { key: 'emergency', label: 'Urgent care', icon: AlertTriangle }
] as const;

const specialties = ['General Medicine', 'Cardiology', 'Dermatology', 'Psychiatry', 'Pediatrics', 'Gynecology', 'Orthopedics', 'Neurology'];

const TelemedicineModal: React.FC<TelemedicineModalProps> = ({ onClose, selectedMember, appointments, setAppointments }) => {
  const [appointmentType, setAppointmentType] = useState<'consultation' | 'followup' | 'emergency'>('consultation');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [symptoms, setSymptoms] = useState('');

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
    useToastStore.getState().showToast('Video consultation booked.', 'success');
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Book a video consultation"
      description={`For ${selectedMember?.name || 'this member'}`}
      icon={Video}
      maxWidth="max-w-xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleBooking} disabled={!selectedSpecialty || !preferredDate || !symptoms.trim()} className="btn btn-primary">
            Book consultation
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {appointmentType === 'emergency' && (
          <div className="callout callout-danger">
            <AlertTriangle aria-hidden />
            <p>If symptoms are severe or life-threatening, call your local emergency number instead of booking online.</p>
          </div>
        )}

        <fieldset>
          <legend className="label">Visit type</legend>
          <div className="grid grid-cols-3 gap-2">
            {VISIT_TYPES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setAppointmentType(key)}
                aria-pressed={appointmentType === key}
                className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-13 font-medium transition-colors ${
                  appointmentType === key
                    ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-200'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Specialty" htmlFor="tm-specialty" required>
            <select id="tm-specialty" className="select" value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)}>
              <option value="">Select a specialty</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Preferred date & time" htmlFor="tm-date" required>
            <input
              id="tm-date"
              type="datetime-local"
              className="input tabular-nums"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </Field>
        </div>

        <Field label="Symptoms & reason for visit" htmlFor="tm-symptoms" required helper="Shared with the consulting clinician.">
          <textarea
            id="tm-symptoms"
            className="textarea"
            rows={4}
            placeholder="Describe your symptoms and when they started…"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </Field>

        <ul className="grid grid-cols-1 gap-2 text-13 text-slate-600 dark:text-slate-400 sm:grid-cols-2">
          {['Video consultation with a licensed clinician', 'Digital prescription to your pharmacy', 'Follow-up care and monitoring', 'Linked to your health record'].map(
            (f) => (
              <li key={f} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                {f}
              </li>
            )
          )}
        </ul>
      </div>
    </Modal>
  );
};

export default TelemedicineModal;
