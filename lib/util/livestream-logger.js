const bunyan = require('bunyan');
const udp = require('@astronomer/bunyan-udp');

const livestreamUDPStream = udp.createStream({
  host: process.env.LOGSTASH_HOST,
  port: process.env.LOGSTASH_PORT,
});

const livestreamOptions = {
  name: 'ingestion-tracking-worker-livestream',
  serializers: { err: bunyan.stdSerializers.err },
  streams: [{
    level: 'info',
    stream: livestreamUDPStream,
    reemitErrorEvents: true,
  }],
};

const livestreamLogger = bunyan.createLogger(livestreamOptions);

// udp errors will be reemitted here. figure out what to do with them later
livestreamLogger.on('error', () => { });

module.exports = livestreamLogger;
