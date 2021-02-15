'use strict';

const CBLogger = require('@unplgtc/cblogger'),
      KrisGauge = require('./KrisGauge'),
      KrisPoll = require('./KrisPoll'),
      slackApiService = require('../slack/slackApiService');

const mayhemService = {
	getKrisGauge(id) {
		return KrisGauge.findById(id);
	},

	getKrisPoll(id) {
		return KrisPoll.findById(id);
	},

	createKrisGauge(user, sentiment, spammable) {
		console.log({
				creator: user,
				sentiment,
				spammable: spammable == 'true'
			})
		return Object.create(KrisGauge)
			.init({
				creator: user,
				sentiment,
				spammable: spammable == 'true'
			})
			.save();
	},

	createKrisPoll(user, option1, option2, showCount) {
		return Object.create(KrisPoll)
			.init({
				creator: user,
				option1: option1,
				option2: option2,
				count: showCount == 'true'
			})
			.save();
	},

	updateKrisGauge: async function(id, user, option) {
		const krisGauge = await this.getKrisGauge(id);

		if (!krisGauge) {
			CBLogger.error('kris_gauge_not_found', { id: id });
			return undefined;
		}

		if (!krisGauge.spammable && krisGauge.results.voters.includes(user)) {
			CBLogger.info(`Rejecting judgement from user ${user} because they have already judged`);
			return false;
		}

		if (krisGauge.closed) {
			CBLogger.info(`Rejecting request from user ${user} because judgement has been rendered`);
			return krisGauge;
		}

		if (!krisGauge.closed && krisGauge.results.positive + krisGauge.results.negative > 185) {
			krisGauge.closed = true;
			return krisGauge.save();
		}

		krisGauge.results.voters.push(user);
		krisGauge.results[option]++;

		return krisGauge.save();
	},

	updateKrisPoll: async function(id, user, option) {
		const krisPoll = await this.getKrisPoll(id);

		if (!krisPoll) {
			CBLogger.error('kris_poll_not_found', { id: id });
			return undefined;
		}

		if (krisPoll.results.voters.includes(user)) {
			CBLogger.info(`Rejecting vote from user ${user} because they have already voted`);
			return false;
		}

		krisPoll.results.voters.push(user);
		krisPoll.results[option][this.pickLeftOrRight()]++;

		return krisPoll.save();
	},

	pickLeftOrRight() {
		return Math.floor((Math.random() * 10)) < 5 ? 'left' : 'right';
	},

	randomKris() {
		const leftArms = Math.floor((Math.random() * 20));
		const rightArms = Math.floor((Math.random() * 20));
		return `:kris-left-hand:${':kris-arm:'.repeat(leftArms)}:kris-body:${':kris-arm:'.repeat(rightArms)}:kris-right-hand:`;
	},

	sendKrisGauge(responseUrl, krisGauge) {
		return slackApiService.respondToInteraction(responseUrl, {
			text: '',
			attachments: krisGauge.pollBlock,
			response_type: 'in_channel'
		})
		.catch(async err => {
			if (err.ok === false) {
				CBLogger.error('slack_api_rejection', { ...krisGauge.coreData }, undefined, err);

			} else {
				CBLogger.error('slack_api_post_message_failure', { ...krisGauge.coreData }, undefined, err);
			}

			await this.sendKrisPollCreateError(krisGauge);
		});
	},

	sendKrisPoll(responseUrl, krisPoll) {
		return slackApiService.respondToInteraction(responseUrl, {
			text: '',
			attachments: krisPoll.pollBlock,
			response_type: 'in_channel'
		})
		.catch(async err => {
			if (err.ok === false) {
				CBLogger.error('slack_api_rejection', { ...krisPoll.coreData }, undefined, err);

			} else {
				CBLogger.error('slack_api_post_message_failure', { ...krisPoll.coreData }, undefined, err);
			}

			await this.sendKrisPollCreateError(krisPoll);
		});
	},

	sendKrisGaugeUpdate(event, krisGauge) {
		return slackApiService.respondToInteraction(event.response_url, {
			text: '',
			attachments: krisGauge.pollBlock
		})
		.catch(err => {
			CBLogger.error('slack_api_response_url_failure', { krisGauge: krisGauge.id, user: event.user.id }, undefined, err);
			throw err;
		});
	},

	sendKrisPollUpdate(event, krisPoll) {
		return slackApiService.respondToInteraction(event.response_url, {
			text: '',
			attachments: krisPoll.pollBlock
		})
		.catch(err => {
			CBLogger.error('slack_api_response_url_failure', { krisPoll: krisPoll.id, user: event.user.id }, undefined, err);
			throw err;
		});
	},

	rejectKrisPollVote(event) {
		return this.sendKrisPollVoteRejection(event.channel.id, event.user.id, event.callback_id.startsWith('krisPoll'))
			.catch(async err => {
				if (!err.error || !err.error === 'channel_not_found') {
					CBLogger.error('slack_api_post_ephemeral_unexpected_error', { user: event.user.id, channel: event.channel.id }, undefined, err);
				}

				await this.rejectKrisPollVoteDm(event);
			});
	},

	rejectKrisPollVoteDm(event) {
		return this.sendKrisPollVoteRejection(event.user.id, undefined, event.callback_id.startsWith('krisPoll'))
			.catch(async err => {
				CBLogger.error('slack_api_post_message_failure', { user: event.user.id, message: 'Something is probably very wrong. Check Slack status.' }, { alert: true, scope: 'channel' }, err);
			});
	},

	sendKrisPollVoteRejection(channel, user, isPoll) {
		const text = isPoll
			? `You think we don't know that you already voted in this Kris Poll?! Now Kris is displeased with you. Specifically, Kris is this much displeased:\n${this.randomKris()}`
			: `I SAID NO SPAMMING. Now Kris is displeased with you. Specifically, Kris is this much displeased:\n${this.randomKris()}`;
		const payload = {
			text,
			channel: channel,
			...(user && { user: user })
		};

		return user
		       ? slackApiService.postEphemeral(payload)
		       : slackApiService.postMessage(payload);
	},

	krisPollError(event) {
		return this.sendKrisPollError(event.channel.id, event.user.id)
			.catch(async err => {
				if (!err.error || !err.error === 'channel_not_found') {
					CBLogger.error('slack_api_post_ephemeral_unexpected_error', { user: event.user.id, channel: event.channel.id }, undefined, err);
				}

				await this.krisPollErrorDm(event);
			});
	},

	krisPollErrorDm(event) {
		return this.sendKrisPollError(event.user.id)
			.catch(async err => {
				CBLogger.error('slack_api_post_message_failure', { user: event.user.id, message: 'Something is probably very wrong. Check Slack status.' }, { alert: true, scope: 'channel' }, err);
			});
	},

	sendKrisPollError(channel, user) {
		const payload = {
			text: `Uh oh, there was an error counting your Kris poll vote. I can't say I'm particularly sorry about it, but Kris is. Specifically, Kris is this sorry:\n${this.randomKris()}`,
			channel: channel,
			...(user && { user: user })
		};

		return user
		       ? slackApiService.postEphemeral(payload)
		       : slackApiService.postMessage(payload);
	},

	sendKrisPollCreateError(krisPoll) {
		return slackApiService.postMessage({
			text: `Bah humbug! There was an error creating your Kris Poll. Maybe try again, maybe do something better with your life. If it keeps happening then bug <@UHJ56RT0B> about it. Also, Kris wants me to tell you that he feels this sorry:\n${this.randomKris()}\nPersonally, I think Kris is an idiot.`,
			channel: krisPoll.creator
		})
		.catch(err => {
			CBLogger.error('slack_api_post_message_failure', { user: krisPoll.creator, message: 'Something is probably very wrong. Check Slack status.' }, { alert: true, scope: 'channel' }, err);
		});
	}
}

module.exports = mayhemService;
