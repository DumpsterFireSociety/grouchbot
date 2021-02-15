'use strict';

const CBLogger = require('@unplgtc/cblogger'),
      redisService = require('../redis/redisService'),
      uuid = require('uuid/v4');

const KrisGauge = {
	init(data) {
		this.id = data.id || uuid();
		this.creator = data.creator;
		this.sentiment = data.sentiment;
		this.spammable = data.spammable;
		this.dateCreated = data.dateCreated || new Date();
		this.results = data.results || this.initResults();

		return this;
	},

	initResults() {
		const results = {
			voters: []
		};

		results.positive = 0;
		results.negative = 0;

		return results;
	},

	save() {
		this.upsert()
			.catch(err => {
				CBLogger.error('redis_upsert_error', { domain: 'KrisGauge', ...this.coreData }, undefined, err)
			});

		return this;
	},

	modal(channelId) {
		return {
			type: 'modal',
			callback_id: 'kris_gauge',
			title: {
				type: 'plain_text',
				text: 'Judgement by Kris'
			},
			blocks: [
				{
					type: 'input',
					label: {
						type: 'plain_text',
						text: 'Sentiment to be Judged'
					},
					element: {
						type: 'plain_text_input',
						action_id: 'sentiment',
						placeholder: {
							type: 'plain_text',
							text: 'Everyone is going to hate you for this'
						}
					}
				},
				{
					type: 'input',
					label: {
						type: 'plain_text',
						text: 'Spammable?'
					},
					element: {
						type: 'static_select',
						action_id: 'spammable',
						options: [
							{
								text: {
									type: 'plain_text',
									text: 'True'
								},
								value: 'true'
							},
							{
								text: {
									type: 'plain_text',
									text: 'False'
								},
								value: 'false'
							}
						],
						initial_option: {
							text: {
								type: 'plain_text',
								text: 'True'
							},
							value: 'true'
						}
					},
					hint: {
						type: 'plain_text',
						text: 'I recommend against letting these fools run wild, but I also worship chaos so it\'s enabled it by default.'
					}
				},
				{
					type: 'input',
					label: {
						type: 'plain_text',
						text: 'Channel'
					},
					element: {
						type: 'conversations_select',
						action_id: 'channel',
						initial_conversation: channelId,
						response_url_enabled: true
					}
				}
			],
			submit: {
				type: 'plain_text',
				text: ':pouroneout:',
				emoji: true
			},
			close: {
				type: 'plain_text',
				text: ':yes:',
				emoji: true
			}
		};
	},

	get pollBlock() {
		const fields = [
			{
				title: `${this.sentiment}`,
				value: this.field1,
				short: false
			}
		]

		const actions = [
			{
				'name': 'negative',
				'text': ':badstat:',
				'type': 'button',
				'value': 'negative'
			},
			{
				'name': 'positive',
				'text': ':goodstat:',
				'type': 'button',
				'value': 'positive'
			}
		];

		return [{
			title: `<@${this.creator}> has requested your judgement`,
			fallback: `Your judgement is requested on ${this.sentiment}`,
			text: 'Behold the judgement of Kris',
			color: '#3AA3E3',
			fields: fields
		},
		{
			text: '',
			callback_id: `krisGauge.${this.id}`,
			color: '#3AA3E3',
			actions: actions
		},
		...(!this.spammable ? [
			{
				text: `:grouch: No spamming. (${this.results?.negative} — ${this.results?.positive})`,
				color: '#3AA3E3'
			}
		] : [])];
	},

	get field1() {
		const leftArms = ':kris-arm:'.repeat(this.results.negative);
		const rightArms = ':kris-arm:'.repeat(this.results.positive);
		return `:krisbadstat:${leftArms}:kris-body:${rightArms}:krisgoodstat:`;
	}
}

const KrisGaugeDao = {
	namespace: 'KRIS_GAUGE',

	get key() {
		return this.buildKey(this.id);
	},

	get coreData() {
		return {
			id: this.id,
			creator: this.creator,
			sentiment: this.sentiment,
			spammable: this.spammable,
			dateCreated: this.dateCreated,
			results: this.results
		};
	},

	buildKey(id) {
		return `${this.namespace}.${id}`;
	},

	findById: async function (id) {
		const coreData = await redisService.readObject(this.buildKey(id))
			.catch(err => {
				CBLogger.error('redis_read_error', { key: this.buildKey(id) }, undefined, err);
			});

		if (!coreData) { return undefined };

		return Object.create(KrisGauge).init(coreData);
	},

	upsert() {
		return redisService.writeObject(this.key, this.coreData);
	}
}

// Delegate from KrisGauge -> KrisGaugeDao
Object.setPrototypeOf(KrisGauge, KrisGaugeDao);
module.exports = KrisGauge;
