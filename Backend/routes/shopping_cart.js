const express = require('express');
const { createCart, getCartItems, addItem } = require('../controllers/shoppingCartController');

const router = express.Router();

router.post('/', createCart);
router.get('/:userid/items', getCartItems);
router.post('/:userid/items', addItem);

module.exports = router;
