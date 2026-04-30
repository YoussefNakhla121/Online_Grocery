const { shopping_cart, cart_item } = require('../models/shopping_cart');

async function createCart(req, res) {
    const { userid, totalamount } = req.body;
    if (!userid) {
        return res.status(400).json({ error: 'userid is required' });
    }

    try {
        const createdCart = await shopping_cart.createCart(userid, totalamount || 0);
        return res.status(201).json(createdCart);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Unable to create cart' });
    }
}

async function addItem(req, res) {
    const { userid } = req.params;
    const { productid, quantity } = req.body;

    if (!productid || !quantity) {
        return res.status(400).json({ error: 'productid and quantity are required' });
    }

    try {
        const addedItem = await cart_item.addItemToUserCart(userid, productid, quantity);
        return res.status(201).json(addedItem);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Unable to add item to cart' });
    }
}

async function getCartItems(req, res) {
    try {
        const { userid } = req.params;
        const items = await cart_item.getItemsByUserCartId(userid);
        return res.status(200).json(items);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Unable to fetch cart items' });
    }
}

module.exports = {
    createCart,
    addItem,
    getCartItems,
};
