import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create 32x32 favicon
const size = 32;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Background circle
ctx.fillStyle = '#667eea';
ctx.beginPath();
ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
ctx.fill();

// Brain shape (simplified)
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 20px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('🧠', size / 2, size / 2);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
const outputPath = join(__dirname, '../public/favicon.png');
writeFileSync(outputPath, buffer);

console.log('✅ Favicon generated:', outputPath);

// Create larger version for apple-touch-icon (180x180)
const largeSize = 180;
const largeCanvas = createCanvas(largeSize, largeSize);
const largeCtx = largeCanvas.getContext('2d');

// Background
largeCtx.fillStyle = '#667eea';
largeCtx.fillRect(0, 0, largeSize, largeSize);

// Border
largeCtx.strokeStyle = '#5568d3';
largeCtx.lineWidth = 4;
largeCtx.strokeRect(0, 0, largeSize, largeSize);

// Brain emoji
largeCtx.fillStyle = '#ffffff';
largeCtx.font = 'bold 100px Arial';
largeCtx.textAlign = 'center';
largeCtx.textBaseline = 'middle';
largeCtx.fillText('🧠', largeSize / 2, largeSize / 2);

const largeBuffer = largeCanvas.toBuffer('image/png');
const largeOutputPath = join(__dirname, '../public/apple-touch-icon.png');
writeFileSync(largeOutputPath, largeBuffer);

console.log('✅ Apple touch icon generated:', largeOutputPath);
