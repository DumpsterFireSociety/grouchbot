const apiUtil = require('./apiUtil'),
      bodyParser = require('body-parser'),
      CBLogger = require('@unplgtc/cblogger'),
      router = require('express').Router(),
      commandRouter = require('express').Router(),
      slackController = require('../slackController');

const apiPrefix = '/slack';
CBLogger.info(`Initializing slack api endpoints at '${apiPrefix}'...`);

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
	apiUtil.logRequest,
	apiUtil.validateRequest
);

router.post('/', function(req, res, next) {
	try {
		if (req.body.challenge != undefined) {
			CBLogger.info('challenge_event')
            res.send(req.body.challenge)
        }
		else if (req.body.event.type == "app_mention") {
			CBLogger.info('app_mention_event');
			slackController.appMention(req, res, next)
		} else {
			CBLogger.info('message_event');
			res.sendStatus(200);
		}
	} catch (err) {
		CBLogger.error('event_processing_error', {error: err});
		res.sendStatus(200);
    }
});

router.post('/interactive', (req, res) => {
	CBLogger.info('interactive_response');
	slackController.interactiveResponse(req, res);
});

router.use('/cmd', commandRouter);
commandRouter.use(
	'/',
	apiUtil.logCommand
);

commandRouter.post('/ping', (req, res) => {
	CBLogger.info('ping_pong');
	res.status(200).send('Pong :table_tennis_paddle_and_ball:');
});

commandRouter.post('/kris-gauge', (req, res) => {
	CBLogger.info('kris_gauge');
	slackController.krisGauge(req, res);
});

commandRouter.post('/kris-poll', (req, res) => {
	CBLogger.info('kris_poll');
	slackController.krisPoll(req, res);
});

commandRouter.post('/wf', (req, res) => {
	CBLogger.info('working_from');
	slackController.workingFrom(req, res);
});

module.exports = router;
