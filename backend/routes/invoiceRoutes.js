const router = require('express').Router();
const c = require('../controllers/invoiceController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', c.create);

module.exports = router;
