const bunyan = require('bunyan');
const udp = require('@astronomer/bunyan-udp');

const ingestionUDPStream = udp.createStream({
  host: process.env.LOGSTASH_HOST,
  port: process.env.LOGSTASH_PORT,
});

const ingestionTrackingOptions = {
  name: 'ingestion-tracking-worker-kairos',
  serializers: { err: bunyan.stdSerializers.err },
  streams: [{
    level: 'info',
    stream: ingestionUDPStream,
    reemitErrorEvents: true,
  }],
};

const kairosLogger = bunyan.createLogger(ingestionTrackingOptions);

// udp errors will be reemitted here. figure out what to do with them later
kairosLogger.on('error', () => { });

module.exports = kairosLogger;
