import React from 'react';

interface LoadingFrameProps {
  visible: boolean;
  label?: string;
}

/** Slim, non-blocking progress indicator shown while switching sections. */
export const LoadingFrame: React.FC<LoadingFrameProps> = ({ visible, label = 'Loading' }) => {
  if (!visible) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70]" role="progressbar" aria-label={`Loading ${label}`}>
      <div className="h-0.5 w-full overflow-hidden bg-brand-100 dark:bg-brand-950">
        <div className="h-full w-2/5 animate-progress bg-brand-600" />
      </div>
    </div>
  );
};

export default LoadingFrame;
