const express = require('express');
const { placeOrder, getOrders, cancelOrder } = require('../controllers/orderController');

const router = express.Router();

router.post('/:userid', placeOrder);
router.get('/:userid', getOrders);
router.delete('/:orderid', cancelOrder);

module.exports = router;
