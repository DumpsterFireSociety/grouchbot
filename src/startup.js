'use strict';

const [ bin, sourcePath, ENV ] = process.argv;

// If an invalid environment was passed in at launch, throw error and exit process
if (!ENV) {
	console.error('No environment passed in, process exiting.');
	process.exit(1);
}
if (!require('../config')[ENV]) {
	console.error(`Invalid environment '${ENV}' passed in, process exiting.`);
	process.exit(1);
}

// Pull in configuration variables for the specified environment and assign them to process.env
const config = { ...require('../config')[ENV], ...require('../config').all };
Object.assign(process.env, config);

// Kick off the startup pipeline as an IIFE to enable async/await functionality
console.log('Initiating startup pipeline...');
(async function StartupPipeline() {
	const startupTimer = process.hrtime();

	const grouchbot = require('./grouchbot'),
	      CBAlerter = require('@unplgtc/cbalerter'),
	      CBLogger = require('@unplgtc/cblogger');

	CBLogger.info(`Starting up ${process.env.botName} on port ${process.env.PORT}...`);

	// Set up alerts webhook so #grouchbot-alerts Slack channel can be notified of production problems
	CBAlerter.addWebhook((level, key, data = {}, options, err) => {
		return {
			url: process.env.alertWebhook,
			body: {
				text: '',
				attachments: [
					{
						fallback: `${level}: ${key}`,
						color: level === 'WARN' ? '#f39c12' : level === 'INFO' ? '#3498db' : '#ea4857',
						pretext: options.scope ? `<!${options.scope}>` : '',
						title: data.message ? `${level}: ${key}` : '',
						text: data.message ? data.message : `${level}: ${key}`
					}
				],
				channel: process.env.alertChannel
			},
			json: true
		}
	});
	CBLogger.extend(CBAlerter);

	// Notify alerts channel if starting up production or staging bots
	if (['cb_prod', 'cb_staging'].includes(process.env.botName)) {
		CBLogger.info(`Starting up ${process.env.botName}...`, undefined, { alert: true, scope: 'here' });
	}

	CBLogger.info('Launching Grouchbot...');
	await grouchbot.startup()

	stopTime(startupTimer, 'Startup');
})();

function stopTime(timer, label) {
	let endTime = process.hrtime(timer);

	console.log(`Process Time: ** ${label}: %ds %dms`, endTime[0], endTime[1]/1000000);
}
