import React from 'react';
import { Award, Gift, Heart, Pill, Target, XCircle } from 'lucide-react';
import { Coupon, User } from '../../types';
import { sampleCoupons } from '../../constants/sampleCoupons';
import { saveUser } from '../../services/storageService';

interface PointsStoreModalProps {
  onClose: () => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

const PointsStoreModal: React.FC<PointsStoreModalProps> = ({
  onClose,
  currentUser,
  setCurrentUser
}) => {
  const userPoints = currentUser?.points || 0;

  const redeemCoupon = (coupon: Coupon) => {
    if (userPoints >= coupon.points_required) {
      if (currentUser) {
        const updatedUser = { ...currentUser, points: userPoints - coupon.points_required };
        setCurrentUser(updatedUser);
        saveUser(updatedUser);
      }
      alert(
        `Successfully redeemed: ${coupon.title}! You now have ${
          userPoints - coupon.points_required
        } points.`
      );
      onClose();
    } else {
      alert(`You need ${coupon.points_required - userPoints} more points to redeem this coupon.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white/95 to-yellow-50/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Points Store</h3>
                <p className="text-gray-600">Redeem your wellness points for rewards</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Your Points</p>
              <p className="text-3xl font-bold text-yellow-600">{userPoints}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <XCircle className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-yellow-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-lg mb-2">{coupon.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{coupon.description}</p>
                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      {coupon.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Cost</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {coupon.points_required} pts
                    </p>
                  </div>
                  <button
                    onClick={() => redeemCoupon(coupon)}
                    disabled={userPoints < coupon.points_required}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                      userPoints >= coupon.points_required
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Redeem
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Expires: {new Date(coupon.expires_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
            <h4 className="font-bold text-gray-800 mb-3">How to Earn Points:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white/60 p-4 rounded-xl">
                <Pill className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Take Medications</p>
                <p className="text-xs text-gray-600">10 pts each</p>
              </div>
              <div className="bg-white/60 p-4 rounded-xl">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Log Vitals</p>
                <p className="text-xs text-gray-600">5 pts each</p>
              </div>
              <div className="bg-white/60 p-4 rounded-xl">
                <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Complete Goals</p>
                <p className="text-xs text-gray-600">50 pts each</p>
              </div>
              <div className="bg-white/60 p-4 rounded-xl">
                <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Win Challenges</p>
                <p className="text-xs text-gray-600">100 pts each</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsStoreModal;

