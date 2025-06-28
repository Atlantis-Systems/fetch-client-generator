import { expect } from 'chai';
import { parseOpenAPISpec, generateFetchClient, generate } from '../index.js';
import { writeFileSync, unlinkSync } from 'fs';
import path from 'path';

const sampleOpenAPI = {
  "openapi": "3.0.1",
  "info": {
    "title": "Test API",
    "version": "1.0.0"
  },
  "paths": {
    "/users": {
      "get": {
        "operationId": "getUsers",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "operationId": "createUser",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Created"
          }
        }
      }
    }
  }
};

describe('fetch-client-generator', () => {
  let testSpecPath;

  beforeEach(() => {
    testSpecPath = path.join(process.cwd(), 'test-spec.json');
    writeFileSync(testSpecPath, JSON.stringify(sampleOpenAPI, null, 2));
  });

  afterEach(() => {
    try {
      unlinkSync(testSpecPath);
    } catch (err) {
      // File might not exist
    }
  });

  describe('parseOpenAPISpec', () => {
    it('should parse OpenAPI specification', () => {
      const result = parseOpenAPISpec(testSpecPath);
      
      expect(result).to.have.property('info');
      expect(result).to.have.property('endpoints');
      expect(result).to.have.property('schemas');
      expect(result.info.title).to.equal('Test API');
      expect(result.endpoints).to.have.length(2);
    });
  });

  describe('generateFetchClient', () => {
    it('should generate fetch client code', () => {
      const parsedSpec = parseOpenAPISpec(testSpecPath);
      const clientCode = generateFetchClient(parsedSpec);
      
      expect(clientCode).to.include('class ApiClient');
      expect(clientCode).to.include('async getUsers()');
      expect(clientCode).to.include('async createUser(data)');
      expect(clientCode).to.include('fetch(url, config)');
    });
  });

  describe('generate', () => {
    it('should generate and return client code', () => {
      const clientCode = generate(testSpecPath);
      
      expect(clientCode).to.be.a('string');
      expect(clientCode).to.include('class ApiClient');
    });
  });
});