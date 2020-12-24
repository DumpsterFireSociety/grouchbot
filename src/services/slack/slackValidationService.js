'use strict';

const CBLogger = require('@unplgtc/cblogger'),
      crypto = require('crypto'),
      slackConfig = require('../../../config/slackConfig');

const slackValidationService = {
	validateSigningSecret(version, timestamp, rawBody, requestSignature) {
		const sigBasestring = `${version}:${timestamp}:${rawBody}`;

		const signature = `${version}=` +
			crypto.createHmac('sha256', `${slackConfig.signingSecret}`)
			      .update(sigBasestring, 'utf8')
			      .digest('hex');

		return crypto.timingSafeEqual(
			Buffer.from(signature, 'utf8'),
			Buffer.from(requestSignature, 'utf8')
		);
	},

	validateTimestamp(timestamp) {
		// Slack sends time in seconds, so convert a fresh timestamp to seconds
		const currentTime = Math.floor(new Date().getTime()/1000);

		if (!this.isWithinFiveMinutes(timestamp, currentTime)) {
			CBLogger.warn('received_outdated_timestamp', { WARN: 'This could indicate an attempted replay attack on the system', timestamp: timestamp, currentTimeInSeconds: currentTime });
			return false;
		}
		return true;
	},

	isWithinFiveMinutes(timestamp, currentTime) {
		return !(Math.abs(currentTime - timestamp) > 300);
	}
}

module.exports = slackValidationService;
