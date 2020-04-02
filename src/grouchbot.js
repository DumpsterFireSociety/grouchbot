'use strict';

const bodyParser = require('body-parser'),
      CBLogger = require('@unplgtc/cblogger'),
      express = require('express'),
      redisService = require('./services/redis/redisService');

const grouchbot = {
	startup: async function() {
		try {
			await this.initializePersistenceLayer();
			await this.initializeApi();

		} catch (err) {
			CBLogger.error(`${err} failure during grouchbot startup, exiting process...`);
			process.exit(1);
		}
	},

	initializeApi() {
		return new Promise((resolve, reject) => {
			try {
				const { logCall } = require('./api/apiUtil');

				this.api = express();
				this.api.use(bodyParser.json());
				this.api.use(logCall);

				// Slack command validation requires custom parsing, so keep this above the global urlencoded body parser
				this.api.use('/slack', require('./services/slack/api'));

				// Parse urlencoded responses normally for remaining paths
				this.api.use(bodyParser.urlencoded({ extended: true }));

				this.api.use('/', require('./api'));

				this.api.listen(process.env.PORT, (err) => {
					if (err) {
						CBLogger.error('Failed to initialize Grouchbot API', undefined, undefined, err);
						return reject('initializeApi');
					}

					CBLogger.info(`Grouchbot API initialized, listening on port ${process.env.PORT}...`);
					resolve();
				});

			} catch (err) {
				CBLogger.error('Error initializing Grouchbot API', undefined, undefined, err);
				return reject('initializeApi');
			}
		});
	},

	initializePersistenceLayer() {
		return redisService.initializeClient();
	}
}

module.exports = grouchbot;
