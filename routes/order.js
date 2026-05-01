const express = require('express');
const { placeOrder, getOrders } = require('../controllers/orderController');

const router = express.Router();

router.post('/:userid', placeOrder);
router.get('/:userid', getOrders);

module.exports = router;
