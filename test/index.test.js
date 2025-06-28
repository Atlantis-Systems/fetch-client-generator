const { expect } = require('chai');
const fetchClientGenerator = require('../index');

describe('fetch-client-generator', () => {
  it('should export an object', () => {
    expect(fetchClientGenerator).to.be.an('object');
  });
});