import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div
        className={`${sizeClasses} border-t-[#5288c1] border-r-transparent border-b-[#5288c1] border-l-transparent rounded-full animate-spin`}
      />
      {label && <p className="text-xs text-[#708499] font-medium animate-pulse">{label}</p>}
    </div>
  );
};
