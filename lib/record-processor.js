const util = require('util');
const kcl = require('aws-kcl');
const consumer = require('@astronomer/kinesis-consumer');
const Analytics = require('analytics-node-kinesis');
const Facade = require('segmentio-facade');
const assert = require('assert');

const Consumer = consumer('astronomer-kinesis-ingestion-tracking');

class IngestionTracking extends Consumer {
  constructor() {
    super();
    const appId = process.env.ASTRONOMER_APP_ID;
    const stream = process.env.ASTRONOMER_STREAM_NAME;
    this.analytics = new Analytics(appId, {
      flushAt: 500,
      flushAfter: 30000,
      stream
    });
  }

  processRecord({ record, checkpointer }, callback) {
    const { sequenceNumber, data } = record;
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
      libVersion: lib.version
    };

    this.analytics.track({
      event: 'ingest_event',
      properties: track,
      userId: 'astronomer'
    });

    checkpointer.checkpoint(sequenceNumber, (err) => {
      // if (err)
      callback();
    });
  }
}

module.exports = IngestionTracking;