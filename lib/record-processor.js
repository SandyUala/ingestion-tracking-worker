const consumer = require('@astronomer/kinesis-consumer');

const Consumer = consumer('astronomer-kinesis-ingestion-tracking');

class IngestionTracking extends Consumer {
  constructor(options) {
    super(options);

    const { livestreamLogger } = options;
    this.livestreamLogger = livestreamLogger;
  }

  async processRecord({ record, checkpointer, currentRecord, totalRecords }) {
    const { data } = record;
    const jsonString = Buffer.from(data, 'base64').toString();
    const event = JSON.parse(jsonString);

    const log = {
      event: 'ingest_event',
      userId: event.userId,
      anonymousId: event.anonymousId,
      writeKey: event.appId || event.writeKey,
      receivedAt: event.receivedAt,
      sentAt: event.sentAt,
      type: event.type,
      shardId: this.shardId,
    };

    if (event.timestamp) log.timestamp = event.timestamp;
    this.logger.info(log);

    this.livestreamLogger.info({
      messageId: event.messageId,
      writeKey: event.appId || event.writeKey,
      rawClickstreamEvent: jsonString,
      type: event.type,
    });

    // checkpoint at the last record
    if (currentRecord === totalRecords) {
      await this.checkpoint(checkpointer);
    }
  }
}

module.exports = IngestionTracking;
