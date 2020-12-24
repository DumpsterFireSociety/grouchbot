'use strict';

const HttpRequest = require('@unplgtc/http-request'),
      api = require('./api/external/SlackApi');

const slackApiService = {
	openView(view, triggerId) {
		return this.execute(api.endpoints.views(view).open(triggerId));
	},

	postMessage(message) {
		return this.execute(api.endpoints.messages(message).post());
	},

	postEphemeral(message) {
		return this.execute(api.endpoints.messages(message).ephemeral());
	},

	respondToInteraction(responseUrl, message) {
		return this.execute(api.endpoints.messages(message).useResponseUrl(responseUrl));	
	},

	execute(payload) {
		return new Promise(async (resolve, reject) => {
			try {
				const res = await Object.create(HttpRequest)
					.headers(api.headers)
					.url(payload.url)
					.body(payload.body)
					.json()
					.post();

				return res && res.ok
				       ? resolve(res)
				       : reject(res);

			} catch (err) {
				reject(err);
			}
		});
	}
}

module.exports = slackApiService;
