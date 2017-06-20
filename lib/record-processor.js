const consumer = require('@astronomer/kinesis-consumer');
const logger = require('./util/logger');
const livestreamLogger = require('./util/livestream-logger');
const kairosLogger = require('./util/kairos-logger');

const Consumer = consumer('astronomer-kinesis-ingestion-tracking');

class IngestionTracking extends Consumer {
  constructor() {
    super({ logger });

    this.livestreamLogger = livestreamLogger;
    this.kairosLogger = kairosLogger;
  }

  async processRecord({ record, checkpointer, currentRecord, totalRecords }) {
    const { data } = record;
    const jsonString = Buffer.from(data, 'base64').toString();
    const event = JSON.parse(jsonString);

    // main log that will go to elasticsearch
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

    // send the event to the livestream
    this.livestreamLogger.info({
      messageId: event.messageId,
      writeKey: event.appId || event.writeKey,
      rawClickstreamEvent: jsonString,
      type: event.type,
    });

    // log metrics and send to kairos
    this.kairosLogger.info({
      writeKey: event.appId || event.writeKey,
      receivedAtMillis: new Date(event.receivedAt).getTime(),
    });

    // checkpoint at the last record
    if (currentRecord === totalRecords) {
      await this.checkpoint(checkpointer);
    }
  }
}

module.exports = IngestionTracking;
