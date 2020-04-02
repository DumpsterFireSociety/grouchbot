'use strict';

const CBLogger = require('@unplgtc/cblogger'),
      redisService = require('../redis/redisService'),
      uuid = require('uuid/v4');

const KrisPoll = {
	init(data) {
		this.id = data.id || uuid();
		this.creator = data.creator;
		this.option1 = data.option1;
		this.option2 = data.option2;
		this.count = data.count;
		this.dateCreated = data.dateCreated || new Date();
		this.results = data.results || this.initResults();

		return this;
	},

	initResults() {
		const results = {
			voters: []
		};

		results.option1 = {
			left: 0,
			right: 0
		};
		results.option2 = {
			left: 0,
			right: 0
		};

		return results;
	},

	save() {
		this.upsert()
			.catch(err => {
				CBLogger.error('redis_upsert_error', { domain: 'KrisPoll', ...this.coreData }, undefined, err)
			});

		return this;
	},

	modal(channelId) {
		return {
			type: 'modal',
			callback_id: 'kris_poll',
			title: {
				type: 'plain_text',
				text: 'Wait what are you doing'
			},
			blocks: [
				{
					type: 'input',
					label: {
						type: 'plain_text',
						text: 'Option 1'
					},
					element: {
						type: 'plain_text_input',
						action_id: 'option_1',
						placeholder: {
							type: 'plain_text',
							text: 'This is a terrible idea'
						}
					},
					hint: {
						type: 'plain_text',
						text: 'Please don\'t do this'
					}
				},
				{
					type: 'input',
					label: {
						type: 'plain_text',
						text: 'Option 2'
					},
					element: {
						type: 'plain_text_input',
						action_id: 'option_2',
						placeholder: {
							type: 'plain_text',
							text: 'It\'s not too late to turn back'
						}
					},
					hint: {
						type: 'plain_text',
						text: 'The cancel button is RIGHT THERE'
					}
				},
				{
					type: 'input',
					label: {
						type: 'plain_text',
						text: 'Show count'
					},
					element: {
						type: 'static_select',
						action_id: 'show_count',
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
								text: 'False'
							},
							value: 'false'
						}
					},
					hint: {
						type: 'plain_text',
						text: 'No need to count votes if this poll doesn\'t exist'
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
				title: `${this.option1}${this.resultCount1}`,
				value: this.field1,
				short: false
			}
		]

		const actions = [
			{
				'name': 'option1',
				'text': this.option1,
				'type': 'button',
				'value': 'option1'
			}
		]

		if (this.option2) {
			fields.push({
				title: `${this.option2}${this.resultCount2}`,
				value: this.field2,
				short: false
			});

			actions.push({
				'name': 'option2',
				'text': this.option2,
				'type': 'button',
				'value': 'option2'
			});
		} else {
			// If there's no option2, set option1's button text to a plus sign emoji
			actions[0].text = ':heavy_plus_sign:';
		}

		return [{
			title: 'KRIS POLL!',
			fallback: `KRIS POLL!`,
			text: `Blame <@${this.creator}> for this travesty`,
			color: '#3AA3E3',
			fields: fields
		},
		{
			text: '',
			callback_id: `krisPoll.${this.id}`,
			color: '#3AA3E3',
			actions: actions
		}];
	},

	get field1() {
		const leftArms = ':kris-arm:'.repeat(this.results.option1.left);
		const rightArms = ':kris-arm:'.repeat(this.results.option1.right);
		return `:kris-left-hand:${leftArms}:kris-body:${rightArms}:kris-right-hand:`;
	},

	get field2() {
		const leftArms = ':kris-arm:'.repeat(this.results.option2.left);
		const rightArms = ':kris-arm:'.repeat(this.results.option2.right);
		return `:kris-left-hand:${leftArms}:kris-body:${rightArms}:kris-right-hand:`;
	},

	get resultCount1() {
		if (!this.count) {
			return '';
		}
		
		const count = this.results.option1.left + this.results.option1.right;
		if (count > 0) {
			return ` (${count})`;
		} else {
			return '';
		}
	},

	get resultCount2() {
		if (!this.count) {
			return '';
		}

		const count = this.results.option2.left + this.results.option2.right;
		if (count > 0) {
			return ` (${count})`;
		} else {
			return '';
		}
	}
}

const KrisPollDao = {
	namespace: 'KRIS',

	get key() {
		return this.buildKey(this.id);
	},

	get coreData() {
		return {
			id: this.id,
			creator: this.creator,
			option1: this.option1,
			option2: this.option2,
			count: this.count,
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

		return Object.create(KrisPoll).init(coreData);
	},

	upsert() {
		return redisService.writeObject(this.key, this.coreData);
	}
}

// Delegate from KrisPoll -> KrisPollDao
Object.setPrototypeOf(KrisPoll, KrisPollDao);
module.exports = KrisPoll;
