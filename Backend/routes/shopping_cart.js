const express = require('express');
const {
    createCart,
    getCartItems,
    addItem,
    updateItem,
    removeItem,
    clearCart,
} = require('../controllers/shoppingCartController');

const router = express.Router();

router.post('/', createCart);
router.get('/:userid/items', getCartItems);
router.post('/:userid/items', addItem);
router.put('/:userid/items/:productid', updateItem);
router.delete('/:userid/items/:productid', removeItem);
router.delete('/:userid/items', clearCart);

module.exports = router;
