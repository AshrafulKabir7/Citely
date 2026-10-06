import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="floating-toast">
      <CheckCircle2 className="w-4 h-4 text-positive" />
      <span>{message}</span>
    </div>
  );
};
