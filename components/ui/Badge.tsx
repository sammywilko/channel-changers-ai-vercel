import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'blue';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    success: "border-transparent bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25",
    warning: "border-transparent bg-amber-500/15 text-amber-500 hover:bg-amber-500/25",
    destructive: "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25",
    blue: "border-transparent bg-blue-500/15 text-blue-500 hover:bg-blue-500/25",
    outline: "text-foreground",
  };

  return (
    <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};