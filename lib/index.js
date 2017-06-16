const kcl = require('aws-kcl');
const { logger, livestreamLogger } = require('./util/logger');
const IngestionTracking = require('./record-processor');

const myConsumer = new IngestionTracking({
  logger,
  livestreamLogger,
});

kcl(myConsumer).run();
