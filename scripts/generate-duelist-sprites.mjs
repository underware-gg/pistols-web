#!/usr/bin/env node

import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(projectRoot, 'public/images/duelist');
const outputRoot = path.join(sourceRoot, 'sprites');
const duelists = ['female', 'male'];
const animations = ['idle', 'twosteps', 'shoot'];
const maximumFrameDimension = 1024;
const atlasVersion = 2;

const getFrameNumber = (filename) => Number(filename.slice(6, 9));

async function buildAtlas(duelist, animation) {
  const directory = path.join(sourceRoot, duelist, animation);
  const filenames = (await readdir(directory))
    .filter((filename) => /^frame_\d{3}\.png$/.test(filename))
    .sort();

  if (filenames.length === 0) throw new Error(`No frames in ${duelist}/${animation}`);

  const firstFramePath = path.join(directory, filenames[0]);
  const sourceMetadata = await sharp(firstFramePath).metadata();
  const sourceWidth = sourceMetadata.width;
  const sourceHeight = sourceMetadata.height;
  if (!sourceWidth || !sourceHeight) throw new Error(`Could not read ${firstFramePath}`);

  const scale = Math.min(1, maximumFrameDimension / sourceWidth, maximumFrameDimension / sourceHeight);
  const frameWidth = Math.round(sourceWidth * scale);
  const frameHeight = Math.round(sourceHeight * scale);
  const columns = Math.min(4, filenames.length);
  const rows = Math.ceil(filenames.length / columns);
  const atlasWidth = frameWidth * columns;
  const atlasHeight = frameHeight * rows;

  if (atlasWidth > 4096 || atlasHeight > 4096) {
    throw new Error(`Atlas exceeds 4096px: ${duelist}/${animation} is ${atlasWidth}x${atlasHeight}`);
  }

  const composites = await Promise.all(filenames.map(async (filename, index) => {
    const framePath = path.join(directory, filename);
    const metadata = await sharp(framePath).metadata();
    if (metadata.width !== sourceWidth || metadata.height !== sourceHeight) {
      throw new Error(`Mismatched frame dimensions: ${framePath}`);
    }

    const input = await sharp(framePath)
      .resize(frameWidth, frameHeight, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
      .png()
      .toBuffer();

    return {
      input,
      left: (index % columns) * frameWidth,
      top: Math.floor(index / columns) * frameHeight,
    };
  }));

  const filename = `${duelist}-${animation}.png`;
  const outputPath = path.join(outputRoot, filename);
  await sharp({
    create: {
      width: atlasWidth,
      height: atlasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);

  const writtenMetadata = await sharp(outputPath).metadata();
  if (writtenMetadata.width !== atlasWidth || writtenMetadata.height !== atlasHeight) {
    throw new Error(`Atlas verification failed: ${duelist}/${animation}`);
  }

  return {
    duelist,
    animation,
    src: `/images/duelist/sprites/${filename}?v=${atlasVersion}`,
    sourceFrame: { width: sourceWidth, height: sourceHeight },
    frame: { width: frameWidth, height: frameHeight, count: filenames.length },
    atlas: { width: atlasWidth, height: atlasHeight, columns, rows },
    frames: filenames.map((frameFilename, index) => ({
      frame: getFrameNumber(frameFilename),
      column: index % columns,
      row: Math.floor(index / columns),
    })),
  };
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const atlases = [];
for (const duelist of duelists) {
  for (const animation of animations) {
    atlases.push(await buildAtlas(duelist, animation));
  }
}

await writeFile(
  path.join(outputRoot, 'metadata.json'),
  `${JSON.stringify({ version: atlasVersion, atlases }, null, 2)}\n`,
);

console.log(`Generated ${atlases.length} duelist atlases in public/images/duelist/sprites`);
