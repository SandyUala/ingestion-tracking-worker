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

    this.logger.info({
      event: 'ingest_event',
      clickstreamEvent: event,
    });

    this.livestreamLogger.info({
      event,
      rawClickstreamEvent: jsonString,
    });

    // checkpoint at the last record
    if (currentRecord === totalRecords) {
      await this.checkpoint(checkpointer);
    }
  }
}

module.exports = IngestionTracking;
