const apiUtil = require('./apiUtil'),
      bodyParser = require('body-parser'),
      CBLogger = require('@unplgtc/cblogger'),
      router = require('express').Router(),
      slashCommandService = require('../slashCommandService');

const apiPrefix = '/cmd';
CBLogger.info(`Initializing slashCommand api endpoints at '${apiPrefix}'...`);

router.use(
	'/',
	bodyParser.urlencoded({ 
		extended: true,
		// Add the raw body to the parsed response so it can be used to verify Slack signing secrets
		verify(req, res, buf, encoding) {
			if (buf && buf.length) {
				req.rawBody = buf.toString(encoding || 'utf8');
			}
		}
	}),
	apiUtil.validateCommand,
	apiUtil.logCommand
);

router.post('/ping', (req, res) => {
	CBLogger.info('ping_pong');
	res.status(200).send('Pong :table_tennis_paddle_and_ball:');
});

module.exports = router;
