import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Family, Medication, User } from '../../types';

interface ChatbotProps {
  currentUser: User | null;
  selectedMember: User | null;
  currentFamily: Family | null;
  medications: Medication[];
  showChatbot: boolean;
  setShowChatbot: (show: boolean) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({
  currentUser,
  selectedMember,
  currentFamily,
  medications,
  showChatbot,
  setShowChatbot
}) => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: `Hi ${currentUser?.name || 'there'}! I'm your Aegis family health assistant. I can help with medications, appointments, health insights, and family coordination. How can I help today?`
    }
  ]);
  const [input, setInput] = useState('');

  const getBotResponse = (message: string) => {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('family') || lowerMsg.includes('member')) {
      return `Your family has ${currentFamily?.members.length || 0} members. You can switch between family members using the member selector to view their individual health data. Would you like help navigating between family members?`;
    }

    if (lowerMsg.includes('telemedicine') || lowerMsg.includes('doctor appointment')) {
      return 'You can book telemedicine consultations directly through the platform! Use the telemedicine feature to schedule virtual appointments with specialists. Would you like me to guide you through booking one?';
    }

    if (lowerMsg.includes('medication') || lowerMsg.includes('pill')) {
      const memberMeds = medications.filter((m) => m.member_id === selectedMember?.user_id);
      return `${selectedMember?.name} has ${memberMeds.length} medications tracked. You can view medication schedules, set reminders, and check for drug interactions. Need help with medication management?`;
    }

    if (lowerMsg.includes('points') || lowerMsg.includes('rewards')) {
      return `You have ${currentUser?.points || 0} wellness points! Earn points by taking medications on time, logging vitals, completing health goals, and participating in family challenges. Visit the Points Store to redeem rewards!`;
    }

    if (lowerMsg.includes('challenge') || lowerMsg.includes('competition')) {
      return 'Family wellness challenges are a great way to stay motivated! You can join existing challenges or create new ones. Compete with family members and earn points for healthy behaviors.';
    }

    if (lowerMsg.includes('emergency') || lowerMsg.includes('sos')) {
      return 'For medical emergencies, call emergency services immediately. The SOS feature alerts your emergency contacts and family members with your location and recent health data. You can manage emergency contacts in your settings.';
    }

    if (lowerMsg.includes('ai') || lowerMsg.includes('insight')) {
      return 'AI health insights analyze your health patterns to provide personalized recommendations. The system can predict health trends, suggest lifestyle changes, and alert you to potential concerns based on your data.';
    }

    if (lowerMsg.includes('menstrual') || lowerMsg.includes('cycle')) {
      if (selectedMember?.gender === 'female') {
        return 'The menstrual cycle tracker helps monitor periods, symptoms, and patterns. This data is private and only accessible by the user and doctors (not other family members). Would you like help logging cycle data?';
      } else {
        return 'The menstrual cycle tracker is available for female family members to track their cycles privately and share data with healthcare providers when needed.';
      }
    }

    return `I understand you're asking about "${message}". I can help with family health coordination, medication tracking, telemedicine bookings, wellness challenges, AI health insights, emergency contacts, and much more. What specific area would you like assistance with?`;
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { type: 'user', text: input }]);

    setTimeout(() => {
      const botResponse = getBotResponse(input);
      setMessages((prev) => [...prev, { type: 'bot', text: botResponse }]);
    }, 1000);

    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showChatbot && (
        <div className="bg-gradient-to-br from-white/95 to-blue-50/80 backdrop-blur-xl border border-blue-200/50 rounded-2xl shadow-2xl w-96 h-96 flex flex-col">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-4 rounded-t-2xl">
            <h3 className="font-bold">Aegis Family Assistant</h3>
            <p className="text-sm text-blue-100">Your intelligent health companion</p>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.type === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className={`inline-block p-3 rounded-2xl max-w-xs ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-blue-200/50">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about family health..."
                className="flex-1 p-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
              <button
                onClick={sendMessage}
                className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-3 rounded-xl text-sm hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-semibold"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setShowChatbot(!showChatbot)}
        className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-4 rounded-full shadow-2xl hover:from-blue-600 hover:to-green-600 transition-all duration-300 transform hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
};

export default Chatbot;

