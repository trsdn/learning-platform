/**
 * Utilities for checking Supabase connection health
 */

import { supabase } from '../../storage/supabase-client';
import { categorizeError, logError, ErrorCategory, type StructuredError } from './error-handler';

/**
 * Connection health status
 */
export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  DEGRADED = 'DEGRADED',
  CHECKING = 'CHECKING',
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  status: ConnectionStatus;
  latency?: number;
  error?: StructuredError;
  timestamp: string;
}

/**
 * Check Supabase connection health
 * Performs a lightweight query to verify connectivity
 */
export async function checkSupabaseConnection(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Perform a lightweight query to check connection
    // Using `limit(1)` to minimize data transfer
    const { error } = await supabase.from('topics').select('id').limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      const structuredError = categorizeError(error, { operation: 'health-check' });
      logError(structuredError, 'checkSupabaseConnection');

      return {
        status: ConnectionStatus.DISCONNECTED,
        latency,
        error: structuredError,
        timestamp: new Date().toISOString(),
      };
    }

    // Determine status based on latency
    const status = latency > 5000 ? ConnectionStatus.DEGRADED : ConnectionStatus.CONNECTED;

    return {
      status,
      latency,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const structuredError = categorizeError(error, { operation: 'health-check' });
    logError(structuredError, 'checkSupabaseConnection');

    return {
      status: ConnectionStatus.DISCONNECTED,
      error: structuredError,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Wait for connection to be established
 * Useful during app startup
 */
export async function waitForConnection(
  maxWaitTime: number = 10000,
  checkInterval: number = 1000
): Promise<HealthCheckResult> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const result = await checkSupabaseConnection();

    if (result.status === ConnectionStatus.CONNECTED || result.status === ConnectionStatus.DEGRADED) {
      return result;
    }

    // Wait before next check
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }

  // Timeout reached
  return {
    status: ConnectionStatus.DISCONNECTED,
    error: {
      category: ErrorCategory.TIMEOUT,
      message: 'Connection timeout',
      userMessage: 'Could not connect to the server. Please check your internet connection and try again.',
      isRetryable: true,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Periodic health check monitor
 */
export class ConnectionMonitor {
  private intervalId: number | null = null;
  private listeners: Array<(result: HealthCheckResult) => void> = [];
  private lastResult: HealthCheckResult | null = null;

  constructor(private checkInterval: number = 30000) {} // Default: 30 seconds

  /**
   * Start monitoring connection health
   */
  start(): void {
    if (this.intervalId !== null) {
      return; // Already running
    }

    // Perform initial check
    this.performCheck();

    // Set up periodic checks
    this.intervalId = window.setInterval(() => {
      this.performCheck();
    }, this.checkInterval);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Subscribe to health check updates
   */
  subscribe(listener: (result: HealthCheckResult) => void): () => void {
    this.listeners.push(listener);

    // Send last result immediately if available
    if (this.lastResult) {
      listener(this.lastResult);
    }

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Get last health check result
   */
  getLastResult(): HealthCheckResult | null {
    return this.lastResult;
  }

  /**
   * Perform a health check and notify listeners
   */
  private async performCheck(): Promise<void> {
    const result = await checkSupabaseConnection();
    this.lastResult = result;

    // Notify all listeners
    this.listeners.forEach((listener) => {
      try {
        listener(result);
      } catch (error) {
        console.error('Error in connection monitor listener:', error);
      }
    });
  }

  /**
   * Force an immediate health check
   */
  async checkNow(): Promise<HealthCheckResult> {
    await this.performCheck();
    return this.lastResult!;
  }
}

/**
 * Global connection monitor instance
 */
let globalMonitor: ConnectionMonitor | null = null;

/**
 * Get or create global connection monitor
 */
export function getConnectionMonitor(): ConnectionMonitor {
  if (!globalMonitor) {
    globalMonitor = new ConnectionMonitor();
  }
  return globalMonitor;
}
