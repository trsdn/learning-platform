/**
 * Connection status indicator component
 * Shows real-time connection health to Supabase
 */

import React, { useEffect, useState } from 'react';
import {
  ConnectionStatus,
  getConnectionMonitor,
  type HealthCheckResult,
} from '../../../core/utils/connection-health';

export interface ConnectionStatusIndicatorProps {
  showWhenConnected?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

/**
 * Get status display info
 */
function getStatusInfo(status: ConnectionStatus): { label: string; icon: string; color: string } {
  switch (status) {
    case ConnectionStatus.CONNECTED:
      return { label: 'Connected', icon: '🟢', color: '#10b981' };
    case ConnectionStatus.DEGRADED:
      return { label: 'Slow Connection', icon: '🟡', color: '#f59e0b' };
    case ConnectionStatus.DISCONNECTED:
      return { label: 'Disconnected', icon: '🔴', color: '#ef4444' };
    case ConnectionStatus.CHECKING:
      return { label: 'Checking...', icon: '⚪', color: '#6b7280' };
  }
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  showWhenConnected = false,
  position = 'top-right',
  className = '',
}) => {
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const monitor = getConnectionMonitor();

    // Start monitoring
    monitor.start();

    // Subscribe to updates
    const unsubscribe = monitor.subscribe((result) => {
      setHealthResult(result);
    });

    // Cleanup
    return () => {
      unsubscribe();
      monitor.stop();
    };
  }, []);

  if (!healthResult) {
    return null;
  }

  // Don't show when connected if showWhenConnected is false
  if (!showWhenConnected && healthResult.status === ConnectionStatus.CONNECTED) {
    return null;
  }

  const statusInfo = getStatusInfo(healthResult.status);

  return (
    <div
      className={`connection-status connection-status--${position} ${className}`}
      style={{ '--status-color': statusInfo.color } as React.CSSProperties}
    >
      <button
        type="button"
        className="connection-status__button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={`Connection status: ${statusInfo.label}`}
        aria-expanded={isExpanded}
      >
        <span className="connection-status__icon" aria-hidden="true">
          {statusInfo.icon}
        </span>
        <span className="connection-status__label">{statusInfo.label}</span>
      </button>

      {isExpanded && (
        <div className="connection-status__details">
          <div className="connection-status__detail-row">
            <span className="connection-status__detail-label">Status:</span>
            <span className="connection-status__detail-value">{statusInfo.label}</span>
          </div>

          {healthResult.latency !== undefined && (
            <div className="connection-status__detail-row">
              <span className="connection-status__detail-label">Latency:</span>
              <span className="connection-status__detail-value">{healthResult.latency}ms</span>
            </div>
          )}

          {healthResult.error && (
            <div className="connection-status__detail-row">
              <span className="connection-status__detail-label">Error:</span>
              <span className="connection-status__detail-value connection-status__detail-value--error">
                {healthResult.error.userMessage}
              </span>
            </div>
          )}

          <div className="connection-status__detail-row">
            <span className="connection-status__detail-label">Last check:</span>
            <span className="connection-status__detail-value">
              {new Date(healthResult.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact connection status badge
 * Shows only when disconnected
 */
export const ConnectionBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);

  useEffect(() => {
    const monitor = getConnectionMonitor();
    monitor.start();

    const unsubscribe = monitor.subscribe((result) => {
      setHealthResult(result);
    });

    return () => {
      unsubscribe();
      monitor.stop();
    };
  }, []);

  if (!healthResult || healthResult.status === ConnectionStatus.CONNECTED) {
    return null;
  }

  const statusInfo = getStatusInfo(healthResult.status);

  return (
    <div className={`connection-badge ${className}`} role="status">
      <span className="connection-badge__icon" aria-hidden="true">
        {statusInfo.icon}
      </span>
      <span className="connection-badge__label">{statusInfo.label}</span>
    </div>
  );
};

/**
 * Hook to use connection status in components
 */
export function useConnectionStatus(): {
  status: ConnectionStatus;
  latency: number | undefined;
  error: any;
  isConnected: boolean;
} {
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);

  useEffect(() => {
    const monitor = getConnectionMonitor();
    monitor.start();

    const unsubscribe = monitor.subscribe((result) => {
      setHealthResult(result);
    });

    return () => {
      unsubscribe();
      monitor.stop();
    };
  }, []);

  if (!healthResult) {
    return {
      status: ConnectionStatus.CHECKING,
      latency: undefined,
      error: undefined,
      isConnected: false,
    };
  }

  return {
    status: healthResult.status,
    latency: healthResult.latency,
    error: healthResult.error,
    isConnected:
      healthResult.status === ConnectionStatus.CONNECTED ||
      healthResult.status === ConnectionStatus.DEGRADED,
  };
}
