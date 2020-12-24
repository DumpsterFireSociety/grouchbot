/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * config.js
 *
 * Provisions the Grouchbot project for the environment passed in at launch
 *
 * > Stores the tokens, secrets, IDs, etc. used throughout the project as environment variables
 *
 * > Uses the set of variables specific to the environment passed in at launch
 *
 * config.js is required in from ecosystem.config.js
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Export keys for the prod environment
exports.prod = {
	ENV: 'prod',
	PORT: '8080',

	// List prod-specific keys here
	botName:             'gb_prod',
	clientId:            '589082231235.1024725745617',
	clientSecret:        'ac8fdb8127ae7eb32084b3cb154a0194',
	baseUrl:             'https://causebot-local.ngrok.io', // TODO: update to Prod
	redirectUri:         'https://causebot-local.ngrok.io/oauth', // TODO: update to Prod
	storage:             'src/storage/prod',
	signingSecret:       'b1d2356460397694ba70cb951542af79',
	alertWebhook:        'https://hooks.slack.com/services/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'
};

// Export keys for the staging environment
exports.staging = {
	ENV: 'staging',
	PORT: '8081',

	// List staging-specific keys here
	botName:             'gb_staging',
	clientId:            '',
	clientSecret:        '',
	baseUrl:             '/staging',
	redirectUri:         '/staging/oauth',
	storage:             'src/storage/staging',
	signingSecret:       '',
	alertWebhook:        ''
};

// Export keys for the local environment
exports.local = {
	ENV: 'local',
	PORT: '8083',

	// List local-specific keys here
	botName:             'gb_local',
	clientId:            '',
	clientSecret:        '',
	baseUrl:             'https://causebot-local.ngrok.io/local',
	redirectUri:         'https://causebot-local.ngrok.io/local/oauth',
	storage:             'src/storage/local',
	signingSecret:       '',
	alertWebhook:        ''
};

// Export keys for all environments
exports.all = {
	// List keys for all environments here
	botScopes:           [],
	db:                  'gbdb',
	dbUser:              'grouchbot',
	dbPass:              '',
	alertChannel:        '#grouchbot-alerts'
};
