'use strict';

const CBLogger = require('@unplgtc/cblogger'),
      mayhemController = require('../mayhem/mayhemController');

const modalService = {
	handleViewSubmission(payload) {
		const handle = this.getViewHandler(payload.view.callback_id);

		if (!handle) {
			CBLogger.error('unsupported_view_callback_id', { callbackId: payload.view.callback_id });
			// TODO: Return error to user
			return;
		}

		handle(payload);
	},

	getViewHandler(callbackId) {
		const handlerName = `handle${this.buildHandlerKey(callbackId)}Response`;

		return this[handlerName];
	},

	buildHandlerKey(callbackId) {
		// Remove underscores and capitalize each word, e.g. 'kris_poll' => 'KrisPoll'
		return callbackId.split('_').map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join('');
	},

	handleKrisGaugeResponse(payload) {
		mayhemController.createKrisGauge(payload);
	},

	handleKrisPollResponse(payload) {
		mayhemController.createKrisPoll(payload);
	}
}

module.exports = modalService;
