const router = require('express').Router();
const { getSummary } = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/summary', getSummary);

module.exports = router;
