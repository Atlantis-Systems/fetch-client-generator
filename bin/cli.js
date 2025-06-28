#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import chokidar from 'chokidar';
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
  .option('-w, --watch', 'watch input file for changes and regenerate automatically')
  .action((options) => {
    if (!options.input) {
      console.error('Error: Input file is required');
      process.exit(1);
    }

    if (!options.output) {
      console.error('Error: Output file is required');
      process.exit(1);
    }

    const generateClient = () => {
      try {
        console.log('Generating fetch client...');
        console.log('Input:', options.input);
        console.log('Output:', options.output);

        const clientCode = generate(options.input);
        writeFileSync(options.output, clientCode, 'utf8');
        
        console.log('✓ Fetch client generated successfully!');
      } catch (error) {
        console.error('Error generating client:', error.message);
        if (!options.watch) {
          process.exit(1);
        }
      }
    };

    // Generate initially
    generateClient();

    // If watch flag is set, watch for changes
    if (options.watch) {
      console.log(`Watching ${options.input} for changes...`);
      
      const watcher = chokidar.watch(options.input, {
        persistent: true,
        ignoreInitial: true
      });

      watcher.on('change', () => {
        console.log('\nFile changed, regenerating...');
        generateClient();
      });

      watcher.on('error', (error) => {
        console.error('Watcher error:', error);
      });

      // Keep the process alive
      process.on('SIGINT', () => {
        console.log('\nStopping file watcher...');
        watcher.close();
        process.exit(0);
      });
    }
  });

program.parse();