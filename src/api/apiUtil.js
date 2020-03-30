'use strict';

const CBLogger = require('@unplgtc/cblogger');

const apiUtil = {
	logCall(req, res, next) {
		CBLogger.info('api_call_received', { url: req.originalUrl });
		next();
	}
}

module.exports = apiUtil;
