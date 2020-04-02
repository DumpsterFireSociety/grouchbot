'use strict';

const redis = require('async-redis'),
      redisConfig = require('../../../config/redisConfig'),
      CBLogger = require('@unplgtc/cblogger');

const redisService = {
	initializeClient() {
		return new Promise((resolve, reject) => {
			const client = redis.createClient({
				host: redisConfig.host,
				port: redisConfig.port,
				...(redisConfig.secret && { password: redisConfig.secret })
			});

			client.on('ready', (err) => {
				CBLogger.info('redis_client_connected');
				this.client = client;
				resolve();
			});

			client.on('error', (err) => {
				CBLogger.error('redis_client_error', undefined, undefined, err);
				reject(err);
			});
		});
	},

	readObject: async function(key) {
		CBLogger.info('redis_object_read', { key: key });

		try {
			return JSON.parse(await this.client.get(key));

		} catch (err) {
			return Promise.reject(err);
		}
	},

	writeObject(key, value) {
		CBLogger.info('redis_object_write', { key: key });

		try {
			return this.client.set(key, JSON.stringify(value));

		} catch (err) {
			return Promise.reject(err);
		}
	}
}

module.exports = redisService;
