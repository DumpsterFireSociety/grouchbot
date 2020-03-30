const CBLogger = require('@unplgtc/cblogger'),
      router = require('express').Router();

const apiPrefix = '/';
CBLogger.info(`Initializing top-level api endpoints at '${apiPrefix}'...`);

router.get('/healthcheck', (req, res) => {
	res.status(200).send('Healthy');
});

router.get('/readycheck', (req, res) => {
	res.status(200).send('Ready');
});

router.get('/.ambassador-internal/openapi-docs', (req, res) => {
	res.status(200).sendFile('openapi.json', { root: __dirname });
});

router.get('/get-alt', (req, res) => {
	CBLogger.info('get-alt');
	res.status(200).send('ALT!');
});

router.get('/', (req, res) => {
	res.status(200).send('Hey hey!');
});

router.all('*', (req, res) => {
	CBLogger.info('unsupported_api_endpoint', { message: 'Returning 404 to sender', url: req.originalUrl, method: req.method });
	res.status(404).send('Not Found');
});

module.exports = router;
