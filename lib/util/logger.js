const KinesisWritable = require('aws-kinesis-writable');
const bunyan = require('bunyan');

const kinesis = new KinesisWritable({
  region: 'us-east-1',
  streamName: 'ingestion-tracking',
  partitionKey: (msg) => {
    const event = JSON.parse(msg);
    return event.userId || event.anonymousId;
  },
  buffer: {
    lenght: 100, // or when 100 messages are in the queue
  },
});

const ingestionTrackingOptions = {
  name: 'ingestion-tracking-worker',
  serializers: { err: bunyan.stdSerializers.err },
  streams: [{
    level: 'info',
    stream: kinesis,
    reemitErrorEvents: true,
  }],
};

const logger = bunyan.createLogger(ingestionTrackingOptions);

// udp errors will be reemitted here. figure out what to do with them later
logger.on('error', () => { });

module.exports = logger;
