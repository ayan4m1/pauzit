import { createWriteStream, createReadStream } from 'fs';
import { lstat } from 'fs/promises';
import μs from 'microseconds';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';

import { getLogger } from './logging.js';

const log = getLogger('gcode');

const extruderChangePattern = /^T[0-9]+ ; change extruder$/gm;
const toolChangePattern =
  /^; CP TOOLCHANGE START$\n^; toolchange #([0-9]+)$\n^; material : (\w+) -> (\w+)$\n^;-+$\n^((.|\n)+)$\n^; CP TOOLCHANGE UNLOAD$/gm;
const transformer = new Transform({
  transform: (chunk, _, callback) =>
    callback(
      null,
      chunk
        .toString('utf8')
        .replace(extruderChangePattern, '')
        .replace(
          toolChangePattern,
          (_, toolChange, oldMaterial, newMaterial, innerCode) => `
; FILAMENT SWAP START
; toolchange #${toolChange}
; material : ${oldMaterial} -> ${newMaterial}
${innerCode}
M600
; CP TOOLCHANGE UNLOAD`
        )
    )
});

export const processFile = async (input, output) => {
  const { size } = await lstat(input);
  const writeStream = createWriteStream(output);
  const readStream = createReadStream(input);

  try {
    const startTime = μs.now();

    await pipeline(readStream, transformer, writeStream);

    const elapsedTime = μs.since(startTime);
    const bitRate = size / (elapsedTime / 1e6) / 1e6;

    log.info(
      `Parsed ${size} bytes in ${Math.round(elapsedTime)} μs (${bitRate.toFixed(
        2
      )} MB/s)`
    );
    return true;
  } catch (error) {
    log.error(error.message);
    log.error(error.stack);
  }

  return false;
};
