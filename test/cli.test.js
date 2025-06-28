const { expect } = require('chai');
const { exec } = require('child_process');
const path = require('path');

describe('CLI', () => {
  it('should show help when no arguments provided', (done) => {
    const cliPath = path.join(__dirname, '../bin/cli.js');
    exec(`node ${cliPath} --help`, (error, stdout, stderr) => {
      expect(stdout).to.include('fetch-client-generator');
      expect(stdout).to.include('generate');
      done();
    });
  });

  it('should show version', (done) => {
    const cliPath = path.join(__dirname, '../bin/cli.js');
    exec(`node ${cliPath} --version`, (error, stdout, stderr) => {
      expect(stdout.trim()).to.match(/^\d+\.\d+\.\d+$/);
      done();
    });
  });
});