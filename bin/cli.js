#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

program
  .name('fetch-client-generator')
  .description('A tool for generating fetch-based HTTP client code')
  .version(packageJson.version);

program
  .command('generate')
  .description('Generate fetch client code')
  .option('-i, --input <file>', 'input specification file')
  .option('-o, --output <file>', 'output file path')
  .action((options) => {
    console.log('Generating fetch client...');
    console.log('Input:', options.input);
    console.log('Output:', options.output);
    // Implementation will go here
  });

program.parse();