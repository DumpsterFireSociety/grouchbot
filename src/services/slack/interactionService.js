'use strict';

const CBLogger = require('@unplgtc/cblogger'),
      mayhemController = require('../mayhem/mayhemController');

const interactionService = {
	handleInteraction(payload) {
		const [ domain, id ] = payload.callback_id.split('.');
		const handle = this.getInteractionHandler(domain);

		if (!handle) {
			CBLogger.error('unsupported_interaction_domain', { domain: domain, id: id, callbackId: payload.callback_id });
			// TODO: Return error to user
			return;
		}

		handle(id, payload);
	},

	getInteractionHandler(domain) {
		const handlerName = `handle${this.buildHandlerKey(domain)}Response`;

		return this[handlerName];
	},

	buildHandlerKey(domain) {
		// Remove underscores and capitalize each word, e.g. 'kris_poll' => 'KrisPoll'
		return domain.split('_').map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join('');
	},

	handleKrisGaugeResponse(id, payload) {
		mayhemController.updateKrisGauge(id, payload);
	},

	handleKrisPollResponse(id, payload) {
		mayhemController.updateKrisPoll(id, payload);
	}
}

module.exports = interactionService;
