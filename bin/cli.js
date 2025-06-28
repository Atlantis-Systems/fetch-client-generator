#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { generate } from '../index.js';

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
    if (!options.input) {
      console.error('Error: Input file is required');
      process.exit(1);
    }

    if (!options.output) {
      console.error('Error: Output file is required');
      process.exit(1);
    }

    try {
      console.log('Generating fetch client...');
      console.log('Input:', options.input);
      console.log('Output:', options.output);

      const clientCode = generate(options.input);
      writeFileSync(options.output, clientCode, 'utf8');
      
      console.log('✓ Fetch client generated successfully!');
    } catch (error) {
      console.error('Error generating client:', error.message);
      process.exit(1);
    }
  });

program.parse();