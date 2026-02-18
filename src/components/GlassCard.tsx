import type { ReactNode } from 'react';
import './GlassCard.css';

export interface GlassCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * GlassCard component - reusable container for dashboard panel styling
 * Features glass morphism effect with backdrop blur
 */
export function GlassCard({ title, children, className = '' }: GlassCardProps) {
  return (
    <div 
      className={`glass-card ${className}`} 
      data-testid="glass-card"
    >
      <h3 
        className="glass-card__title" 
        data-testid="glass-card-title"
      >
        {title}
      </h3>
      <div className="glass-card__content" data-testid="glass-card-content">
        {children}
      </div>
    </div>
  );
}
