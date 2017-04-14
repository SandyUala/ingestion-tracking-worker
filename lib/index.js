const kcl = require('aws-kcl');
const assert = require('assert');
const IngestionTracking = require('./record-processor');

const myConsumer = new IngestionTracking();
assert(myConsumer.analytics, 'Must provide analytics object');
kcl(myConsumer).run();