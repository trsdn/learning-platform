import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

// Since ConnectionStatusIndicator and ConnectionBadge use the connection monitor,
// we'll create mock versions for Storybook

const meta = {
  title: 'Error/ConnectionStatus',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type RenderStory = StoryObj<Meta>;

// Mock status info function
function getStatusInfo(status: 'connected' | 'degraded' | 'disconnected' | 'checking'): { label: string; icon: string; color: string } {
  switch (status) {
    case 'connected':
      return { label: 'Connected', icon: '🟢', color: '#10b981' };
    case 'degraded':
      return { label: 'Slow Connection', icon: '🟡', color: '#f59e0b' };
    case 'disconnected':
      return { label: 'Disconnected', icon: '🔴', color: '#ef4444' };
    case 'checking':
      return { label: 'Checking...', icon: '⚪', color: '#6b7280' };
  }
}

// Mock ConnectionStatusIndicator component for stories
const MockConnectionStatusIndicator = ({
  status,
  latency,
  showWhenConnected = false,
  isExpanded = false,
}: {
  status: 'connected' | 'degraded' | 'disconnected' | 'checking';
  latency?: number;
  showWhenConnected?: boolean;
  isExpanded?: boolean;
}) => {
  const statusInfo = getStatusInfo(status);

  if (!showWhenConnected && status === 'connected') {
    return <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Hidden when connected</div>;
  }

  return (
    <div
      className="connection-status"
      style={{
        '--status-color': statusInfo.color,
        display: 'inline-flex',
        flexDirection: 'column',
        background: 'var(--surface-color)',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      } as React.CSSProperties}
    >
      <button
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        <span aria-hidden="true">{statusInfo.icon}</span>
        <span>{statusInfo.label}</span>
      </button>

      {isExpanded && (
        <div style={{
          padding: '0.5rem 1rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.75rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span>Status:</span>
            <span>{statusInfo.label}</span>
          </div>
          {latency !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span>Latency:</span>
              <span>{latency}ms</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Last check:</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock ConnectionBadge component
const MockConnectionBadge = ({
  status
}: {
  status: 'connected' | 'degraded' | 'disconnected' | 'checking';
}) => {
  if (status === 'connected') {
    return <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Hidden when connected</div>;
  }

  const statusInfo = getStatusInfo(status);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.5rem',
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: '4px',
        fontSize: '0.75rem',
      }}
    >
      <span aria-hidden="true">{statusInfo.icon}</span>
      <span>{statusInfo.label}</span>
    </div>
  );
};

// Connected status
export const Connected: RenderStory = {
  render: () => (
    <MockConnectionStatusIndicator status="connected" latency={45} showWhenConnected={true} />
  ),
};

// Connected (hidden by default)
export const ConnectedHidden: RenderStory = {
  render: () => (
    <MockConnectionStatusIndicator status="connected" latency={45} showWhenConnected={false} />
  ),
};

// Degraded status
export const Degraded: RenderStory = {
  render: () => (
    <MockConnectionStatusIndicator status="degraded" latency={850} showWhenConnected={true} />
  ),
};

// Disconnected status
export const Disconnected: RenderStory = {
  render: () => (
    <MockConnectionStatusIndicator status="disconnected" showWhenConnected={true} />
  ),
};

// Checking status
export const Checking: RenderStory = {
  render: () => (
    <MockConnectionStatusIndicator status="checking" showWhenConnected={true} />
  ),
};

// Expanded view
export const ExpandedView: RenderStory = {
  render: () => (
    <MockConnectionStatusIndicator status="degraded" latency={450} showWhenConnected={true} isExpanded={true} />
  ),
};

// All status variants
export const AllStatuses: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Connected</p>
        <MockConnectionStatusIndicator status="connected" latency={45} showWhenConnected={true} />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Degraded</p>
        <MockConnectionStatusIndicator status="degraded" latency={850} showWhenConnected={true} />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Disconnected</p>
        <MockConnectionStatusIndicator status="disconnected" showWhenConnected={true} />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Checking</p>
        <MockConnectionStatusIndicator status="checking" showWhenConnected={true} />
      </div>
    </div>
  ),
};

// Connection Badge variants
export const BadgeDisconnected: RenderStory = {
  render: () => <MockConnectionBadge status="disconnected" />,
};

export const BadgeDegraded: RenderStory = {
  render: () => <MockConnectionBadge status="degraded" />,
};

export const BadgeConnected: RenderStory = {
  render: () => <MockConnectionBadge status="connected" />,
};

// All badge variants
export const AllBadges: RenderStory = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <MockConnectionBadge status="disconnected" />
      <MockConnectionBadge status="degraded" />
      <MockConnectionBadge status="checking" />
    </div>
  ),
};
