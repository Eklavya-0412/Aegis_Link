import {
  Appointment,
  EmergencyContact,
  Family,
  HealthGoal,
  Medication,
  MenstrualData,
  User,
  Vital,
  WellnessChallenge
} from '../types';

export interface SampleData {
  medications: Medication[];
  appointments: Appointment[];
  vitals: Vital[];
  emergencyContacts: EmergencyContact[];
  healthGoals: HealthGoal[];
  wellnessChallenges: WellnessChallenge[];
  menstrualData: MenstrualData[];
}

export const initializeSampleData = (user: User, family: Family | null): SampleData => {
  const familyId = family?.family_id || '';
  const members = family?.members && family.members.length ? family.members : [user];

  const medications: Medication[] = [];
  const appointments: Appointment[] = [];
  const vitals: Vital[] = [];
  const healthGoals: HealthGoal[] = [];
  const familyProgress: { [key: string]: number } = {};
  const menstrualData: MenstrualData[] = [];

  const days = Array.from({ length: 12 }).map((_, index) =>
    new Date(Date.now() - (11 - index) * 864e5)
  );

  members.forEach((member, index) => {
    medications.push({
      id: `${member.user_id}-m1`,
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'once daily',
      times: ['08:00'],
      start_date: '2024-01-01',
      active: true,
      taken_today: index % 2 === 0,
      member_id: member.user_id
    });
    medications.push({
      id: `${member.user_id}-m2`,
      name: 'Vitamin D3',
      dosage: '1000IU',
      frequency: 'once daily',
      times: ['09:00'],
      start_date: '2024-03-01',
      active: true,
      taken_today: true,
      member_id: member.user_id
    });

    appointments.push({
      id: `${member.user_id}-a1`,
      title: 'General Checkup',
      type: 'doctor',
      doctor_name: 'Dr. Samarth Pandey',
      appointment_date: '2025-09-20T11:00:00',
      location: 'Health Center',
      notes: 'Annual exam',
      member_id: member.user_id,
      status: 'scheduled'
    });

    days.forEach((date, dayIndex) => {
      const systolic = 110 + index * 4 + Math.round(Math.sin(dayIndex / 2) * 6) + Math.round(Math.random() * 3);
      const diastolic = 75 + Math.round(Math.cos(dayIndex / 2) * 4);
      vitals.push({
        id: `${member.user_id}-bp-${dayIndex}`,
        type: 'bp',
        value: `${systolic}/${diastolic}`,
        unit: 'mmHg',
        recorded_at: date.toISOString(),
        member_id: member.user_id
      });
    });
    days.forEach((date, dayIndex) => {
      const weight = 70 + index * 2 + Math.round(Math.sin(dayIndex / 3) * 1);
      vitals.push({
        id: `${member.user_id}-wt-${dayIndex}`,
        type: 'weight',
        value: `${weight}`,
        unit: 'kg',
        recorded_at: date.toISOString(),
        member_id: member.user_id
      });
    });

    healthGoals.push(
      { id: `${member.user_id}-g1`, title: 'Daily Steps', target_value: 10000, current_value: 6000 + index * 1000, unit: 'steps', deadline: '2025-12-31', member_id: member.user_id, completed: false },
      { id: `${member.user_id}-g2`, title: 'Weight Goal', target_value: 68, current_value: 70 + index, unit: 'kg', deadline: '2025-11-30', member_id: member.user_id, completed: false },
      { id: `${member.user_id}-g3`, title: 'Blood Pressure Control', target_value: 120, current_value: 128 + index * 2, unit: 'mmHg (systolic)', deadline: '2025-10-31', member_id: member.user_id, completed: false },
      { id: `${member.user_id}-g4`, title: 'Daily Water Intake', target_value: 8, current_value: 5 + (index % 3), unit: 'glasses', deadline: '2025-09-30', member_id: member.user_id, completed: false },
      { id: `${member.user_id}-g5`, title: 'Sleep Duration', target_value: 8, current_value: 6 + (index % 2), unit: 'hours/night', deadline: '2025-10-15', member_id: member.user_id, completed: false }
    );

    if (member.gender === 'female') {
      const cycleLength = 28 + (index % 3) - 1;
      const startDates = [0, 1, 2].map(offset => new Date(Date.now() - (offset * cycleLength) * 864e5));
      startDates.forEach((date, cycleIndex) => {
        const cycleStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 2)
          .toISOString()
          .slice(0, 10);
        menstrualData.push({
          id: `${member.user_id}-mc-${cycleIndex}`,
          cycle_start: cycleStart,
          cycle_length: cycleLength,
          symptoms: cycleIndex === 0 ? ['Cramps', 'Fatigue'] : cycleIndex === 1 ? ['Headache'] : ['Mood swings', 'Bloating'],
          flow_intensity: cycleIndex === 0 ? 'medium' : cycleIndex === 1 ? 'light' : 'heavy',
          member_id: member.user_id
        });
      });
    }

    familyProgress[member.user_id] = 60 + index * 10;
  });

  const emergencyContacts: EmergencyContact[] = [
    { id: '1', name: 'Emergency Services', relationship: 'Emergency', phone: '911', priority: 'primary', family_id: familyId }
  ];
  const wellnessChallenges: WellnessChallenge[] = [
    { id: '1', name: 'Daily Steps Challenge', description: 'Walk 10,000 steps every day', progress: 72, points: 250, family_progress: familyProgress, participants: members.map(member => member.user_id) },
    { id: '2', name: 'Medication Adherence', description: 'Take all medications on time', progress: 88, points: 400, family_progress: familyProgress, participants: members.map(member => member.user_id) }
  ];

  return {
    medications,
    appointments,
    vitals,
    emergencyContacts,
    healthGoals,
    wellnessChallenges,
    menstrualData
  };
};
