import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { AuthFormData } from '../../services/authService';

type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  authMode: AuthMode;
  onAuthModeChange: (mode: AuthMode) => void;
  loading: boolean;
  onSubmit: (formData: AuthFormData) => Promise<void>;
}

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-yellow-50/20 to-blue-50/40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-green-100/20 backdrop-blur-3xl" />
      <div className="relative bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-blue-100/50 w-full max-w-lg transform transition-all duration-500 hover:shadow-3xl">
        <div className="text-center mb-8">
          <div className="relative">
            <Shield className="h-16 w-16 text-blue-500 mx-auto mb-4 drop-shadow-lg animate-pulse" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">Aegis Link</h1>
          <p className="text-gray-600 font-medium">Family Health Management</p>
        </div>

        <div className="flex mb-6 bg-blue-50/50 rounded-2xl p-1">
          <button onClick={() => onAuthModeChange('login')} className={`flex-1 py-3 text-center rounded-xl transition-all duration-300 font-medium ${authMode === 'login' ? 'bg-blue-500 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:text-blue-600'}`}>
            Login
          </button>
          <button onClick={() => onAuthModeChange('signup')} className={`flex-1 py-3 text-center rounded-xl transition-all duration-300 font-medium ${authMode === 'signup' ? 'bg-blue-500 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:text-blue-600'}`}>
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {authMode === 'signup' && (
            <>
              <input type="text" placeholder="Full Name" className="w-full p-4 border-2 border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm" value={formData.name} onChange={event => setFormData({ ...formData, name: event.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Age" className="p-4 border-2 border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm" value={formData.age} onChange={event => setFormData({ ...formData, age: event.target.value })} required />
                <select className="p-4 border-2 border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm" value={formData.gender} onChange={event => setFormData({ ...formData, gender: event.target.value })}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <select className="w-full p-4 border-2 border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm" value={formData.role} onChange={event => setFormData({ ...formData, role: event.target.value })}>
                <option value="patient">Patient</option>
                <option value="caregiver">Caregiver</option>
                <option value="doctor">Doctor</option>
              </select>
              <input type="tel" placeholder="Phone Number (Optional)" className="w-full p-4 border-2 border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm" value={formData.phone} onChange={event => setFormData({ ...formData, phone: event.target.value })} />
              {(formData.role === 'patient' || formData.role === 'family_member') && (
                <div className="bg-green-50/50 p-4 rounded-xl">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-500 rounded" checked={formData.joinFamily} onChange={event => setFormData({ ...formData, joinFamily: event.target.checked })} />
                    <span className="text-sm font-medium text-gray-700">Join existing family</span>
                  </label>
                  {formData.joinFamily ? (
                    <input type="text" placeholder="Family ID" className="w-full mt-3 p-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm" value={formData.familyId} onChange={event => setFormData({ ...formData, familyId: event.target.value })} required={formData.joinFamily} />
                  ) : (
                    <input type="text" placeholder="Family Name" className="w-full mt-3 p-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm" value={formData.familyName} onChange={event => setFormData({ ...formData, familyName: event.target.value })} />
                  )}
                </div>
              )}
            </>
          )}
          <input type="email" placeholder="Email" className="w-full p-4 border-2 border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm" value={formData.email} onChange={event => setFormData({ ...formData, email: event.target.value })} required />
          <input type="password" placeholder="Password" className="w-full p-4 border-2 border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm" value={formData.password} onChange={event => setFormData({ ...formData, password: event.target.value })} required />
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-4 rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-300 disabled:opacity-50 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
            {loading ? (
              <div className="flex items-center justify-center space-x-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Please wait...</span></div>
            ) : authMode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600 bg-blue-50/30 p-4 rounded-xl">
          <p className="mb-2 font-medium">Demo Access:</p>
          <p>Use any email/password to explore the family health system</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
