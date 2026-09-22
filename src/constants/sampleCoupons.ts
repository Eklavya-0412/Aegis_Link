import { Coupon } from '../types';

export const sampleCoupons: Coupon[] = [
  { id: '1', title: '20% Off Health Supplements', description: 'Vitamins and nutritional supplements', points_required: 500, category: 'Health', expires_at: '2025-12-31' },
  { id: '2', title: 'Free Wellness Consultation', description: '30-minute health consultation', points_required: 1000, category: 'Consultation', expires_at: '2025-11-30' },
  { id: '3', title: 'Fitness Equipment Discount', description: '15% off exercise equipment', points_required: 750, category: 'Fitness', expires_at: '2025-10-31' },
  { id: '4', title: 'Healthy Meal Delivery', description: '25% off organic meal plans', points_required: 600, category: 'Nutrition', expires_at: '2025-12-15' }
];
