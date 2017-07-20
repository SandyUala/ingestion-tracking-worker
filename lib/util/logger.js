const bunyan = require('bunyan');

const ingestionUDPStream = require('bunyan-logstash-tcp').createStream({
  host: process.env.LOGSTASH_HOST,
  port: process.env.LOGSTASH_PORT,
});

const ingestionTrackingOptions = {
  name: 'ingestion-tracking-worker',
  serializers: { err: bunyan.stdSerializers.err },
  streams: [{
    level: 'info',
    stream: ingestionUDPStream,
    reemitErrorEvents: true,
  }],
};

const logger = bunyan.createLogger(ingestionTrackingOptions);

// udp errors will be reemitted here. figure out what to do with them later
logger.on('error', () => { });

module.exports = logger;
