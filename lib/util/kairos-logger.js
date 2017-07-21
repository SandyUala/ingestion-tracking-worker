const bunyan = require('bunyan');

const ingestionTCPStream = require('bunyan-logstash-tcp').createStream({
  host: process.env.LOGSTASH_HOST,
  port: process.env.LOGSTASH_PORT,
  retry_interval: 10000,
  max_connect_retries: Number.MAX_VALUE,
});

const ingestionTrackingOptions = {
  name: 'ingestion-tracking-worker-kairos',
  serializers: { err: bunyan.stdSerializers.err },
  streams: [{
    level: 'info',
    stream: ingestionTCPStream,
    reemitErrorEvents: true,
  }],
};

const kairosLogger = bunyan.createLogger(ingestionTrackingOptions);

// udp errors will be reemitted here. figure out what to do with them later
kairosLogger.on('error', () => { });

module.exports = kairosLogger;
