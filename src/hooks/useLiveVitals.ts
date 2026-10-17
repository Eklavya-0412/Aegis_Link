import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { Family, Vital } from '../types';
import { useHealthDataStore } from '../store/healthDataStore';

export const useLiveVitals = (
  currentFamily: Family | null,
  setVitals: Dispatch<SetStateAction<Vital[]>>
): void => {
  const liveIntervalRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const addVital = useHealthDataStore((state) => state.addVital);

  useEffect(() => {
    if (!currentFamily) {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
      return;
    }

    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }

    liveIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      if (now - lastUpdateRef.current < 10000) return;

      const members = currentFamily.members || [];
      if (members.length === 0) return;

      const randomMember = members[Math.floor(Math.random() * members.length)];
      const systolic = 110 + Math.floor(Math.random() * 45); // can occasionally trigger server threshold
      const diastolic = 70 + Math.floor(Math.random() * 25);

      const newVital: Vital = {
        id: `live-${now}`,
        type: 'bp',
        value: `${systolic}/${diastolic}`,
        unit: 'mmHg',
        recorded_at: new Date(now).toISOString(),
        member_id: randomMember.user_id,
      };

      setVitals((previousVitals) => {
        const updated = [newVital, ...previousVitals.filter((vital) => vital.id !== newVital.id)];
        return updated.slice(0, 120);
      });

      // Submit vital to backend for server-driven anomaly evaluation
      addVital(newVital);

      lastUpdateRef.current = now;
    }, 12000);

    return () => {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
    };
  }, [currentFamily, setVitals, addVital]);
};
