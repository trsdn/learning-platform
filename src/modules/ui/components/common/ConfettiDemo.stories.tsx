import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from './Button';
import { getConfettiService } from '../../../core/services/confetti-service';
import type { ConfettiStyle, ConfettiIntensity } from '../../../core/entities/app-settings';

/**
 * Interactive demo for testing confetti animations.
 *
 * This story demonstrates the different confetti styles and intensities
 * available in the learning platform. The confetti service provides
 * celebratory animations for achievements like perfect sessions,
 * streak milestones, and level-ups.
 */
function ConfettiDemo() {
  const [selectedStyle, setSelectedStyle] = useState<ConfettiStyle>('standard');
  const [selectedIntensity, setSelectedIntensity] = useState<ConfettiIntensity>('medium');

  const confettiService = getConfettiService();

  const handleFire = async () => {
    await confettiService.fire(selectedStyle, selectedIntensity);
  };

  const handleFirePreset = async (
    style: ConfettiStyle,
    intensity: ConfettiIntensity
  ) => {
    await confettiService.fire(style, intensity);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Konfetti Demo</h2>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Schnelltest</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button onClick={() => handleFirePreset('standard', 'medium')}>
            Standard
          </Button>
          <Button onClick={() => handleFirePreset('firework', 'medium')} variant="secondary">
            Feuerwerk
          </Button>
          <Button onClick={() => handleFirePreset('cannon', 'medium')} variant="secondary">
            Kanone
          </Button>
          <Button onClick={() => handleFirePreset('emoji', 'medium')} variant="secondary">
            Emoji
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Stil auswählen</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {(['standard', 'firework', 'cannon', 'emoji'] as ConfettiStyle[]).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedStyle(style)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid',
                borderColor: selectedStyle === style ? '#667eea' : '#e5e7eb',
                borderRadius: '9999px',
                background: selectedStyle === style ? 'rgba(102, 126, 234, 0.1)' : 'white',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {style === 'standard'
                ? 'Standard'
                : style === 'firework'
                  ? 'Feuerwerk'
                  : style === 'cannon'
                    ? 'Kanone'
                    : 'Emoji'}
            </button>
          ))}
        </div>

        <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Intensität auswählen</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {(['light', 'medium', 'strong'] as ConfettiIntensity[]).map((intensity) => (
            <button
              key={intensity}
              type="button"
              onClick={() => setSelectedIntensity(intensity)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid',
                borderColor: selectedIntensity === intensity ? '#667eea' : '#e5e7eb',
                borderRadius: '9999px',
                background: selectedIntensity === intensity ? 'rgba(102, 126, 234, 0.1)' : 'white',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {intensity === 'light'
                ? 'Leicht'
                : intensity === 'medium'
                  ? 'Mittel'
                  : 'Stark'}
            </button>
          ))}
        </div>

        <Button onClick={handleFire} variant="primary" fullWidth>
          Konfetti auslösen
        </Button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Trigger-Szenarien</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Button
            onClick={() => handleFirePreset('standard', 'medium')}
            variant="secondary"
            fullWidth
          >
            ✨ Perfekte Sitzung (100% richtig)
          </Button>
          <Button
            onClick={() => handleFirePreset('standard', 'light')}
            variant="secondary"
            fullWidth
          >
            🔥 7 Tage Streak
          </Button>
          <Button
            onClick={() => handleFirePreset('standard', 'medium')}
            variant="secondary"
            fullWidth
          >
            🔥 30 Tage Streak
          </Button>
          <Button
            onClick={() => handleFirePreset('standard', 'strong')}
            variant="secondary"
            fullWidth
          >
            🔥 100 Tage Streak
          </Button>
          <Button
            onClick={() => handleFirePreset('firework', 'medium')}
            variant="secondary"
            fullWidth
          >
            🎯 Erste perfekte Sitzung (Achievement)
          </Button>
          <Button
            onClick={() => handleFirePreset('emoji', 'strong')}
            variant="secondary"
            fullWidth
          >
            🎂 Geburtstag / Special Event
          </Button>
        </div>
      </div>

      <div
        style={{
          padding: '1rem',
          background: '#f3f4f6',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          color: '#6b7280',
        }}
      >
        <strong>Hinweis:</strong> Konfetti-Animationen werden automatisch bei
        Erfolgen ausgelöst. Die Animation respektiert die Einstellungen für
        &ldquo;Reduzierte Bewegungen&rdquo; und kann in den Einstellungen deaktiviert
        werden.
      </div>
    </div>
  );
}

const meta = {
  title: 'Features/Confetti',
  component: ConfettiDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## Konfetti-Animationen

Die Konfetti-Animationen feiern Erfolge der Lernenden mit bunten Animationen.

### Trigger
- **Perfekte Sitzung**: 100% richtig bei mindestens 5 Fragen
- **Streak-Meilensteine**: 7, 30, oder 100 Tage in Folge
- **Lernpfad abgeschlossen**: Nach Abschluss eines Lernpfads
- **Erste Erfolge**: Beim erstmaligen Erreichen von Meilensteinen

### Stile
- **Standard**: Klassische Konfetti-Explosion aus der Mitte
- **Feuerwerk**: Mehrere Explosionen an verschiedenen Positionen
- **Kanone**: Konfetti schießt aus beiden unteren Ecken
- **Emoji**: Größere, bunte Formen (Kreise, Quadrate)

### Barrierefreiheit
- Respektiert \`prefers-reduced-motion\`
- Kann in Einstellungen deaktiviert werden
- Unterstützt \`reducedMotion\` und \`animationsEnabled\` Settings
        `,
      },
    },
  },
} satisfies Meta<typeof ConfettiDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllStyles: Story = {
  name: 'Alle Stile',
  render: () => {
    const confettiService = getConfettiService();

    return (
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Button onClick={() => confettiService.fireStandard('medium')}>
          Standard
        </Button>
        <Button onClick={() => confettiService.fireFirework('medium')} variant="secondary">
          Feuerwerk
        </Button>
        <Button onClick={() => confettiService.fireCannon('medium')} variant="secondary">
          Kanone
        </Button>
        <Button onClick={() => confettiService.fireEmoji('medium')} variant="secondary">
          Emoji
        </Button>
      </div>
    );
  },
};

export const AllIntensities: Story = {
  name: 'Alle Intensitäten',
  render: () => {
    const confettiService = getConfettiService();

    return (
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Button onClick={() => confettiService.fireStandard('light')}>
          Leicht
        </Button>
        <Button onClick={() => confettiService.fireStandard('medium')} variant="secondary">
          Mittel
        </Button>
        <Button onClick={() => confettiService.fireStandard('strong')} variant="secondary">
          Stark
        </Button>
      </div>
    );
  },
};
