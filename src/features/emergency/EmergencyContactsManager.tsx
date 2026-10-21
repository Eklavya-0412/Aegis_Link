import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { MessageSquare, Phone, PhoneCall, Plus, Siren, UserRound } from 'lucide-react';
import { EmergencyContact, Family } from '../../types';
import { Card, EmptyState, Field, PageHeader } from '../../components/ui';

interface EmergencyContactsManagerProps {
  currentFamily: Family | null;
  emergencyContacts: EmergencyContact[];
  setEmergencyContacts: Dispatch<SetStateAction<EmergencyContact[]>>;
}

const EmergencyContactsManager: React.FC<EmergencyContactsManagerProps> = ({
  currentFamily,
  emergencyContacts,
  setEmergencyContacts
}) => {
  const [showForm, setShowForm] = useState(false);
  const [contactData, setContactData] = useState({
    name: '',
    relationship: '',
    phone: '',
    priority: 'secondary' as 'primary' | 'secondary'
  });

  const addContact = () => {
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: contactData.name,
      relationship: contactData.relationship,
      phone: contactData.phone,
      priority: contactData.priority,
      family_id: currentFamily?.family_id || ''
    };

    setEmergencyContacts([...emergencyContacts, newContact]);
    setContactData({ name: '', relationship: '', phone: '', priority: 'secondary' });
    setShowForm(false);
  };

  const sorted = [...emergencyContacts].sort((a, b) => (a.priority === b.priority ? 0 : a.priority === 'primary' ? -1 : 1));

  return (
    <div className="page">
      <PageHeader
        eyebrow="Safety"
        title="Emergency contacts"
        description="People notified when an SOS is activated. Primary contacts are contacted first."
        actions={
          <button type="button" onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            <Plus />
            Add contact
          </button>
        }
      />

      <div className="callout callout-danger">
        <Siren aria-hidden />
        <p>
          <span className="font-medium">In a medical emergency, call your local emergency number first.</span> Aegis Link
          notifications supplement, but do not replace, emergency services.
        </p>
      </div>

      {showForm && (
        <Card
          title="New emergency contact"
          footer={
            <>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={addContact} disabled={!contactData.name || !contactData.phone} className="btn btn-primary">
                Save contact
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Full name" htmlFor="ec-name" required>
              <input
                id="ec-name"
                type="text"
                className="input"
                value={contactData.name}
                onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
              />
            </Field>
            <Field label="Relationship" htmlFor="ec-rel">
              <input
                id="ec-rel"
                type="text"
                className="input"
                placeholder="e.g. Daughter"
                value={contactData.relationship}
                onChange={(e) => setContactData({ ...contactData, relationship: e.target.value })}
              />
            </Field>
            <Field label="Phone number" htmlFor="ec-phone" required>
              <input
                id="ec-phone"
                type="tel"
                className="input tabular-nums"
                value={contactData.phone}
                onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
              />
            </Field>
            <Field label="Priority" htmlFor="ec-priority">
              <select
                id="ec-priority"
                className="select"
                value={contactData.priority}
                onChange={(e) => setContactData({ ...contactData, priority: e.target.value as 'primary' | 'secondary' })}
              >
                <option value="primary">Primary contact</option>
                <option value="secondary">Secondary contact</option>
              </select>
            </Field>
          </div>
        </Card>
      )}

      <Card title="Contacts" subtitle={`${emergencyContacts.length} saved`} flush>
        {sorted.length === 0 ? (
          <EmptyState icon={Phone} title="No emergency contacts yet" description="Add at least one primary contact so SOS alerts reach someone." />
        ) : (
          <ul className="divide-list">
            {sorted.map((contact) => (
              <li key={contact.id} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className={`icon-tile ${
                      contact.priority === 'primary'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    <UserRound aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                      <span className="truncate">{contact.name}</span>
                      <span className={`badge ${contact.priority === 'primary' ? 'badge-danger' : 'badge-neutral'}`}>
                        {contact.priority === 'primary' ? 'Primary' : 'Secondary'}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {contact.relationship || 'Contact'} · <span className="tabular-nums">{contact.phone}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pl-12 sm:pl-0">
                  <a href={`tel:${contact.phone}`} className="btn btn-secondary btn-sm">
                    <PhoneCall />
                    Call
                  </a>
                  <a href={`sms:${contact.phone}`} className="btn btn-secondary btn-sm">
                    <MessageSquare />
                    Text
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default EmergencyContactsManager;
