import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#667eea';
  ctx.fillRect(0, 0, size, size);

  // Border
  ctx.strokeStyle = '#5568d3';
  ctx.lineWidth = size / 45;
  ctx.strokeRect(0, 0, size, size);

  // Brain emoji
  ctx.fillStyle = '#ffffff';
  const fontSize = size * 0.55;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🧠', size / 2, size / 2);

  const buffer = canvas.toBuffer('image/png');
  const outputPath = join(__dirname, '../public', filename);
  writeFileSync(outputPath, buffer);

  console.log(`✅ Generated ${size}x${size} icon: ${outputPath}`);
}

// Generate PWA icons
generateIcon(192, 'pwa-192x192.png');
generateIcon(512, 'pwa-512x512.png');
