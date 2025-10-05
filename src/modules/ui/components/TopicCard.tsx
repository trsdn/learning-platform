import React from 'react';

/**
 * Topic data for display in card
 */
export interface TopicCardTopic {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface TopicCardProps {
  topic: TopicCardTopic;
  onSelect: (topicId: string) => void;
  className?: string;
  disabled?: boolean;
  'data-testid'?: string;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onSelect,
  className,
  disabled = false,
  'data-testid': dataTestId
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const cardStyle: React.CSSProperties = {
    padding: '2rem',
    background: 'var(--color-bg-secondary)',
    borderRadius: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '2px solid transparent',
    borderColor: isHovered ? 'var(--color-primary)' : 'transparent',
    transform: isHovered && !disabled ? 'translateY(-4px)' : 'translateY(0)',
    boxShadow: isHovered && !disabled ? 'var(--shadow-lg)' : 'none',
    opacity: disabled ? 0.5 : 1,
  };

  // Generate accessible label following German pattern
  const ariaLabel = `Thema ${topic.name} öffnen - ${topic.description}`;

  return (
    <button
      type="button"
      onClick={() => onSelect(topic.id)}
      className={className}
      data-testid={dataTestId}
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {topic.icon && (
        <span aria-hidden="true" style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>
          {topic.icon}
        </span>
      )}
      <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-primary)' }}>
        {topic.name}
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
        {topic.description}
      </p>
    </button>
  );
};
