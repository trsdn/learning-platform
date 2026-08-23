import styles from './offline-notice.module.css';

export interface OfflineNoticeProps {
  className?: string;
}

/**
 * Tells the learner that the app is running on cached content and that
 * progress cannot be saved until the connection returns.
 */
export function OfflineNotice({ className }: OfflineNoticeProps): JSX.Element {
  return (
    <div className={className ? `${styles.notice} ${className}` : styles.notice} role="status">
      <span className={styles.icon} aria-hidden="true">
        📴
      </span>
      <p className={styles.text}>
        Offline-Modus: Du siehst gespeicherte Inhalte. Dein Fortschritt wird erst gespeichert, wenn
        die Verbindung zurück ist.
      </p>
    </div>
  );
}
