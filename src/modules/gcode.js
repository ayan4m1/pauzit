import { createWriteStream, createReadStream } from 'fs';
import { lstat } from 'fs/promises';
import μs from 'microseconds';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';

import { getLogger } from './logging.js';

const log = getLogger('gcode');

const transformer = new Transform({
  transform: (chunk, _, callback) =>
    callback(null, chunk.toString('utf8').toUpperCase())
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
