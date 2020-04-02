'use strict';

const CBLogger = require('@unplgtc/cblogger'),
      mayhemController = require('../mayhem/mayhemController'),
      slackApiService = require('./slackApiService');

const slashCommandService = {
	requestKrisPoll: async function (channelId, triggerId) {
		const res = await slackApiService.openView(mayhemController.getKrisPollModal(channelId), triggerId)
			.catch(err => {
				CBLogger.error('unexpected_open_view_error', { view: 'kris_poll' }, undefined, err);
			});

		if (!res || res.ok === false) {
			CBLogger.error('open_view_error', { view: 'kris_poll' }, undefined, res);
			// TODO: Inform user
			return;
		}

		CBLogger.info('view_delivered', { view: 'kris_poll' });
	}
};

module.exports = slashCommandService;
