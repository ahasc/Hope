'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-cinzel tracking-wider transition-all duration-200 border disabled:opacity-30 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-xs',
    lg: 'px-7 py-3.5 text-xs',
  };
  const variants: Record<string, string> = {
    primary:   'btn-gold',
    secondary: 'bg-transparent border-[rgba(200,164,74,0.25)] text-[#c8a44a] hover:border-[rgba(200,164,74,0.5)] hover:bg-[rgba(200,164,74,0.06)]',
    danger:    'btn-danger',
    ghost:     'btn-ghost-dark',
  };
  return (
    <button {...props} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative p-4 ${className}`}
      style={{
        background: 'linear-gradient(160deg, #0d0d22 0%, #080818 60%, #0a0a1e 100%)',
        border: '1px solid rgba(200,164,74,0.18)',
      }}
    >
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default', className = '' }: {
  children: ReactNode;
  variant?: 'default' | 'curse' | 'glory' | 'danger' | 'hope';
  className?: string;
}) {
  const variants: Record<string, React.CSSProperties> = {
    default: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#60584a' },
    curse:   { background: 'rgba(112,32,192,0.15)', border: '1px solid rgba(112,32,192,0.4)', color: '#9040d0' },
    glory:   { background: 'rgba(200,164,74,0.12)', border: '1px solid rgba(200,164,74,0.4)', color: '#c8a44a' },
    danger:  { background: 'rgba(180,30,30,0.15)', border: '1px solid rgba(180,30,30,0.4)', color: '#e05050' },
    hope:    { background: 'rgba(48,112,208,0.15)', border: '1px solid rgba(48,112,208,0.4)', color: '#6090f0' },
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-cinzel tracking-wide ${className}`}
      style={variants[variant]}
    >
      {children}
    </span>
  );
}

export function Divider({ className = '' }: { className?: string }) {
  return <div className={`divider-gold ${className}`} />;
}

export function SectionTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`font-cinzel tracking-widest uppercase ${className}`} style={{ color: '#c8a44a' }}>
      {children}
    </h2>
  );
}
