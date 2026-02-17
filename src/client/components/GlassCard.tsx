import type { ReactNode } from 'react';
import './GlassCard.css';

export interface GlassCardProps {
  /** The title displayed in the card header */
  title: string;
  /** The content to render inside the card */
  children: ReactNode;
  /** Optional additional CSS class names */
  className?: string;
  /** Optional click handler - makes the card interactive */
  onClick?: () => void;
  /** Optional aria-label for accessibility when card is clickable */
  ariaLabel?: string;
}

/**
 * GlassCard - A reusable glass-morphism card component for dashboard panels.
 * 
 * Features:
 * - Dark theme glass effect with backdrop blur
 * - Subtle hover lift animation
 * - Accessible focus states
 * - Optional click interaction
 * 
 * @example
 * ```tsx
 * <GlassCard title="Agent Status">
 *   <AgentList />
 * </GlassCard>
 * ```
 */
export function GlassCard({
  title,
  children,
  className = '',
  onClick,
  ariaLabel,
}: GlassCardProps) {
  const isClickable = onClick !== undefined;
  
  return (
    <div
      className={`glass-card ${isClickable ? 'glass-card--clickable' : ''} ${className}`.trim()}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel}
    >
      <div className="glass-card__header">
        <h3 className="glass-card__title">{title}</h3>
      </div>
      <div className="glass-card__content">
        {children}
      </div>
    </div>
  );
}

export default GlassCard;
