import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const svgPath = path.join(process.cwd(), 'public', 'icons', 'icon.svg');
const outDir = path.join(process.cwd(), 'public', 'icons');

async function generate() {
  try {
    const svgBuffer = await fs.readFile(svgPath);

    console.log('Generating 180x180 iOS touch icon...');
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(outDir, 'icon-180-v3.png'));

    console.log('Generating 192x192 PWA icon...');
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(outDir, 'icon-192-v3.png'));

    console.log('Generating 512x512 PWA icon...');
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(outDir, 'icon-512-v3.png'));

    console.log('Generating 512x512 PWA maskable icon...');
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(outDir, 'icon-maskable-512-v3.png'));

    // Also generate the standard unversioned files for compatibility/graceful fallback
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(outDir, 'icon-180.png'));

    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(outDir, 'icon-192.png'));

    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(outDir, 'icon-512.png'));

    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(outDir, 'icon-maskable-512.png'));

    console.log('Successfully generated all PNG PWA icons with cwd-relative paths and cache busting!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generate();
