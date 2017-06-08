const kcl = require('aws-kcl');
const assert = require('assert');
const createLogger = require('@astronomerio/astronomer-logger');
const IngestionTracking = require('./record-processor');

const myConsumer = new IngestionTracking({
  logger: createLogger('ingestion-tracking-worker', {
    logPath: './',
  }),
});

assert(myConsumer.analytics, 'Must provide analytics object');
kcl(myConsumer).run();
