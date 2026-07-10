const router = require('express').Router();
const c = require('../controllers/warehouseController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', c.create);
router.put('/:id', c.update);
router.patch('/:id/stock', c.adjustStock);
router.delete('/:id', c.remove);

module.exports = router;
