import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioButton, AudioButtonInline } from '@ui/components/audio-button';
import styles from '@ui/components/audio-button.module.css';

// Mock CSS module
vi.mock('@ui/components/audio-button.module.css', () => ({
  default: {
    'audio-button': 'audio-button',
    'audio-button__svg': 'audio-button__svg',
    'audio-button__icon': 'audio-button__icon',
    'audio-button__icon--playing': 'audio-button__icon--playing',
    'audio-button--small': 'audio-button--small',
    'audio-button--medium': 'audio-button--medium',
    'audio-button--large': 'audio-button--large',
    'audio-button--disabled': 'audio-button--disabled',
    'audio-button--playing': 'audio-button--playing',
    'audio-button--active': 'audio-button--active',
    'audio-button-inline': 'audio-button-inline',
  },
}));

describe('AudioButton', () => {
  // Mock Audio element
  let mockAudioInstance: {
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    currentTime: number;
  };

  beforeEach(() => {
    // Create mock audio instance
    mockAudioInstance = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      currentTime: 0,
    };

    // Mock the global Audio constructor using a function constructor
    global.Audio = vi.fn(function(this: typeof mockAudioInstance, _url?: string) {
      Object.assign(this, mockAudioInstance);
      return this;
    }) as unknown as typeof Audio;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render button with volume icon when audio is available', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('should render volume off icon when no audio URL provided', () => {
      render(<AudioButton text="Hola" audioUrl={null} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Volume off icon has different path than volume icon
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render volume off icon when audio URL is undefined', () => {
      render(<AudioButton text="Hola" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('should render medium size by default', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['audio-button--medium']);
    });

    it('should render small size', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" size="small" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['audio-button--small']);
    });

    it('should render large size', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" size="large" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['audio-button--large']);
    });

    it('should render correct icon size for small button', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" size="small" />);
      const svg = screen.getByRole('button').querySelector('svg') as SVGElement;
      expect(svg.style.width).toBe('16px');
      expect(svg.style.height).toBe('16px');
    });

    it('should render correct icon size for medium button', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" size="medium" />);
      const svg = screen.getByRole('button').querySelector('svg') as SVGElement;
      expect(svg.style.width).toBe('20px');
      expect(svg.style.height).toBe('20px');
    });

    it('should render correct icon size for large button', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" size="large" />);
      const svg = screen.getByRole('button').querySelector('svg') as SVGElement;
      expect(svg.style.width).toBe('24px');
      expect(svg.style.height).toBe('24px');
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" disabled />);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['audio-button--disabled']);
      expect(button).toHaveAttribute('tabIndex', '-1');
    });

    it('should be disabled when no audio URL is provided', () => {
      render(<AudioButton text="Hola" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['audio-button--disabled']);
    });

    it('should show active state when audio is available', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['audio-button--active']);
    });

    it('should show playing state when audio is playing', async () => {
      const user = userEvent.setup();
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(button.className).toContain(styles['audio-button--playing']);
    });

    it('should not have tabIndex -1 when enabled with audio', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Interactions - Click', () => {
    it('should play audio when clicked', async () => {
      const user = userEvent.setup();
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(global.Audio).toHaveBeenCalledWith('https://example.com/audio.mp3');
      expect(mockAudioInstance.play).toHaveBeenCalled();
    });

    it('should not play audio when disabled', async () => {
      const user = userEvent.setup();
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" disabled />);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(mockAudioInstance.play).not.toHaveBeenCalled();
    });

    it('should not play audio when no audio URL provided', async () => {
      const user = userEvent.setup();
      render(<AudioButton text="Hola" />);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(mockAudioInstance.play).not.toHaveBeenCalled();
    });

    it('should reset audio to start when clicked multiple times', async () => {
      const user = userEvent.setup();
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      await user.click(button);
      await user.click(button);

      // Verify that play is called each time and audio resets
      expect(mockAudioInstance.play).toHaveBeenCalledTimes(2);
      expect(global.Audio).toHaveBeenCalledTimes(1);
    });

    it('should reuse audio instance on subsequent clicks', async () => {
      const user = userEvent.setup();
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      await user.click(button);
      await user.click(button);

      expect(global.Audio).toHaveBeenCalledTimes(1);
      expect(mockAudioInstance.play).toHaveBeenCalledTimes(2);
    });
  });

  describe('Interactions - Keyboard', () => {
    it('should play audio when Enter key is pressed', async () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });

      await waitFor(() => {
        expect(mockAudioInstance.play).toHaveBeenCalled();
      });
    });

    it('should play audio when Space key is pressed', async () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      button.focus();
      fireEvent.keyDown(button, { key: ' ' });

      await waitFor(() => {
        expect(mockAudioInstance.play).toHaveBeenCalled();
      });
    });

    it('should not play audio on other key presses', async () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      button.focus();
      fireEvent.keyDown(button, { key: 'a' });

      expect(mockAudioInstance.play).not.toHaveBeenCalled();
    });

    it('should not play audio when disabled and Enter is pressed', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" disabled />);
      const button = screen.getByRole('button');

      fireEvent.keyDown(button, { key: 'Enter' });

      expect(mockAudioInstance.play).not.toHaveBeenCalled();
    });

    it('should prevent default behavior on Enter key', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      button.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should prevent default behavior on Space key', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      button.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Audio Events', () => {
    it('should register event listeners on audio element', async () => {
      const user = userEvent.setup();
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(mockAudioInstance.addEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
      expect(mockAudioInstance.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should reset playing state when audio ends', async () => {
      const user = userEvent.setup();
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(button.className).toContain(styles['audio-button--playing']);

      // Simulate audio ended event
      const endedCallback = mockAudioInstance.addEventListener.mock.calls.find(
        call => call[0] === 'ended'
      )?.[1];
      endedCallback?.();

      await waitFor(() => {
        expect(button.className).not.toContain(styles['audio-button--playing']);
      });
    });

    it('should show error state when audio fails to load', async () => {
      const user = userEvent.setup();
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      await user.click(button);

      // Simulate audio error event
      const errorCallback = mockAudioInstance.addEventListener.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];
      errorCallback?.();

      await waitFor(() => {
        expect(button.className).not.toContain(styles['audio-button--playing']);
      });
    });

    it('should handle play promise rejection', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAudioInstance.play.mockRejectedValueOnce(new Error('Playback failed'));

      const user = userEvent.setup();
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      await user.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to play audio:', expect.any(Error));
        expect(button.className).not.toContain(styles['audio-button--playing']);
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have appropriate aria-label', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Spanische Aussprache für Hola abspielen');
    });

    it('should have title attribute when audio is available', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Aussprache abspielen: Hola');
    });

    it('should have appropriate title when audio is not available', () => {
      render(<AudioButton text="Hola" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Audio nicht verfügbar');
    });

    it('should have appropriate title when playing', async () => {
      const user = userEvent.setup();
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(button).toHaveAttribute('title', 'Spielt ab...');
    });

    it('should be keyboard focusable when enabled', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('should not be keyboard focusable when disabled', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" disabled />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Icon Rendering', () => {
    it('should render VolumeIcon when audio is available and not playing', () => {
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');
      const icon = button.querySelector(`.${styles['audio-button__icon']}`);
      expect(icon).toBeInTheDocument();
      expect(icon?.className).not.toContain(styles['audio-button__icon--playing']);
    });

    it('should render VolumeIcon with playing animation when playing', async () => {
      const user = userEvent.setup();
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      await user.click(button);

      const icon = button.querySelector(`.${styles['audio-button__icon--playing']}`);
      expect(icon).toBeInTheDocument();
    });

    it('should render VolumeOffIcon when audio is not available', () => {
      render(<AudioButton text="Hola" />);
      const button = screen.getByRole('button');
      const icon = button.querySelector(`.${styles['audio-button__icon']}`);
      expect(icon).toBeInTheDocument();
    });

    it('should render VolumeOffIcon after audio error', async () => {
      const user = userEvent.setup();
      render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const button = screen.getByRole('button');

      await user.click(button);

      // Simulate audio error event
      const errorCallback = mockAudioInstance.addEventListener.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];
      errorCallback?.();

      await waitFor(() => {
        const icon = button.querySelector(`.${styles['audio-button__icon']}`);
        expect(icon).toBeInTheDocument();
      });
    });
  });

  describe('Memoization', () => {
    it('should not re-render when parent re-renders with same props', () => {
      const { rerender } = render(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const firstButton = screen.getByRole('button');

      rerender(<AudioButton text="Hola" audioUrl="https://example.com/audio.mp3" />);
      const secondButton = screen.getByRole('button');

      expect(firstButton).toBe(secondButton);
    });
  });
});

describe('AudioButtonInline', () => {
  beforeEach(() => {
    // Create mock audio instance
    const mockAudioInstance = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      currentTime: 0,
    };

    // Mock the global Audio constructor using a function constructor
    global.Audio = vi.fn(function(this: typeof mockAudioInstance, _url?: string) {
      Object.assign(this, mockAudioInstance);
      return this;
    }) as unknown as typeof Audio;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render text and audio button', () => {
      render(<AudioButtonInline text="Hola" />);
      expect(screen.getByText('Hola')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(<AudioButtonInline text="Hola" className="custom-inline" />);
      const wrapper = container.querySelector(`.${styles['audio-button-inline']}`);
      expect(wrapper?.className).toContain('custom-inline');
    });

    it('should render AudioButton with small size', () => {
      render(<AudioButtonInline text="Hola" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain(styles['audio-button--small']);
    });

    it('should display text alongside button', () => {
      const { container } = render(<AudioButtonInline text="Buenos días" />);
      const wrapper = container.querySelector(`.${styles['audio-button-inline']}`);
      expect(wrapper).toBeInTheDocument();
      expect(screen.getByText('Buenos días')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have inline layout wrapper', () => {
      const { container } = render(<AudioButtonInline text="Hola" />);
      const wrapper = container.querySelector(`.${styles['audio-button-inline']}`);
      expect(wrapper).toBeInTheDocument();
    });

    it('should contain both text and button elements', () => {
      const { container } = render(<AudioButtonInline text="Hola" />);
      const wrapper = container.querySelector(`.${styles['audio-button-inline']}`);
      expect(wrapper?.children).toHaveLength(2);
    });
  });
});
