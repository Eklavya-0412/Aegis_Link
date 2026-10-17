import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  Check,
  ChevronDown,
  Copy,
  Maximize2,
  Minimize2,
  Pill,
  Send,
  Sparkles,
  Trash2,
  User as UserIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Family, Medication, User, Vital, Appointment } from '../../types';
import { apiClient } from '../../services/apiClient';

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
}

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
    content: `Hello ${activePerson?.name || 'there'}! 👋 I am your **Aegis AI Health Assistant**.\n\nI have loaded your health records (active medications: **${activeMemberMeds.length}**, recent vitals: **${activeMemberVitals.length}**). I can analyze trends, explain prescriptions, provide evidence-based dietary recommendations, or guide you through clinical care plans.\n\nHow can I help you today?`,
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
    { label: '🩺 Analyze Recent Vitals', prompt: 'Can you analyze my recent blood pressure and vitals trends and let me know if everything looks safe?' },
    { label: '💊 Check My Medications', prompt: 'Please review my active medication regimen and summarize dosages and adherence precautions.' },
    { label: '🥗 Nutrition & Diet Plan', prompt: 'What dietary and nutritional guidelines should I follow based on my current health profile?' },
    { label: '🚨 Emergency Triage Help', prompt: 'What are the red flag symptoms for cardiovascular and metabolic emergencies?' },
    ...(activePerson?.gender === 'female'
      ? [{ label: '🌸 Reproductive Health Tracking', prompt: 'Explain how my menstrual and reproductive data is kept strictly confidential in Aegis Link.' }]
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
      const readings = activeMemberVitals.map((v) => `• **${v.type.toUpperCase()}**: ${v.value} ${v.unit} (${new Date(v.recorded_at).toLocaleDateString()})`).join('\n');
      return `### 🩺 Vitals Clinical Summary for ${name}\n\n${readings || 'No recent vitals logged yet.'}\n\n**Guidelines:**\n• Systolic BP < 120 mmHg & Diastolic < 80 mmHg are considered ideal.\n• A systolic reading consistently above 130 mmHg warrants dietary sodium reduction and clinical consultation.\n• Keep logging your vitals regularly at consistent times of day!`;
    }

    if (q.includes('medication') || q.includes('pill') || q.includes('dose') || q.includes('drug') || q.includes('aspirin')) {
      const medList = activeMemberMeds.map((m) => `• **${m.name}** — ${m.dosage} (${m.frequency}) ${m.taken_today ? '✅ Taken today' : '⏳ Due'}`).join('\n');
      return `### 💊 Current Medication Overview for ${name}\n\n${medList || 'No medications registered in active schedule.'}\n\n**Safety Reminders:**\n• Take prescribed medications with a full glass of water.\n• Do not alter dosage without consulting your assigned doctor or caretaker.\n• Both Caretakers and Doctors can adjust dosages in the portal, creating immutable audit trail records.`;
    }

    if (q.includes('diet') || q.includes('nutrition') || q.includes('food')) {
      return `### 🥗 Clinical Dietary Recommendations for ${name}\n\n• **Sodium Control**: Restrict daily sodium to under 2,000 mg to assist blood pressure management.\n• **DASH Protocol**: Incorporate more leafy greens, berries, whole oats, and lean proteins.\n• **Hydration**: Aim for 2.0 to 2.5 liters of clean water daily unless restricted by renal/cardiac guidelines.`;
    }

    if (q.includes('menstrual') || q.includes('cycle') || q.includes('reproductive')) {
      return `### 🌸 Privacy & Menstrual Tracking Guarantee\n\nIn compliance with patient confidentiality standards, your reproductive health tracking module is **strictly private**. It is never visible to family members or caretakers, and even authorized physicians require explicit consent to access historical cycle logs.`;
    }

    return `I received your inquiry regarding "${userQuery}". Based on ${name}'s current health records (${activeMemberMeds.length} active medications, ${activeMemberVitals.length} vitals recorded), your profile is actively monitored. Please feel free to ask about vitals analysis, medication side effects, appointment prep, or dietary guidelines!`;
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
        isEmergency
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
        isEmergency: fallbackReply.includes('🚨')
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([initialGreeting]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-blue-200/60 dark:border-gray-700/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'w-[92vw] sm:w-[680px] h-[85vh] max-h-[850px]'
                : 'w-[92vw] sm:w-[440px] h-[580px]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base leading-tight tracking-wide">Aegis AI Assistant</h3>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-400/30 text-emerald-100 rounded-full border border-emerald-300/40">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Focus: <span className="font-semibold underline">{activePerson?.name}</span> ({currentUser?.role})
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={handleClearChat}
                  title="Clear conversation"
                  className="p-2 hover:bg-white/15 rounded-xl transition text-white/80 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Restore window size' : 'Expand window'}
                  className="p-2 hover:bg-white/15 rounded-xl transition text-white/80 hover:text-white"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowChatbot(false)}
                  title="Close assistant"
                  className="p-2 hover:bg-white/15 rounded-xl transition text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Context Summary Strip */}
            <div className="bg-gradient-to-r from-blue-50/80 via-emerald-50/80 to-indigo-50/80 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-800/80 px-4 py-2 border-b border-blue-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 truncate">
                <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span>Vitals: <b>{activeMemberVitals.length} records</b></span>
                <span className="text-gray-400">•</span>
                <Pill className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Meds: <b>{activeMemberMeds.length} active</b></span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-600">
                HIPAA / Consent Guarded
              </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm scroll-smooth">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-start gap-2 max-w-[88%]">
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`relative group p-3.5 rounded-2xl shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                          : msg.isEmergency
                          ? 'bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 rounded-tl-none'
                          : 'bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>

                      {/* Message Actions */}
                      <div className="mt-1 flex items-center justify-between text-[10px] opacity-70 group-hover:opacity-100 transition pt-1 gap-4">
                        <span>{msg.timestamp}</span>
                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="flex items-center gap-1 hover:text-blue-500 transition"
                            title="Copy reply"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-sm">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-gray-500 text-xs italic pl-9">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  <span>Aegis Assistant is synthesizing medical guidance…</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Action Chips */}
            <div className="px-3 py-2 bg-gray-50/90 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800 overflow-x-auto flex gap-1.5 scrollbar-none">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.prompt)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white dark:bg-gray-700/80 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 transition shadow-xs whitespace-nowrap flex-shrink-0 active:scale-95 disabled:opacity-50"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200/80 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={`Ask anything about ${activePerson?.name}'s health, vitals, meds...`}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || loading}
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white p-3 rounded-2xl disabled:opacity-40 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-1.5">
                AI health companion. In critical situations, contact emergency services directly.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        onClick={() => setShowChatbot(!showChatbot)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative group bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-center border-2 border-white/40"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
        </span>
        <Bot className="h-7 w-7 text-white" />
      </motion.button>
    </div>
  );
};

export default Chatbot;
