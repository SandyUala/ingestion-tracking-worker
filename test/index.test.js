const { stub, spy } = require('sinon');
const fs = require('fs');
const { assert } = require('chai');
const IngestionTracking = require('../src/record-processor.js');

describe('Kinesis Consumer Ingestion Tracking', function () {
  let consumer;

  beforeEach(function () {
    process.env.ASTRONOMER_APP_ID = 'app_id';
    process.env.ASTRONOMER_STREAM_NAME = 'stream';
    consumer = new IngestionTracking();
  });

  it('should initialize with correct properties', function () {
    assert.ok(consumer.analytics);
  });
});