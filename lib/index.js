const kcl = require('aws-kcl');
const logger = require('./util/logger');
const IngestionTracking = require('./record-processor');

const myConsumer = new IngestionTracking({
  logger,
});

kcl(myConsumer).run();
