// Run: node scripts/generate-icons.js
// Creates simple PNG icons for PWA
const fs = require('fs');

function createPNG(size) {
  // Minimal valid PNG with purple background
  // For production, replace with proper icon files
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#6C5CE7';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Dollar sign
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('₫', size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

try {
  [192, 512].forEach(size => {
    const buf = createPNG(size);
    fs.writeFileSync(`public/icon-${size}.png`, buf);
    console.log(`Created icon-${size}.png`);
  });
} catch (e) {
  console.log('canvas not available, using SVG fallback');
  // Create minimal 1x1 PNG as placeholder - replace with real icons
  const minPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  [192, 512].forEach(size => {
    fs.writeFileSync(`public/icon-${size}.png`, minPNG);
    console.log(`Created placeholder icon-${size}.png`);
  });
}
