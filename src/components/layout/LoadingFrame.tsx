import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingFrameProps {
  visible: boolean;
  label?: string;
}

export const LoadingFrame: React.FC<LoadingFrameProps> = ({ visible, label = 'Loading' }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 flex flex-col items-center space-y-4 max-w-xs mx-4"
          >
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin absolute top-2 left-2 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-500 mt-1">Please wait a moment...</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingFrame;

