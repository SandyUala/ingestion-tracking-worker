const consumer = require('@astronomer/kinesis-consumer');
const Analytics = require('analytics-node-kinesis');
const Facade = require('segmentio-facade');

const Consumer = consumer('astronomer-kinesis-ingestion-tracking');

class IngestionTracking extends Consumer {
  constructor(options) {
    super(options);
    const appId = process.env.ASTRONOMER_APP_ID;
    const stream = process.env.ASTRONOMER_STREAM_NAME;
    this.analytics = new Analytics(appId, {
      flushAt: 500,
      flushAfter: 30000,
      stream,
    });
  }

  processRecord({ record, checkpointer, currentRecord, totalRecords }, callback) {
    const { data } = record;
    const json = JSON.parse(Buffer.from(data, 'base64').toString());
    const msg = new Facade(json);
    const lib = msg.library();

    const track = {
      type: msg.field('type'),
      appId: msg.field('appId'),
      messageId: msg.field('messageId'),
      sentAt: msg.field('sentAt'),
      receivedAt: msg.field('receivedAt'),
      processedAt: new Date(),
      shardId: this.shardId,
      libName: lib.name,
      libVersion: lib.version,
    };

    this.analytics.track({
      event: 'ingest_event',
      properties: track,
      userId: 'astronomer',
    });

    // checkpoint at the last record
    if (currentRecord === totalRecords) {
      checkpointer.checkpoint((err) => {
        // if (err)
        callback();
      });
    } else {
      callback();
    }
  }
}

module.exports = IngestionTracking;
