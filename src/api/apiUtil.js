'use strict';

const CBLogger = require('@unplgtc/cblogger');

const apiUtil = {
	logCall(req, res, next) {
		const url = req.originalUrl,
		      method = req.method;

		if (![ 
				'/healthcheck',
				'/readycheck',
				'/.ambassador-internal/openapi-docs'
			].includes(url)
		) {
			CBLogger.info('api_call_received', { method, url });
		}
		next();
	},
}

module.exports = apiUtil;
