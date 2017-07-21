const bunyan = require('bunyan');

const ingestionTCPStream = require('bunyan-logstash-tcp').createStream({
  host: process.env.LOGSTASH_HOST,
  port: process.env.LOGSTASH_PORT,
  retry_interval: 10000,
  max_connect_retries: Number.MAX_VALUE,
});

const livestreamOptions = {
  name: 'ingestion-tracking-worker-livestream',
  serializers: { err: bunyan.stdSerializers.err },
  streams: [{
    level: 'info',
    stream: ingestionTCPStream,
    reemitErrorEvents: true,
  }],
};

const livestreamLogger = bunyan.createLogger(livestreamOptions);

// udp errors will be reemitted here. figure out what to do with them later
livestreamLogger.on('error', () => { });

module.exports = livestreamLogger;
