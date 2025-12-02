import type { Meta, StoryObj } from '@storybook/react';


// Since PWAInstallPrompt uses the usePWAInstall hook which requires browser APIs,
// we'll create a mock version for Storybook

const meta = {
  title: 'Features/PWAInstallPrompt',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type RenderStory = StoryObj<Meta>;

// Mock PWAInstallPrompt component for stories
const MockPWAInstallPrompt = ({
  installing = false,
  onInstall,
  onDismiss,
}: {
  installing?: boolean;
  onInstall?: () => void;
  onDismiss?: () => void;
}) => {
  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
      style={{
        background: 'var(--surface-color)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '1.5rem',
        maxWidth: '400px',
        width: '100%',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <h3
          id="pwa-install-title"
          style={{
            margin: '0 0 0.5rem 0',
            fontSize: '1.125rem',
            fontWeight: '600',
          }}
        >
          App installieren
        </h3>
        <p
          id="pwa-install-description"
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}
        >
          Installieren Sie MindForge Academy für schnelleren Zugriff und vollständige Offline-Nutzung.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button
          onClick={onDismiss}
          aria-label="Installation später durchführen"
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Später
        </button>

        <button
          onClick={onInstall}
          disabled={installing}
          aria-label="App jetzt installieren"
          aria-busy={installing}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            background: 'var(--color-primary)',
            color: 'white',
            cursor: installing ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            opacity: installing ? 0.7 : 1,
          }}
        >
          {installing ? 'Installiere...' : 'Installieren'}
        </button>
      </div>
    </div>
  );
};

// Hidden state explanation
const HiddenPrompt = ({ reason }: { reason: string }) => (
  <div style={{
    padding: '2rem',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    border: '2px dashed var(--border-color)',
    borderRadius: '12px',
  }}>
    <p style={{ margin: 0 }}>PWA Install Prompt is hidden</p>
    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Reason: {reason}</p>
  </div>
);

// Default state
export const Default: RenderStory = {
  render: () => (
    <MockPWAInstallPrompt
      onInstall={() => console.log('Install clicked')}
      onDismiss={() => console.log('Dismiss clicked')}
    />
  ),
};

// Installing state
export const Installing: RenderStory = {
  render: () => (
    <MockPWAInstallPrompt
      installing={true}
      onInstall={() => console.log('Install clicked')}
      onDismiss={() => console.log('Dismiss clicked')}
    />
  ),
};

// Already installed (hidden)
export const AlreadyInstalled: RenderStory = {
  render: () => <HiddenPrompt reason="App is already installed" />,
};

// User dismissed (hidden)
export const UserDismissed: RenderStory = {
  render: () => <HiddenPrompt reason="User previously dismissed the prompt" />,
};

// Browser not supported (hidden)
export const NotSupported: RenderStory = {
  render: () => <HiddenPrompt reason="Browser does not support PWA installation" />,
};

// In mobile context
export const MobileContext: RenderStory = {
  render: () => (
    <div style={{
      width: '320px',
      padding: '1rem',
      background: 'var(--background-color)',
      borderRadius: '8px',
    }}>
      <MockPWAInstallPrompt
        onInstall={() => console.log('Install clicked')}
        onDismiss={() => console.log('Dismiss clicked')}
      />
    </div>
  ),
};

// Dark mode (uses theme from preview)
export const DarkModeContext: RenderStory = {
  render: () => (
    <div style={{
      padding: '2rem',
      background: '#1a1a1a',
      borderRadius: '8px',
    }}>
      <div data-theme="dark">
        <MockPWAInstallPrompt
          onInstall={() => console.log('Install clicked')}
          onDismiss={() => console.log('Dismiss clicked')}
        />
      </div>
    </div>
  ),
};
