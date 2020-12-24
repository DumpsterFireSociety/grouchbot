'use strict';

const { baseUrl, accessToken } = require('../../../../../config/slackConfig');

const SlackApi = {
	get headers() {
		return {
			Authorization: `Bearer ${accessToken}`
		}
	},

	endpoints: {
		views: (view) => ({
			open: (trigger_id) => ({
				url: `${baseUrl}/views.open`,
				body: {
					trigger_id: trigger_id,
					view: view
				}
			})
		}),

		messages: (message) => ({
			post: () => ({
				url: `${baseUrl}/chat.postMessage`,
				body: message
			}),

			ephemeral: () => ({
				url: `${baseUrl}/chat.postEphemeral`,
				body: message
			}),

			useResponseUrl: (responseUrl) => ({
				url: responseUrl,
				body: message
			})
		})
	}
}

module.exports = SlackApi;
