import { program } from 'commander';
import { existsSync } from 'fs';
import { basename } from 'path';

import { processFile } from './modules/gcode.js';
import { getLogger } from './modules/logging.js';

const log = getLogger('app');

program
  .version('0.1.0')
  .command('convert <input> [output]', { isDefault: true })
  .action(async (input, output) => {
    if (!output) {
      output = `${basename(input, '.gcode')}.pauz.gcode`;
    }

    if (!existsSync(input)) {
      return log.error('Input file does not exist!');
    }

    if (existsSync(output)) {
      return log.error('Output file already exists!');
    }

    log.info(`Converting ${input} to ${output}`);

    await processFile(input, output);
  });

program.parse();
