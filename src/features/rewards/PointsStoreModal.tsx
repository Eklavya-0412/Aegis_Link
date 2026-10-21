import React from 'react';
import { Award, Gift, HeartPulse, Pill, Target } from 'lucide-react';
import { Coupon, User } from '../../types';
import { sampleCoupons } from '../../constants/sampleCoupons';
import Modal from '../../components/common/Modal';
import { useToastStore } from '../../store/toastStore';
import { formatDate } from '../../utils/format';

interface PointsStoreModalProps {
  onClose: () => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

const EARN = [
  { icon: Pill, label: 'Take medications', pts: 10 },
  { icon: HeartPulse, label: 'Log vitals', pts: 5 },
  { icon: Target, label: 'Complete goals', pts: 50 },
  { icon: Award, label: 'Win challenges', pts: 100 }
];

const PointsStoreModal: React.FC<PointsStoreModalProps> = ({ onClose, currentUser, setCurrentUser }) => {
  const userPoints = currentUser?.points || 0;

  const redeemCoupon = (coupon: Coupon) => {
    if (userPoints >= coupon.points_required) {
      if (currentUser) {
        const updatedUser = { ...currentUser, points: userPoints - coupon.points_required };
        setCurrentUser(updatedUser);
      }
      useToastStore
        .getState()
        .showToast(`Redeemed "${coupon.title}". You now have ${userPoints - coupon.points_required} points.`, 'success');
      onClose();
    } else {
      useToastStore.getState().showToast(`You need ${coupon.points_required - userPoints} more points for this reward.`, 'info');
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Wellness rewards"
      description="Redeem points earned by keeping up with your care plan."
      icon={Gift}
      iconClassName="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
      maxWidth="max-w-2xl"
      headerExtra={
        <div className="mr-2 text-right">
          <p className="text-2xs font-medium text-slate-500">Balance</p>
          <p className="text-lg font-semibold leading-tight tabular-nums text-slate-900 dark:text-slate-50">{userPoints}</p>
        </div>
      }
    >
      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        {sampleCoupons.map((coupon) => {
          const affordable = userPoints >= coupon.points_required;
          return (
            <li key={coupon.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-13 font-medium text-slate-900 dark:text-slate-100">
                  {coupon.title}
                  <span className="badge badge-neutral">{coupon.category}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {coupon.description} · Expires {formatDate(coupon.expires_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-13 font-semibold tabular-nums text-slate-900 dark:text-slate-100">{coupon.points_required} pts</span>
                <button
                  type="button"
                  onClick={() => redeemCoupon(coupon)}
                  disabled={!affordable}
                  className={`btn btn-sm ${affordable ? 'btn-primary' : 'btn-secondary'}`}
                  title={affordable ? undefined : `${coupon.points_required - userPoints} more points needed`}
                >
                  Redeem
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="eyebrow mb-3 mt-6">How to earn points</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {EARN.map((e) => (
          <div key={e.label} className="surface-muted px-3 py-3">
            <e.icon className="h-4 w-4 text-brand-700 dark:text-brand-400" aria-hidden />
            <p className="mt-2 text-13 font-medium text-slate-800 dark:text-slate-200">{e.label}</p>
            <p className="text-xs tabular-nums text-slate-500">{e.pts} pts each</p>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default PointsStoreModal;
