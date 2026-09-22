import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { ChevronRight, Plus, TrendingUp, XCircle } from 'lucide-react';
import { Family, WellnessChallenge } from '../../types';

interface EnhancedWellnessChallengesProps {
  onClose: () => void;
  currentFamily: Family | null;
  wellnessChallenges: WellnessChallenge[];
  setWellnessChallenges: Dispatch<SetStateAction<WellnessChallenge[]>>;
}

const EnhancedWellnessChallenges: React.FC<EnhancedWellnessChallengesProps> = ({
  onClose,
  currentFamily,
  wellnessChallenges,
  setWellnessChallenges
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState<WellnessChallenge | null>(null);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    name: '',
    description: '',
    target_value: 0,
    duration_days: 7
  });

  const createChallenge = () => {
    const challenge: WellnessChallenge = {
      id: Date.now().toString(),
      name: newChallenge.name,
      description: newChallenge.description,
      progress: 0,
      points: (newChallenge.target_value || 10) * 10,
      family_progress: {},
      participants: []
    };

    setWellnessChallenges([...wellnessChallenges, challenge]);
    setShowCreateChallenge(false);
    setNewChallenge({ name: '', description: '', target_value: 0, duration_days: 7 });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white/95 to-green-50/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Wellness Challenges</h3>
                <p className="text-gray-600">Family competitions with rewards and tracking</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateChallenge(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                New Challenge
              </button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>

          {showCreateChallenge && (
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-200 mb-8">
              <h4 className="font-bold text-gray-800 mb-4">Create New Challenge</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Challenge Name"
                  className="p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newChallenge.name}
                  onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Target Value"
                  className="p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newChallenge.target_value || ''}
                  onChange={(e) =>
                    setNewChallenge({ ...newChallenge, target_value: parseInt(e.target.value) || 0 })
                  }
                />
                <textarea
                  placeholder="Description"
                  className="md:col-span-2 p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                />
                <div className="md:col-span-2 flex space-x-3">
                  <button
                    onClick={createChallenge}
                    disabled={!newChallenge.name || !newChallenge.description}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 font-medium"
                  >
                    Create Challenge
                  </button>
                  <button
                    onClick={() => setShowCreateChallenge(false)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedChallenge ? (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedChallenge(null)}
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                Back to Challenges
              </button>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-2xl border border-green-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">{selectedChallenge.name}</h4>
                    <p className="text-gray-600">{selectedChallenge.description}</p>
                  </div>
                  <div className="text-6xl">🏆</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/80 p-6 rounded-2xl text-center">
                    <p className="text-3xl font-bold text-green-600 mb-2">{selectedChallenge.progress}%</p>
                    <p className="text-sm text-gray-600">Progress</p>
                  </div>
                  <div className="bg-white/80 p-6 rounded-2xl text-center">
                    <p className="text-3xl font-bold text-blue-600 mb-2">{selectedChallenge.points}</p>
                    <p className="text-sm text-gray-600">Points Available</p>
                  </div>
                  <div className="bg-white/80 p-6 rounded-2xl text-center">
                    <p className="text-3xl font-bold text-purple-600 mb-2">
                      {selectedChallenge.participants.length}
                    </p>
                    <p className="text-sm text-gray-600">Participants</p>
                  </div>
                </div>

                <div className="bg-white/60 p-6 rounded-2xl">
                  <h5 className="font-bold text-gray-800 mb-4">Family Leaderboard</h5>
                  <div className="space-y-3">
                    {currentFamily?.members.map((member, idx) => {
                      const memberProgress =
                        selectedChallenge.family_progress?.[member.user_id] || 0;
                      return (
                        <div
                          key={member.user_id}
                          className="flex items-center justify-between p-4 bg-white/60 rounded-xl"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white ${
                                idx === 0
                                  ? 'bg-yellow-500'
                                  : idx === 1
                                  ? 'bg-gray-400'
                                  : idx === 2
                                  ? 'bg-orange-600'
                                  : 'bg-purple-500'
                              }`}
                            >
                              #{idx + 1}
                            </div>
                            <div className="text-2xl">{member.gender === 'female' ? '👩' : '👨'}</div>
                            <span className="font-semibold text-gray-800">{member.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{memberProgress}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wellnessChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-800">{challenge.name}</h4>
                    <div className="text-2xl">🏆</div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">{challenge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${challenge.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Points</p>
                      <p className="text-lg font-bold text-green-600">{challenge.points}</p>
                    </div>
                    <button
                      onClick={() => setSelectedChallenge(challenge)}
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedWellnessChallenges;

