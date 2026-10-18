import fs from 'node:fs';
import zlib from 'node:zlib';

function createPNG(width, height, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
      }
    }
    return (c ^ 0xffffffff) | 0;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw image data with scanlines (filter byte 0 per line)
  const lineSize = 1 + width * 3;
  const rawData = Buffer.alloc(lineSize * height);
  for (let y = 0; y < height; y++) {
    const offset = y * lineSize;
    rawData[offset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = offset + 1 + x * 3;
      // Gradient effect
      const factor = (x + y) / (width + height);
      rawData[pxOffset] = Math.min(255, Math.floor(r * (1 - factor * 0.4) + 124 * factor));
      rawData[pxOffset + 1] = Math.min(255, Math.floor(g * (1 - factor * 0.4) + 58 * factor));
      rawData[pxOffset + 2] = Math.min(255, Math.floor(b * (1 - factor * 0.3) + 237 * factor));
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idat = chunk('IDAT', idatData);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, chunk('IHDR', ihdr), idat, iend]);
}

const pwa192 = createPNG(192, 192, 2, 132, 199);
const pwa512 = createPNG(512, 512, 2, 132, 199);
const appleIcon = createPNG(180, 180, 2, 132, 199);

if (!fs.existsSync('./public')) fs.mkdirSync('./public', { recursive: true });
fs.writeFileSync('./public/pwa-192x192.png', pwa192);
fs.writeFileSync('./public/pwa-512x512.png', pwa512);
fs.writeFileSync('./public/apple-touch-icon.png', appleIcon);
console.log('PNG icons created successfully!');
