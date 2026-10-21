import React from 'react';
import { ArrowRight, BellRing, FolderLock, HeartHandshake, History, ShieldCheck, Stethoscope, User, Users } from 'lucide-react';
import { BrandMark } from '../../components/layout/AppSidebar';

interface LandingPageProps {
  onGetStarted: () => void;
}

const ROLES = [
  { icon: User, title: 'Patients', text: 'Vital signs, prescriptions, appointments and who can see your record.' },
  { icon: Stethoscope, title: 'Physicians', text: 'Trends, flagged readings, prescriptions and treatment plans in one view.' },
  { icon: HeartHandshake, title: 'Professional caregivers', text: 'Assigned patients, care tasks, observations and escalations.' },
  { icon: Users, title: 'Family', text: 'Shared updates and care activity — limited to what the patient allows.' }
];

const PILLARS = [
  { icon: BellRing, title: 'Real-time alerts', text: 'Readings outside alert limits notify the care team as they arrive.' },
  { icon: ShieldCheck, title: 'Consent-gated access', text: 'Patients grant and revoke access by category, with optional expiry.' },
  { icon: FolderLock, title: 'Encrypted medical vault', text: 'Documents are encrypted on the server with AES-256-GCM.' },
  { icon: History, title: 'Activity log', text: 'Consent changes and document access are recorded for review.' }
];

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-canvas dark:bg-slate-950">
      <header className="border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandMark />
          <button type="button" onClick={onGetStarted} className="btn btn-secondary btn-sm">
            Sign in
          </button>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <div className="max-w-3xl">
            <p className="badge badge-brand mb-5">Care coordination platform</p>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
              Everyone caring for a patient, working from the same record.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Aegis Link connects patients, physicians, professional caregivers and family around live vital signs, prescriptions
              and care activity — with access the patient controls.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={onGetStarted} className="btn btn-primary btn-lg px-5">
                Get started
                <ArrowRight />
              </button>
              <button type="button" onClick={onGetStarted} className="btn btn-secondary btn-lg px-5">
                Sign in
              </button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r) => (
              <div key={r.title} className="card p-5">
                <span className="icon-tile bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <r.icon aria-hidden />
                </span>
                <h2 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{r.title}</h2>
                <p className="mt-1 text-13 leading-5 text-slate-500 dark:text-slate-400">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <div key={p.title} className="flex gap-3">
                <p.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-brand-400" aria-hidden />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{p.title}</h3>
                  <p className="mt-1 text-13 leading-5 text-slate-500 dark:text-slate-400">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500 sm:px-6">
          Aegis Link supports care coordination and does not replace emergency services or professional medical judgement.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
