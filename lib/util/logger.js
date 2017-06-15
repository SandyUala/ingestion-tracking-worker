const bunyan = require('bunyan');
const udp = require('@astronomer/bunyan-udp');

const name = 'ingestion-tracking-worker';

function getDefaultStreams() {
  const streams = [];

  const udpStream = udp.createStream({
    host: process.env.LOGSTASH_HOST,
    port: process.env.LOGSTASH_PORT,
  });

  streams.push({
    level: 'info',
    stream: udpStream,
    reemitErrorEvents: true,
  });

  return streams;
}

const options = {
  name,
  serializers: { err: bunyan.stdSerializers.err },
  streams: getDefaultStreams(),
};

const log = bunyan.createLogger(options);

// udp errors will be reemitted here. figure out what to do with them later
log.on('error', () => {

});

module.exports = log;
