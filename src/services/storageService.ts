import { Family, User } from '../types';

const USER_STORAGE_KEY = 'aegis_user';
const FAMILY_STORAGE_KEY = 'aegis_family';

const readJson = <T>(key: string): T | null => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) as T : null;
};

export const getStoredUser = (): User | null => readJson<User>(USER_STORAGE_KEY);

export const getStoredFamily = (): Family | null => readJson<Family>(FAMILY_STORAGE_KEY);

export const saveSession = (user: User, family: Family | null): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(family));
};

export const saveUser = (user: User): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearSession = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(FAMILY_STORAGE_KEY);
};
