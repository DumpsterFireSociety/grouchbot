'use strict';

const CBLogger = require('@unplgtc/cblogger'),
      interactionService = require('./interactionService'),
      modalService = require('./modalService');

const interactiveResponseHandlerService = {
	handle(payload) {
		switch (payload.type) {
			case 'view_submission':
				modalService.handleViewSubmission(payload);
				break;
			case 'interactive_message':
				interactionService.handleInteraction(payload);
				break;
			default:
				CBLogger.error('unsupported_payload_type', { type: payload.type });
		}
	}
}

module.exports = interactiveResponseHandlerService;
