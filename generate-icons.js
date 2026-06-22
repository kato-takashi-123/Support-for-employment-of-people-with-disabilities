import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = './public/icons/icon.svg';
const outputDir = './public/icons';

async function generate() {
  try {
    const svgBuffer = fs.readFileSync(svgPath);

    // 1. Generate 512x512 icon
    console.log('Generating 512x512 icon...');
    await sharp(svgBuffer, { density: (512 / 200) * 72 })
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'icon-512.png'));

    // 2. Generate 192x192 icon
    console.log('Generating 192x192 icon...');
    await sharp(svgBuffer, { density: (192 / 200) * 72 })
      .resize(192, 192)
      .png()
      .toFile(path.join(outputDir, 'icon-192.png'));

    // 3. Generate 512x512 maskable icon with a slightly larger padding (optional/custom)
    // For maskable icon, we can use the same 512x512.
    console.log('Generating 512x512 maskable icon...');
    await sharp(svgBuffer, { density: (512 / 200) * 72 })
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'icon-maskable-512.png'));

    console.log('Successfully generated PWA icons!');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generate();
