'use strict';

const interactiveResponseHandlerService = require('./interactiveResponseHandlerService'),
      slackService = require('./slackService');

const slackController = {
	interactiveResponse(req, res) {
		try {
			var payload = JSON.parse(req.body.payload);

		} catch (err) {
			res.status(500).send();
		}

		res.status(200).send();

		interactiveResponseHandlerService.handle(payload);
	},

	krisGauge(req, res) {
		res.status(200).send();

		slackService.requestKrisGauge(req.body.channel_id, req.body.trigger_id);
	},

	krisPoll(req, res) {
		res.status(200).send();

		slackService.requestKrisPoll(req.body.channel_id, req.body.trigger_id);
	},

	appMention(req, res) {
		res.status(200).send();

		slackService.respondToAppMention(req.body.event.channel);
	}
}

module.exports = slackController;
