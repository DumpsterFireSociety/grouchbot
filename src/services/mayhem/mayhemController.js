'use strict';

const CBLogger = require('@unplgtc/cblogger'),
      KrisGauge = require('./KrisGauge'),
      KrisPoll = require('./KrisPoll'),
      mayhemService = require('./mayhemService');

const mayhemController = {
	getKrisGaugeModal(channelId) {
		return KrisGauge.modal(channelId);
	},

	getKrisPollModal(channelId) {
		return KrisPoll.modal(channelId);
	},

	createKrisGauge: async function(payload) {
		try {
			const user = payload.user.id,
			      responseUrl = payload.response_urls.shift().response_url,
			      state = Object.assign({}, ...Object.values(payload.view.state.values));

			const krisGauge = mayhemService.createKrisGauge(
				user,
				state.sentiment.value,
				state.spammable.selected_option.value
			);

			await mayhemService.sendKrisGauge(responseUrl, krisGauge);

		} catch (err) {
			CBLogger.error('create_kris_gauge_error', payload, undefined, err);
		}
	},

	createKrisPoll: async function(payload) {
		try {
			const user = payload.user.id,
			      responseUrl = payload.response_urls.shift().response_url,
			      state = Object.assign({}, ...Object.values(payload.view.state.values));

			const krisPoll = mayhemService.createKrisPoll(
				user,
				state.option_1.value,
				state.option_2.value,
				state.show_count.selected_option.value
			);

			await mayhemService.sendKrisPoll(responseUrl, krisPoll);

		} catch (err) {
			CBLogger.error('create_kris_poll_error', payload, undefined, err);
		}
	},

	updateKrisGauge: async function(id, payload) {
		const krisGauge = await mayhemService.updateKrisGauge(id, payload.user.id, payload.actions.shift().value);

		if (krisGauge) {
			mayhemService.sendKrisGaugeUpdate(payload, krisGauge);

		} else if (krisGauge === false) {
			mayhemService.rejectKrisPollVote(payload);

		} else {
			mayhemService.krisPollError(payload);
		}
	},

	updateKrisPoll: async function(id, payload) {
		const krisPoll = await mayhemService.updateKrisPoll(id, payload.user.id, payload.actions.shift().value);

		if (krisPoll) {
			mayhemService.sendKrisPollUpdate(payload, krisPoll);

		} else if (krisPoll === false) {
			mayhemService.rejectKrisPollVote(payload);

		} else {
			mayhemService.krisPollError(payload);
		}
	}
}

module.exports = mayhemController;
