#!/usr/bin/env node

const { program } = require('commander');
const packageJson = require('../package.json');

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