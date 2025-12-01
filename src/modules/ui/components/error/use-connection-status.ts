/**
 * Hook to use connection status in components
 */

import { useEffect, useState } from 'react';
import {
  ConnectionStatus,
  getConnectionMonitor,
  type HealthCheckResult,
} from '../../../core/utils/connection-health';

export function useConnectionStatus(): {
  status: ConnectionStatus;
  latency: number | undefined;
  error: HealthCheckResult['error'] | null;
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
      error: null,
      isConnected: false,
    };
  }

  return {
    status: healthResult.status,
    latency: healthResult.latency,
    error: healthResult.error ?? null,
    isConnected:
      healthResult.status === ConnectionStatus.CONNECTED ||
      healthResult.status === ConnectionStatus.DEGRADED,
  };
}
