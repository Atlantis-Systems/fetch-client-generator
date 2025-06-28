import { expect } from 'chai';
import fetchClientGenerator from '../index.js';

describe('fetch-client-generator', () => {
  it('should export an object', () => {
    expect(fetchClientGenerator).to.be.an('object');
  });
});