'use strict';

const interactiveResponseHandlerService = require('./interactiveResponseHandlerService'),
      slashCommandService = require('./slashCommandService');

const slashCommandController = {
	interactiveResponse(req, res) {
		try {
			var payload = JSON.parse(req.body.payload);

		} catch (err) {
			res.status(500).send();
		}

		res.status(200).send();

		interactiveResponseHandlerService.handle(payload);
	},

	krisPoll(req, res) {
		res.status(200).send();

		slashCommandService.requestKrisPoll(req.body.channel_id, req.body.trigger_id);
	}
}

module.exports = slashCommandController;
