// Middleware builder for HTTP request tracking
class MiddlewareBuilder {
  constructor(loggerInstance) {
    this.logger = loggerInstance;
  }

  buildRequestTracker() {
    const loggerRef = this.logger;
    
    return function httpRequestTracker(req, res, next) {
      // Log incoming request
      loggerRef.info({
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body
      }, `Received ${req.method} request: ${req.url}`);

      // Log response when request completes
      res.on('finish', () => {
        loggerRef.info({
          method: req.method,
          url: req.url,
          statusCode: res.statusCode
        }, `Finished ${req.method} ${req.url} - Status: ${res.statusCode}`);
      });

      next();
    };
  }

  static create(loggerInstance) {
    return new MiddlewareBuilder(loggerInstance);
  }
}

module.exports = MiddlewareBuilder;
