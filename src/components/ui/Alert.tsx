/**
 * Alert Component
 * Simple alert/notification component for displaying messages
 */

import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  className?: string;
}

export function Alert({ variant = 'info', children, className = '' }: AlertProps) {
  const variants = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
    },
    success: {
      bg: 'bg-success-bg',
      border: 'border-success-200',
      text: 'text-success-800',
      icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertTriangle,
    },
    error: {
      bg: 'bg-error-bg',
      border: 'border-error-200',
      text: 'text-error-800',
      icon: XCircle,
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} ${config.text} border rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
