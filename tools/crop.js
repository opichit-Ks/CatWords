// CatWords asset tool: decode PNG, find the character card edge, crop a portrait.
// Usage:
//   node tools/crop.js <src.png> <dst.png> [x y w h]   -- explicit region
//   node tools/crop.js <src.png> <dst.png> portrait     -- auto portrait crop
'use strict';
const fs = require('fs');
const zlib = require('zlib');

// ---- PNG decode (bit depth 8, color types 2 RGB and 6 RGBA) ----
function decodePNG(path) {
  const buf = fs.readFileSync(path);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('Not a PNG: ' + path);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];
  if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) {
    throw new Error(`Unsupported PNG format: bitDepth=${bitDepth} colorType=${colorType}`);
  }
  const bpp = colorType === 6 ? 4 : 3;
  const stride = width * bpp;
  const idat = [];
  let offset = 8;
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') idat.push(buf.slice(offset + 8, offset + 8 + length));
    offset += 12 + length;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const out = Buffer.alloc(height * stride);
  let prev = Buffer.alloc(stride);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const cur = Buffer.from(raw.slice(pos, pos + stride));
    pos += stride;
    for (let x = 0; x < stride; x++) {
      const left = x >= bpp ? cur[x - bpp] : 0;
      const up = prev[x];
      const upLeft = x >= bpp ? prev[x - bpp] : 0;
      let value = cur[x];
      if (filter === 1) value = (value + left) & 255;
      else if (filter === 2) value = (value + up) & 255;
      else if (filter === 3) value = (value + ((left + up) >> 1)) & 255;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        const predictor = (pa <= pb && pa <= pc) ? left : (pb <= pc) ? up : upLeft;
        value = (value + predictor) & 255;
      } else if (filter !== 0) throw new Error(`Unknown PNG filter ${filter}`);
      cur[x] = value;
    }
    cur.copy(out, y * stride);
    prev = cur;
  }
  return { width, height, bpp, data: out };
}

// ---- PNG encode (RGBA, bit depth 8) ----
function encodePNG(width, height, rgba) {
  const bpp = 4;
  const stride = width * bpp;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: None
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const chunk = (type, data) => {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, 'ascii');
    data.copy(out, 8);
    const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
    out.writeUInt32BE(crc >>> 0, 8 + data.length);
    return out;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// CRC32 (standard PNG table)
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function cropRegion(src, dst, x, y, w, h) {
  const img = decodePNG(src);
  if (x + w > img.width || y + h > img.height || x < 0 || y < 0) {
    throw new Error(`Crop region ${x},${y},${w},${h} exceeds ${img.width}x${img.height}`);
  }
  const out = Buffer.alloc(w * h * 4);
  const srcStride = img.width * 4;
  const dstStride = w * 4;
  for (let row = 0; row < h; row++) {
    const srcStart = ((y + row) * srcStride) + (x * 4);
    img.data.copy(out, row * dstStride, srcStart, srcStart + dstStride);
  }
  fs.writeFileSync(dst, encodePNG(w, h, out));
  console.log(`Cropped ${dst}: ${w}x${h} from ${src} @(${x},${y})`);
}

// Auto portrait: find the seam where the card's background gives way to the
// neighbouring card (top band, above the character), crop down to the white
// info card which starts at ~61% of the strip height.
function autoPortrait(src, dst) {
  const img = decodePNG(src);
  const w = img.width;
  const h = img.height;
  const px = (x, y) => img.data[(y * w + x) * 4];

  // Top band column averages (y 6..28, above the characters' heads) to locate
  // the right edge of this card's own background. The character may interrupt
  // the band, so we keep the LAST column that still matches the card colour.
  const colAvg = (x) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = 6; y < 28 && y < h; y++) {
      r += img.data[(y * w + x) * 4];
      g += img.data[(y * w + x) * 4 + 1];
      b += img.data[(y * w + x) * 4 + 2];
      n++;
    }
    return [r / n, g / n, b / n];
  };
  const base = colAvg(3);
  let lastMatch = 3;
  for (let x = 4; x < w - 1; x++) {
    const c = colAvg(x);
    const dist = Math.abs(c[0] - base[0]) + Math.abs(c[1] - base[1]) + Math.abs(c[2] - base[2]);
    if (dist <= 45) lastMatch = x;
  }
  // If the whole band is one colour (no neighbour bleed), keep full width.
  const width = lastMatch >= w - 3 ? w : lastMatch + 1;
  // White info card begins around 61% of the strip height.
  const height = Math.round(h * 0.61);
  cropRegion(src, dst, 0, 0, width, height);
}

const [,, src, dst, mode, x, y, w, h] = process.argv;
if (!src || !dst) {
  console.log('Usage: node tools/crop.js <src.png> <dst.png> [x y w h | portrait]');
  process.exit(1);
}
if (mode === 'portrait') autoPortrait(src, dst);
else cropRegion(src, dst, Number(x), Number(y), Number(w), Number(h));
