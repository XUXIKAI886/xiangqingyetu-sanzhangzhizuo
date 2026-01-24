'use client';

import { Loader2 } from 'lucide-react';

interface ProgressDisplayProps {
  currentStep: string;
  progress: number;
}

export function ProgressDisplay({ currentStep, progress }: ProgressDisplayProps) {
  return (
    <div className="glass-card rounded-3xl p-8 text-center">
      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
      <p className="mt-5 text-lg font-semibold text-gray-800">{currentStep}</p>
      <div className="mt-6 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-sm font-medium text-orange-600">{progress}%</p>
    </div>
  );
}
