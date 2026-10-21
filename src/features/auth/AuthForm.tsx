import React, { useState } from 'react';
import { History, Loader2, Lock, ShieldCheck, Users } from 'lucide-react';
import { AuthFormData } from '../../services/authService';
import { BrandMark } from '../../components/layout/AppSidebar';

type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  authMode: AuthMode;
  onAuthModeChange: (mode: AuthMode) => void;
  loading: boolean;
  onSubmit: (formData: AuthFormData) => Promise<void>;
}

const HIGHLIGHTS = [
  { icon: Users, title: 'One record, four perspectives', text: 'Patients, physicians, caregivers and family each see what their role needs.' },
  { icon: ShieldCheck, title: 'Consent-gated access', text: 'Sensitive records are shared only with the people a patient approves.' },
  { icon: History, title: 'Traceable activity', text: 'Consent changes and document access are written to an activity log.' }
];

const AuthForm: React.FC<AuthFormProps> = ({ authMode, onAuthModeChange, loading, onSubmit }) => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
    role: 'patient',
    phone: '',
    age: '',
    gender: 'male',
    joinFamily: false,
    familyId: '',
    familyName: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    let err = '';
    if (field === 'email') {
      if (!value) err = 'Email address is required';
      else if (!/\S+@\S+\.\S+/.test(value)) err = 'Please enter a valid email address';
    } else if (field === 'password') {
      if (!value) err = 'Password is required';
      else if (value.length < 6) err = 'Password must be at least 6 characters';
    } else if (field === 'name' && authMode === 'signup') {
      if (!value.trim()) err = 'Full name is required';
    } else if (field === 'age' && authMode === 'signup') {
      if (!value) err = 'Age is required';
      else if (parseInt(value) <= 0 || parseInt(value) > 120) err = 'Please enter a valid age (1-120)';
    }
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    validateField('email', formData.email);
    validateField('password', formData.password);
    if (authMode === 'signup') {
      validateField('name', formData.name);
      validateField('age', formData.age);
    }
    if (errors.email || errors.password || (authMode === 'signup' && (errors.name || errors.age))) {
      return;
    }
    await onSubmit(formData);
  };

  const fieldError = (field: string) => (touched[field] && errors[field] ? errors[field] : '');

  const renderError = (field: string) =>
    fieldError(field) ? (
      <p id={`${field}-error`} className="field-error" role="alert">
        {fieldError(field)}
      </p>
    ) : null;

  return (
    <div className="flex min-h-screen bg-canvas dark:bg-slate-950">
      {/* Brand panel */}
      <aside className="relative hidden w-[44%] max-w-xl flex-col justify-between overflow-hidden bg-brand-600 p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
          aria-hidden
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight">Aegis Link</span>
        </div>
        <div className="relative">
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-white">
            Coordinated care, with the patient in control.
          </h2>
          <ul className="mt-8 space-y-5">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex gap-3.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <h.icon className="h-4 w-4 text-brand-200" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{h.title}</p>
                  <p className="text-13 leading-5 text-brand-100/80">{h.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-brand-200/70">For care coordination. Not a substitute for emergency services.</p>
      </aside>

      {/* Form */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <BrandMark />
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {authMode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {authMode === 'login' ? 'Welcome back. Enter your details to continue.' : 'Set up access for your role in the care team.'}
          </p>

          <div className="segmented mt-6 grid w-full grid-cols-2" role="tablist" aria-label="Authentication mode">
            {(['login', 'signup'] as AuthMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={authMode === mode}
                onClick={() => onAuthModeChange(mode)}
                className={`segmented-item justify-center ${authMode === mode ? 'segmented-item-active' : ''}`}
              >
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {authMode === 'signup' && (
              <>
                <div>
                  <label htmlFor="auth-name" className="label">
                    Full name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    className={`input ${fieldError('name') ? 'input-invalid' : ''}`}
                    value={formData.name}
                    aria-invalid={!!fieldError('name')}
                    aria-describedby={fieldError('name') ? 'name-error' : undefined}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (touched.name) validateField('name', e.target.value);
                    }}
                    onBlur={(e) => handleBlur('name', e.target.value)}
                    required
                  />
                  {renderError('name')}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="auth-age" className="label">
                      Age
                    </label>
                    <input
                      id="auth-age"
                      type="number"
                      inputMode="numeric"
                      className={`input tabular-nums ${fieldError('age') ? 'input-invalid' : ''}`}
                      value={formData.age}
                      aria-invalid={!!fieldError('age')}
                      aria-describedby={fieldError('age') ? 'age-error' : undefined}
                      onChange={(e) => {
                        setFormData({ ...formData, age: e.target.value });
                        if (touched.age) validateField('age', e.target.value);
                      }}
                      onBlur={(e) => handleBlur('age', e.target.value)}
                      required
                    />
                    {renderError('age')}
                  </div>
                  <div>
                    <label htmlFor="auth-gender" className="label">
                      Sex
                    </label>
                    <select
                      id="auth-gender"
                      className="select"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-role" className="label">
                    I am a…
                  </label>
                  <select
                    id="auth-role"
                    className="select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="patient">Patient</option>
                    <option value="caregiver">Professional caregiver</option>
                    <option value="doctor">Physician</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="auth-email" className="label">
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                className={`input ${fieldError('email') ? 'input-invalid' : ''}`}
                value={formData.email}
                aria-invalid={!!fieldError('email')}
                aria-describedby={fieldError('email') ? 'email-error' : undefined}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (touched.email) validateField('email', e.target.value);
                }}
                onBlur={(e) => handleBlur('email', e.target.value)}
                required
              />
              {renderError('email')}
            </div>

            <div>
              <label htmlFor="auth-password" className="label">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                className={`input ${fieldError('password') ? 'input-invalid' : ''}`}
                value={formData.password}
                aria-invalid={!!fieldError('password')}
                aria-describedby={fieldError('password') ? 'password-error' : undefined}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (touched.password) validateField('password', e.target.value);
                }}
                onBlur={(e) => handleBlur('password', e.target.value)}
                required
              />
              {renderError('password')}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  {authMode === 'login' ? 'Signing in…' : 'Creating account…'}
                </>
              ) : authMode === 'login' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="surface-muted mt-6 px-4 py-3">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Demo accounts</p>
            <p className="mt-1 font-mono text-2xs leading-5 text-slate-500">patient@demo.com · caregiver@demo.com · doctor@demo.com</p>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <Lock className="h-3 w-3" aria-hidden />
            Your session signs out automatically after inactivity.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthForm;
