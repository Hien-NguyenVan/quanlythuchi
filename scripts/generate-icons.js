const fs = require('fs');
const path = require('path');

// Generates minimal valid PNG files with purple gradient background and "₫" text
// Using raw PNG construction (no external dependencies needed)

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([len, typeAndData, crc]);
}

function createPNG(size) {
  const { deflateSync } = require('zlib');

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // IDAT - pixel data
  const rawData = Buffer.alloc(size * (size * 3 + 1)); // +1 for filter byte per row

  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 3 + 1);
    rawData[rowStart] = 0; // filter: none

    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 3;

      // Purple gradient background (#6C5CE7 -> #a855f7)
      const t = (x + y) / (size * 2);
      const r = Math.round(108 + t * (168 - 108));
      const g = Math.round(92 + t * (85 - 92));
      const b = Math.round(231 + t * (247 - 231));

      // Rounded corners
      const radius = size * 0.22;
      const cx = x < radius ? radius : (x > size - radius - 1 ? size - radius - 1 : x);
      const cy = y < radius ? radius : (y > size - radius - 1 ? size - radius - 1 : y);
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      if (dist > radius) {
        rawData[px] = 0;
        rawData[px + 1] = 0;
        rawData[px + 2] = 0;
        continue;
      }

      // Draw ₫ symbol in center
      const centerX = size / 2;
      const centerY = size / 2;
      const charRadius = size * 0.28;
      const dx = x - centerX;
      const dy = y - centerY;
      const charDist = Math.sqrt(dx * dx + dy * dy);

      // Simple circle "coin" shape
      if (charDist < charRadius && charDist > charRadius * 0.7) {
        rawData[px] = 255;
        rawData[px + 1] = 255;
        rawData[px + 2] = 255;
      } else if (Math.abs(dx) < size * 0.03 && Math.abs(dy) < charRadius * 0.9) {
        // Vertical line of ₫
        rawData[px] = 255;
        rawData[px + 1] = 255;
        rawData[px + 2] = 255;
      } else if (Math.abs(dy - charRadius * 0.15) < size * 0.025 && dx > -charRadius * 0.6 && dx < charRadius * 0.6) {
        // Horizontal line
        rawData[px] = 255;
        rawData[px + 1] = 255;
        rawData[px + 2] = 255;
      } else {
        rawData[px] = r;
        rawData[px + 1] = g;
        rawData[px + 2] = b;
      }
    }
  }

  const compressed = deflateSync(rawData);

  // Build PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const chunks = [
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0)),
  ];

  return Buffer.concat(chunks);
}

[192, 512].forEach((size) => {
  const png = createPNG(size);
  const outPath = path.join(__dirname, '..', 'public', `icon-${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`✅ Created icon-${size}.png (${png.length} bytes)`);
});
