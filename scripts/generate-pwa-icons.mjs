import { createWriteStream } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUTS = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
];

const OUTPUT_DIR = join(__dirname, '../public');

function ensureDir(path) {
  return import('node:fs/promises').then(({ mkdir }) => mkdir(path, { recursive: true })).catch(() => {});
}

async function generate() {
  await ensureDir(OUTPUT_DIR);
  for (const { name, size } of OUTPUTS) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#1e40af');
    gradient.addColorStop(1, '#9333ea');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const circleMargin = size * 0.12;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.23)';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - circleMargin, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(size * 0.5, size * 0.28);
    ctx.bezierCurveTo(size * 0.68, size * 0.28, size * 0.78, size * 0.4, size * 0.78, size * 0.54);
    ctx.bezierCurveTo(size * 0.78, size * 0.68, size * 0.68, size * 0.8, size * 0.5, size * 0.8);
    ctx.bezierCurveTo(size * 0.32, size * 0.8, size * 0.22, size * 0.68, size * 0.22, size * 0.54);
    ctx.bezierCurveTo(size * 0.22, size * 0.4, size * 0.32, size * 0.28, size * 0.5, size * 0.28);
    ctx.fill();

    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = size * 0.03;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(size * 0.5, size * 0.32);
    ctx.lineTo(size * 0.5, size * 0.76);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size * 0.35, size * 0.4);
    ctx.lineTo(size * 0.65, size * 0.64);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size * 0.65, size * 0.4);
    ctx.lineTo(size * 0.35, size * 0.64);
    ctx.stroke();

    const filePath = join(OUTPUT_DIR, name);
    const out = createWriteStream(filePath);
    out.write(canvas.toBuffer('image/png'));
    out.close();
    console.log('Generated', filePath);
  }
}

generate().catch((error) => {
  console.error('Failed to generate PWA icons', error);
  process.exit(1);
});

