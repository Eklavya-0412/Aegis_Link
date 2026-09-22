import React from 'react';
import { Users } from 'lucide-react';
import { Family, User } from '../../types';

interface FamilyMemberSelectorProps {
  currentFamily: Family | null;
  currentUser: User | null;
  selectedMember: User | null;
  onSelectMember: (member: User) => void;
}

const FamilyMemberSelector: React.FC<FamilyMemberSelectorProps> = ({
  currentFamily,
  currentUser,
  selectedMember,
  onSelectMember
}) => {
  if (!currentFamily || currentFamily.members.length <= 1 || currentUser?.role === 'caregiver' || currentUser?.role === 'doctor') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-white/80 to-blue-50/50 backdrop-blur-lg p-4 rounded-2xl shadow-xl border border-blue-100/50 mb-6">
      <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
        <Users className="h-5 w-5 mr-2 text-blue-600" />
        Select Family Member
      </h3>
      <div className="flex flex-wrap gap-3">
        {currentFamily.members.map(member => (
          <button
            key={member.user_id}
            onClick={() => onSelectMember(member)}
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 font-medium ${
              selectedMember?.user_id === member.user_id
                ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg transform scale-105'
                : 'bg-white/60 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
            }`}
          >
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              selectedMember?.user_id === member.user_id ? 'bg-white/20' : 'bg-gradient-to-br from-blue-400 to-green-400'
            }`}>
              {member.gender === 'female' ? '👩' : '👨'}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">{member.name}</p>
              <p className="text-xs opacity-75">{member.relationship || member.role}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FamilyMemberSelector;
