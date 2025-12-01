import React from 'react';
import clsx from 'clsx';
import styles from './TopicCard.module.css';

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
  // Generate accessible label following German pattern
  const ariaLabel = `Thema ${topic.name} öffnen - ${topic.description}`;

  return (
    <button
      type="button"
      onClick={() => onSelect(topic.id)}
      className={clsx(styles.card, className)}
      data-testid={dataTestId}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {topic.icon && (
        <span aria-hidden="true" className={styles.icon}>
          {topic.icon}
        </span>
      )}
      <h3 className={styles.title}>
        {topic.name}
      </h3>
      <p className={styles.description}>
        {topic.description}
      </p>
    </button>
  );
};
