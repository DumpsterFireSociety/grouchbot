'use strict';

const CBLogger = require('@unplgtc/cblogger'),
      slackValidationService = require('../slackValidationService');

const apiUtil = {
	logRequest(req, res, next) {
		CBLogger.info('incoming_slack_request', { url: req.url });
		next();
	},

	validateRequest(req, res, next) {
		const version = 'v0', // Constant for now, but presumably someday Slack will actually version this api
		      timestamp = req.headers['x-slack-request-timestamp'],
		      requestSignature = req.headers['x-slack-signature'];

		if (!slackValidationService.validateTimestamp(timestamp)) {
			CBLogger.warn('rejecting_outdated_slack_request', { reason: 'The timestamp on this incoming request is greater than five minutes old', headers: req.headers, body: req.body });
			return res.status(400).send();
		}

		if (!timestamp || !requestSignature) {
			CBLogger.warn('slack_request_rejected', { reason: 'invalid_headers' });
			return res.status(400).send();
		}

		if (slackValidationService.validateSigningSecret(
			version,
			timestamp,
			req.rawBody,
			requestSignature
		)) {
			CBLogger.info('slack_request_validated');
			next();
		} else {
			CBLogger.warn('slack_request_rejected', { reason: 'invalid_signature' });
			res.status(401).send();
		}
	},

	logCommand(req, res, next) {
		// TODO: Add Object Model validation to guarantee presence of these variables
		CBLogger.info('processing_slash_command', { command: req.body.command, user: req.body.user_id, channel: req.body.channel_id, team: req.body.team_id });
		next();
	}
}

module.exports = apiUtil;
