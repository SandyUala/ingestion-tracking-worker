const kcl = require('aws-kcl');
const IngestionTracking = require('./record-processor');

const myConsumer = new IngestionTracking();

kcl(myConsumer).run();
