import { Family, User } from '../types';

export interface AuthFormData {
  email: string;
  password: string;
  name: string;
  role: string;
  phone: string;
  age: string;
  gender: string;
  joinFamily: boolean;
  familyId: string;
  familyName: string;
}

export interface AuthResult {
  user: User;
  family: Family | null;
}

export const authenticate = async (
  formData: AuthFormData,
  _isLogin: boolean
): Promise<AuthResult> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  let family: Family | null = null;
  const user: User = {
    user_id: `USER_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    role: formData.role as User['role'],
    name: formData.name || 'Demo User',
    email: formData.email,
    phone: formData.phone,
    age: parseInt(formData.age) || 25,
    gender: formData.gender as 'male' | 'female',
    family_id: '',
    access_token: `token_${Math.random().toString(36).substr(2, 16)}`,
    points: 0,
    patient_id: undefined,
    code: undefined
  };

  if (user.role === 'patient' || user.role === 'family_member') {
    if (formData.joinFamily && formData.familyId) {
      family = {
        family_id: formData.familyId,
        family_name: 'Sample Family',
        members: [],
        created_at: new Date().toISOString()
      };
    } else {
      family = {
        family_id: `FAMILY_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        family_name: formData.familyName || `${formData.name}'s Family`,
        members: [],
        created_at: new Date().toISOString()
      };
    }
    user.family_id = family.family_id;
  } else if (user.role === 'caregiver' || user.role === 'doctor') {
    family = {
      family_id: `DEMO_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      family_name: 'Demo Family',
      members: [],
      created_at: new Date().toISOString()
    };
  }

  if (family) {
    const makeMember = (overrides: Partial<User>): User => ({
      user_id: `USER_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      role: 'patient',
      name: 'Demo Patient',
      email: `${Math.random().toString(36).slice(2, 7)}@demo.com`,
      age: 30,
      gender: 'male',
      family_id: family!.family_id,
      access_token: 'token_demo',
      patient_id: `PID-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      ...overrides
    });

    const demoMembers: User[] = [];

    if (user.role === 'patient' || user.role === 'family_member') {
      demoMembers.push(makeMember({ name: 'Alex Johnson', gender: 'male', age: 35 }));
      demoMembers.push(makeMember({ name: 'Priya Sharma', gender: 'female', age: 32 }));
    }

    if (user.role === 'caregiver' || user.role === 'doctor') {
      demoMembers.push(makeMember({ name: 'John Doe', gender: 'male', age: 54 }));
      demoMembers.push(makeMember({ name: 'Jane Doe', gender: 'female', age: 49 }));
      demoMembers.push(makeMember({ name: 'Samir Khan', gender: 'male', age: 27 }));
    }

    if (user.role === 'patient') {
      user.patient_id = `PID-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
    family.members = [user, ...demoMembers];
  }

  return { user, family };
};
