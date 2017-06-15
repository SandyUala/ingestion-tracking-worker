const consumer = require('@astronomer/kinesis-consumer');
const Facade = require('segmentio-facade');

const Consumer = consumer('astronomer-kinesis-ingestion-tracking');

class IngestionTracking extends Consumer {
  async processRecord({ record, checkpointer, currentRecord, totalRecords }) {
    const { data } = record;
    const json = JSON.parse(Buffer.from(data, 'base64').toString());
    const msg = new Facade(json);
    const lib = msg.library();

    this.logger.info({
      event: 'ingest_event',
      type: msg.field('type'),
      writeKey: msg.field('appId'),
      messageId: msg.field('messageId'),
      sentAt: msg.field('sentAt'),
      receivedAt: msg.field('receivedAt'),
      processedAt: new Date(),
      shardId: this.shardId,
      libName: lib.name,
      libVersion: lib.version,
      userId: msg.field('userId'),
      anonymousId: msg.field('anonymousId'),
    });

    // checkpoint at the last record
    if (currentRecord === totalRecords) {
      await this.checkpoint(checkpointer);
    }
  }
}

module.exports = IngestionTracking;
