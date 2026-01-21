// Logger factory for creating MongoDB-persisted loggers
const pino = require('pino');
const { Writable } = require('stream');
const mongoose = require('mongoose');

class MongoLogWriter extends Writable {
  constructor(LogsModel) {
    super({ objectMode: false });
    this.LogsModel = LogsModel;
  }

  _write(chunk, encoding, callback) {
    const self = this;
    
    try {
      // Parse log entry from stream chunk
      const logEntryString = chunk.toString();
      const parsedLogData = JSON.parse(logEntryString);
      
      // Persist only when database connection is active
      if (mongoose.connection.readyState === 1) {
        // Create log document with parsed data
        const logDocument = new this.LogsModel({
          level: parsedLogData.level || 30,
          time: new Date(parsedLogData.time),
          msg: parsedLogData.msg || '',
          method: parsedLogData.method,
          url: parsedLogData.url,
          statusCode: parsedLogData.statusCode
        });
        
        // Non-blocking save operation to avoid blocking the stream
        logDocument.save().catch(saveError => {
          console.error('Failed to persist log entry:', saveError.message);
        });
      }
    } catch (parseError) {
      // Silently ignore malformed log entries to prevent stream errors
      console.error('Log parsing error:', parseError.message);
    }
    
    callback();
  }
}

function createLogger(LogsModel, logLevel = 'info') {
  const mongoStream = new MongoLogWriter(LogsModel);
  
  return pino({ level: logLevel }, mongoStream);
}

module.exports = {
  createLogger,
  MongoLogWriter
};
