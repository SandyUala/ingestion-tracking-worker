const bunyan = require('bunyan');
const udp = require('@astronomer/bunyan-udp');

const ingestionUDPStream = udp.createStream({
  host: process.env.LIVESTREAM_LOGSTASH_HOST,
  port: process.env.LIVESTREAM_LOGSTASH_PORT,
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

const livestreamUDPStream = udp.createStream({
  host: process.env.LOGSTASH_HOST,
  port: process.env.LOGSTASH_PORT,
});

const livestreamOptions = {
  name: 'ingestion-tracking-worker',
  serializers: { err: bunyan.stdSerializers.err },
  streams: [{
    level: 'info',
    stream: livestreamUDPStream,
    reemitErrorEvents: true,
  }],
};

const logger = bunyan.createLogger(ingestionTrackingOptions);
const livestreamLogger = bunyan.createLogger(livestreamOptions);

// udp errors will be reemitted here. figure out what to do with them later
livestreamLogger.on('error', () => { });

// udp errors will be reemitted here. figure out what to do with them later
logger.on('error', () => { });

exports.livestreamLogger = livestreamLogger;
exports.logger = logger;
