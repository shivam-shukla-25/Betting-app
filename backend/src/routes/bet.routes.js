const { Router } = require('express');

const { placeBet } = require('../controllers/bet.controller');
const HttpError = require('../lib/http-error');

const router = Router();

router.post('/place-bet', placeBet);

// centralised error handler for this router
router.use((err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

module.exports = router;
