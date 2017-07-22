const async = require('async');
const { promisify } = require('util');
const promiseRetry = require('promise-retry');
const kairosLogger = require('./util/kairos-logger');

class IngestionTracking {
  constructor() {
    this.shardId = null;
    this.logger = kairosLogger;
  }

  async processRecord({ record, checkpointer, currentRecord, totalRecords }) {
    const { data } = record;
    const jsonString = Buffer.from(data, 'base64').toString();
    const event = JSON.parse(jsonString);

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

  initialize(initializeInput, completeCallback) {
    const { shardId } = initializeInput;
    this.shardId = shardId;
    completeCallback();
  }

  /**
   * @param {Object} processRecordsInput
   * @param {Object} processRecordsInput.records
   * @param {Object} processRecordsInput.checkpointer
   * @param {Function} callback
   */

  processRecords(processRecordsInput, completeCallback) {
    if (!processRecordsInput || !processRecordsInput.records) {
      completeCallback();
      return;
    }
    const records = processRecordsInput.records;

    const tasks = records.map((record, idx) => async () => {
      try {
        await this.processRecord({
          record,
          checkpointer: processRecordsInput.checkpointer,
          currentRecord: idx + 1,
          totalRecords: records.length,
        });
      } catch (e) {
        this.logger.error(e);
      }
    });

    async.series(tasks, () => {
      completeCallback();
    });
  }

  /**
   * @param {Object} shutdownInput
   * @param {Object} shutdownInput.checkpointer
   * @param {String} shutdownInput.reason
   */

  shutdown(shutdownInput, completeCallback) {
    if (shutdownInput.reason !== 'TERMINATE') {
      return completeCallback();
    }

    shutdownInput.checkpointer.checkpoint((err) => {
      if (err) this.logger.err(err);
      completeCallback();
    });
  }

  /**
   * Checkpoints with Kinesis.
   */

  async checkpoint(checkpointer, sequenceNumber) {
    // thenify the checkpoint method so we can promise retry it
    const checkpoint = promisify(checkpointer.checkpoint).bind(checkpointer);

    // if no sequence number, just checkpoint the latest given to the consumer
    if (!sequenceNumber) {
      // eslint-disable-next-line arrow-body-style
      return promiseRetry({ retries: 1 }, (retry) => {
        return checkpoint()
          .catch((err) => {
            if (err) {
              this.logger.error(err);
            }

            retry();
          });
      });
    }

    // eslint-disable-next-line arrow-body-style
    await promiseRetry({ retries: 1 }, (retry) => {
      return checkpoint(sequenceNumber)
        .catch((err) => {
          if (err) {
            this.logger.error(err);
          }

          retry();
        });
    });
  }
}

module.exports = IngestionTracking;
