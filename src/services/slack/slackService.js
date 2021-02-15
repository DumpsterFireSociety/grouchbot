'use strict';

const CBLogger = require('@unplgtc/cblogger'),
      mayhemController = require('../mayhem/mayhemController'),
      slackApiService = require('./slackApiService');

const slackService = {
	requestKrisGauge: async function (channelId, triggerId) {
		const res = await slackApiService.openView(mayhemController.getKrisGaugeModal(channelId), triggerId)
			.catch(err => {
				CBLogger.error('unexpected_open_view_error', { view: 'kris_gauge' }, undefined, err);
			});

		if (!res || res.ok === false) {
			CBLogger.error('open_view_error', { view: 'kris_gauge' }, undefined, res);
			// TODO: Inform user
			return;
		}

		CBLogger.info('view_delivered', { view: 'kris_gauge' });
	},

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
	},

	respondToAppMention: async function (channelId) {

		let responses = [
			"What?",
			"Can't you see I'm busy?",
			"Ugh!",
			"Whaaat?",
			"Me busy. Leave me alone!!",
			"No time for play.",
			"Me not that kind of bot!",
			"Poke, poke, poke - is that all you do?",
			"What's that smell? Oh, it's just you",
			"Do not push me or I will impale you on my garbage.",
			"What you bother me for?!",
			":nerf_gun: I may have somethin' for ya. :nerf_gun:",
			":grouch:",
			":notsureif-fry: Not sure if attention whore or just an asshole :notsureif-fry:",
			":take_this_to_not_here:",
			":kris-left-hand-knife::kris-arm::kris-body::kris-arm-2::kris-right-hand-knife:",
			":dumpsterfireparty: :dumpsterfireparty: Party Time! :dumpsterfireparty: :dumpsterfireparty:"
		]

		var randomResponse = responses[Math.floor(Math.random()*responses.length)];

		CBLogger.info('responding_to_mention_response', { response: randomResponse, channel: channelId });
		slackApiService.postMessage({
			text: randomResponse,
			channel: channelId
		})
	}
};

module.exports = slackService;
