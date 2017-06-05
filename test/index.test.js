const { assert } = require('chai');
const createLogger = require('@astronomerio/astronomer-logger');
const IngestionTracking = require('../lib/record-processor.js');

describe('Kinesis Consumer Ingestion Tracking', () => {
  let consumer;

  beforeEach(() => {
    process.env.ASTRONOMER_APP_ID = 'app_id';
    process.env.ASTRONOMER_STREAM_NAME = 'stream';
    consumer = new IngestionTracking({
      logger: createLogger('integrator-worker', {
        logPath: './',
      }),
    });
  });

  it('should initialize with correct properties', () => {
    assert.ok(consumer.analytics);
  });
});
