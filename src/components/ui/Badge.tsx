import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'accessible' | 'warning' | 'disruption' | 'neutral' | 'accent' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'neutral', children, ...props }) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors";

  const variants = {
    accessible: "bg-accessible-subtle text-accessible border border-accessible-border",
    warning: "bg-warning-subtle text-warning border border-warning-border",
    disruption: "bg-disruption-subtle text-disruption border border-disruption-border",
    accent: "bg-accent-subtle text-accent border border-blue-200",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
    outline: "border border-slate-300 text-slate-600",
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], className))} {...props}>
      {children}
    </span>
  );
};

