import React, { useEffect, useRef, useState } from 'react';
import { Activity, AlertTriangle, Check, Copy, Maximize2, MessageSquare, Minimize2, Pill, SendHorizontal, Sparkles, Trash2, X } from 'lucide-react';
import { Family, Medication, User, Vital, Appointment } from '../../types';
import { apiClient } from '../../services/apiClient';
import { vitalLabel } from '../../constants/vitals';

interface ChatbotProps {
  currentUser: User | null;
  selectedMember: User | null;
  currentFamily: Family | null;
  medications: Medication[];
  vitals?: Vital[];
  appointments?: Appointment[];
  showChatbot: boolean;
  setShowChatbot: (show: boolean) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isEmergency?: boolean;
  /** Where an assistant reply came from: the server AI model or the built-in offline rules. */
  source?: 'ai' | 'fallback' | 'system';
}

/** Minimal formatter for the assistant's markdown-style replies (### headings, • bullets, **bold**). */
const renderInline = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );

const FormattedReply: React.FC<{ content: string }> = ({ content }) => (
  <div className="space-y-1.5">
    {content.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('### ')) {
        return (
          <p key={i} className="pt-1 text-13 font-semibold">
            {renderInline(trimmed.slice(4))}
          </p>
        );
      }
      if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
        return (
          <p key={i} className="flex gap-2 pl-1">
            <span aria-hidden className="text-slate-400">•</span>
            <span>{renderInline(trimmed.slice(2))}</span>
          </p>
        );
      }
      return <p key={i}>{renderInline(trimmed)}</p>;
    })}
  </div>
);

export const Chatbot: React.FC<ChatbotProps> = ({
  currentUser,
  selectedMember,
  currentFamily,
  medications,
  vitals = [],
  appointments = [],
  showChatbot,
  setShowChatbot
}) => {
  const activePerson = selectedMember || currentUser;
  const activeMemberMeds = medications.filter((m) => m.member_id === activePerson?.user_id);
  const activeMemberVitals = vitals.filter((v) => v.member_id === activePerson?.user_id).slice(-6);
  const activeMemberAppts = appointments.filter((a) => a.member_id === activePerson?.user_id).slice(0, 3);

  const initialGreeting: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    source: 'system',
    content: `Hello ${activePerson?.name || 'there'}. I'm the **Aegis health assistant**.\n\nI can see ${activeMemberMeds.length} active medications and ${activeMemberVitals.length} recent vital-sign readings for ${activePerson?.name || 'you'}. Ask me about trends, prescriptions, diet, or care plans.\n\nMy answers are informational and are not a diagnosis.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    { label: 'Analyze recent vitals', prompt: 'Can you analyze my recent blood pressure and vitals trends and let me know if everything looks safe?' },
    { label: 'Review my medications', prompt: 'Please review my active medication regimen and summarize dosages and adherence precautions.' },
    { label: 'Diet & nutrition', prompt: 'What dietary and nutritional guidelines should I follow based on my current health profile?' },
    { label: 'Emergency warning signs', prompt: 'What are the red flag symptoms for cardiovascular and metabolic emergencies?' },
    ...(activePerson?.gender === 'female'
      ? [{ label: 'Cycle data privacy', prompt: 'Explain how my menstrual and reproductive data is kept confidential in Aegis Link.' }]
      : [])
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const buildHealthContext = () => ({
    patient_name: activePerson?.name,
    patient_id: activePerson?.patient_id || activePerson?.user_id,
    age: activePerson?.age,
    gender: activePerson?.gender,
    role: currentUser?.role || 'patient',
    family_members_count: currentFamily?.members.length || 1,
    medications: activeMemberMeds.map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      taken_today: m.taken_today
    })),
    vitals: activeMemberVitals.map((v) => ({
      vital_type: v.type,
      value: v.value,
      unit: v.unit,
      recorded_at: v.recorded_at
    })),
    appointments: activeMemberAppts.map((a) => ({
      title: a.title,
      date: a.appointment_date,
      doctor: a.doctor_name
    }))
  });

  const generateLocalIntelligentFallback = (userQuery: string): string => {
    const q = userQuery.toLowerCase();
    const name = activePerson?.name || 'there';

    if (q.includes('chest pain') || q.includes('shortness of breath') || q.includes('emergency')) {
      return `🚨 **URGENT MEDICAL WARNING**: If you or ${name} are experiencing acute chest pain, shortness of breath, sudden numbness, or loss of consciousness, please call **emergency services (911 or local emergency line)** immediately or trigger the red **SOS button** in Aegis Link. Do not delay medical attention.`;
    }

    if (q.includes('vital') || q.includes('bp') || q.includes('pressure') || q.includes('heart') || q.includes('glucose')) {
      const readings = activeMemberVitals
        .map((v) => `• **${vitalLabel(v.type)}**: ${v.value} ${v.unit} (${new Date(v.recorded_at).toLocaleDateString()})`)
        .join('\n');
      return `### Vitals summary for ${name}\n\n${readings || 'No recent vitals logged yet.'}\n\n**General guidance:**\n• Systolic BP < 120 mmHg & Diastolic < 80 mmHg are considered ideal.\n• A systolic reading consistently above 130 mmHg warrants dietary sodium reduction and clinical consultation.\n• Keep logging your vitals regularly at consistent times of day.`;
    }

    if (q.includes('medication') || q.includes('pill') || q.includes('dose') || q.includes('drug') || q.includes('aspirin')) {
      const medList = activeMemberMeds
        .map((m) => `• **${m.name}** — ${m.dosage} (${m.frequency.replace(/_/g, ' ')}) ${m.taken_today ? '· taken today' : '· due'}`)
        .join('\n');
      return `### Current medications for ${name}\n\n${medList || 'No medications registered in active schedule.'}\n\n**Safety reminders:**\n• Take prescribed medications with a full glass of water.\n• Do not alter dosage without consulting your assigned doctor or caregiver.\n• Caregivers and physicians can adjust dosages in the portal.`;
    }

    if (q.includes('diet') || q.includes('nutrition') || q.includes('food')) {
      return `### Dietary suggestions for ${name}\n\n• **Sodium control**: Restrict daily sodium to under 2,000 mg to assist blood pressure management.\n• **DASH protocol**: Incorporate more leafy greens, berries, whole oats, and lean proteins.\n• **Hydration**: Aim for 2.0 to 2.5 liters of clean water daily unless restricted by renal/cardiac guidelines.`;
    }

    if (q.includes('menstrual') || q.includes('cycle') || q.includes('reproductive')) {
      return `### Cycle tracking privacy\n\nCycle logs are treated as sensitive data. They are hidden from caregivers in the app, and other people can only access them through the server if you grant them **Cycle tracking** consent in Consent & access.`;
    }

    return `I received your question about "${userQuery}". Based on ${name}'s current records (${activeMemberMeds.length} active medications, ${activeMemberVitals.length} vitals recorded), I can help with vitals trends, medication questions, appointment preparation, or dietary guidance.`;
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const { data } = await apiClient.post('/ai/chat', {
        message: textToSend,
        conversation_history: history,
        health_context: buildHealthContext()
      });

      const replyContent = data.reply || generateLocalIntelligentFallback(textToSend);
      const isEmergency = replyContent.includes('🚨') || replyContent.includes('EMERGENCY');

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency,
        source: data.reply ? 'ai' : 'fallback'
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('Backend AI chat request fallback:', err);
      const fallbackReply = generateLocalIntelligentFallback(textToSend);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: fallbackReply.includes('🚨'),
        source: 'fallback'
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([initialGreeting]);
  };

  const SOURCE_LABEL: Record<NonNullable<ChatMessage['source']>, string> = {
    ai: 'AI-generated · not clinician-reviewed',
    fallback: 'Automated summary (offline) · not clinician-reviewed',
    system: 'Assistant'
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3 md:bottom-5 md:right-5">
      {showChatbot && (
        <section
          aria-label="Aegis health assistant"
          className={`flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop dark:border-slate-800 dark:bg-slate-900 ${
            isExpanded
              ? 'h-[min(85vh,850px)] w-[calc(100vw-2rem)] sm:w-[680px]'
              : 'h-[min(36rem,calc(100vh-9rem))] w-[calc(100vw-2rem)] sm:w-[420px]'
          }`}
        >
          {/* Header */}
          <header className="flex items-start gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <span className="icon-tile h-8 w-8 bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
              <Sparkles aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Aegis health assistant</h2>
              <p className="truncate text-2xs text-slate-500">
                About <span className="font-medium text-slate-700 dark:text-slate-300">{activePerson?.name}</span> · informational, not medical advice
              </p>
            </div>
            <div className="-mr-1 flex items-center">
              <button type="button" onClick={handleClearChat} className="btn btn-ghost btn-icon btn-sm" aria-label="Clear conversation" title="Clear conversation">
                <Trash2 />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="btn btn-ghost btn-icon btn-sm hidden sm:inline-flex"
                aria-label={isExpanded ? 'Restore size' : 'Expand'}
                title={isExpanded ? 'Restore size' : 'Expand'}
              >
                {isExpanded ? <Minimize2 /> : <Maximize2 />}
              </button>
              <button type="button" onClick={() => setShowChatbot(false)} className="btn btn-ghost btn-icon btn-sm" aria-label="Close assistant">
                <X />
              </button>
            </div>
          </header>

          {/* Context strip */}
          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Activity className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <span className="tabular-nums">{activeMemberVitals.length}</span> recent vitals
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Pill className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <span className="tabular-nums">{activeMemberMeds.length}</span> medications
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/40 px-4 py-4 dark:bg-slate-950/30" aria-live="polite">
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <div key={msg.id} className="flex flex-col items-end">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-xl rounded-br-sm bg-brand-700 px-3 py-2 text-13 leading-5 text-white">{msg.content}</p>
                  <span className="mt-1 text-2xs tabular-nums text-slate-400">You · {msg.timestamp}</span>
                </div>
              ) : (
                <div key={msg.id} className="group max-w-[92%]">
                  <p
                    className={`mb-1 flex items-center gap-1 text-2xs font-medium ${
                      msg.isEmergency ? 'text-red-700 dark:text-red-400' : 'text-violet-700 dark:text-violet-300'
                    }`}
                  >
                    {msg.isEmergency ? <AlertTriangle className="h-3 w-3" aria-hidden /> : <Sparkles className="h-3 w-3" aria-hidden />}
                    {msg.isEmergency ? 'Urgent safety guidance' : SOURCE_LABEL[msg.source || 'system']}
                  </p>
                  <div
                    className={`rounded-xl rounded-tl-sm border px-3 py-2.5 text-13 leading-5 ${
                      msg.isEmergency
                        ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200'
                        : 'border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                    }`}
                  >
                    <FormattedReply content={msg.content} />
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-2xs text-slate-400">
                    <span className="tabular-nums">{msg.timestamp}</span>
                    {msg.source !== 'system' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 opacity-0 transition-opacity hover:text-slate-600 focus-visible:opacity-100 group-hover:opacity-100"
                        aria-label="Copy reply"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" aria-hidden /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" aria-hidden /> Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="flex items-center gap-1 pl-1" aria-label="Assistant is responding">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 120}ms` }} />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompts */}
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-t border-slate-100 px-3 py-2 dark:border-slate-800">
            {quickPrompts.map((qp) => (
              <button
                key={qp.label}
                type="button"
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={loading}
                className="h-7 shrink-0 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-800 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            className="border-t border-slate-100 p-3 dark:border-slate-800"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask about ${activePerson?.name || 'your'} vitals, medications…`}
                aria-label="Message the assistant"
                disabled={loading}
                className="input input-sm flex-1"
              />
              <button type="submit" disabled={!input.trim() || loading} className="btn btn-primary btn-icon btn-sm h-9 w-9" aria-label="Send message">
                <SendHorizontal />
              </button>
            </div>
            <p className="mt-1.5 text-center text-2xs text-slate-400">In an emergency, contact emergency services directly.</p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setShowChatbot(!showChatbot)}
        className="btn h-11 rounded-full border border-slate-200 bg-white px-4 text-slate-800 shadow-pop hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        aria-expanded={showChatbot}
        aria-label={showChatbot ? 'Close assistant' : 'Open assistant'}
      >
        {showChatbot ? <X /> : <MessageSquare className="text-brand-700 dark:text-brand-400" />}
        <span className="hidden sm:inline">{showChatbot ? 'Close' : 'Assistant'}</span>
      </button>
    </div>
  );
};

export default Chatbot;
