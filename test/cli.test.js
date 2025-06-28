import { expect } from 'chai';
import { exec, spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  describe('watch functionality', () => {
    const testInputPath = path.join(__dirname, 'test-input.json');
    const testOutputPath = path.join(__dirname, 'test-output.js');
    const sampleSpec = {
      "openapi": "3.0.1",
      "info": { "title": "Watch Test API", "version": "1.0.0" },
      "paths": {
        "/test": {
          "get": {
            "operationId": "getTest",
            "responses": { "200": { "description": "OK" } }
          }
        }
      }
    };

    beforeEach(() => {
      writeFileSync(testInputPath, JSON.stringify(sampleSpec, null, 2));
    });

    afterEach(() => {
      [testInputPath, testOutputPath].forEach(file => {
        if (existsSync(file)) {
          unlinkSync(file);
        }
      });
    });

    it('should regenerate client when input file changes', function(done) {
      this.timeout(5000);
      
      const cliPath = path.join(__dirname, '../bin/cli.js');
      const child = spawn('node', [cliPath, 'generate', '-i', testInputPath, '-o', testOutputPath, '--watch'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let outputReceived = false;
      let regenerateReceived = false;

      child.stdout.on('data', (data) => {
        const output = data.toString();
        
        if (output.includes('✓ Fetch client generated successfully!') && !outputReceived) {
          outputReceived = true;
          expect(existsSync(testOutputPath)).to.be.true;
          
          setTimeout(() => {
            const updatedSpec = { ...sampleSpec };
            updatedSpec.info.title = "Updated Watch Test API";
            writeFileSync(testInputPath, JSON.stringify(updatedSpec, null, 2));
          }, 100);
        }
        
        if (output.includes('File changed, regenerating...') && !regenerateReceived) {
          regenerateReceived = true;
        }
        
        if (outputReceived && regenerateReceived && output.includes('✓ Fetch client generated successfully!')) {
          const clientCode = readFileSync(testOutputPath, 'utf8');
          expect(clientCode).to.include('class ApiClient');
          child.kill('SIGINT');
          done();
        }
      });

      child.stderr.on('data', (data) => {
        console.error('CLI stderr:', data.toString());
      });

      child.on('error', (error) => {
        done(error);
      });
    });

    it('should handle watch mode with invalid input gracefully', function(done) {
      this.timeout(3000);
      
      const cliPath = path.join(__dirname, '../bin/cli.js');
      const child = spawn('node', [cliPath, 'generate', '-i', testInputPath, '-o', testOutputPath, '--watch'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let initialGeneration = false;

      child.stdout.on('data', (data) => {
        const output = data.toString();
        
        if (output.includes('✓ Fetch client generated successfully!') && !initialGeneration) {
          initialGeneration = true;
          
          setTimeout(() => {
            writeFileSync(testInputPath, 'invalid json');
          }, 100);
        }
      });

      child.stderr.on('data', (data) => {
        const errorOutput = data.toString();
        if (errorOutput.includes('Error generating client:')) {
          child.kill('SIGINT');
          done();
        }
      });

      child.on('error', (error) => {
        done(error);
      });
    });
  });
});