const router = require('express').Router();
const c = require('../controllers/leadController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', c.getAll);
router.post('/', c.create);
router.put('/:id', c.update);
router.post('/:id/convert', c.convert);
router.delete('/:id', c.remove);

module.exports = router;
