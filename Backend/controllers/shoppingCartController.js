const { shopping_cart, cart_item } = require('../models/shopping_cart');
const productModel = require('../models/product');

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
    const userid = Number(req.params.userid);
    const { productid, quantity } = req.body;
    const pid = Number(productid);
    const qty = Number(quantity);

    if (!pid || Number.isNaN(pid) || qty <= 0 || Number.isNaN(qty)) {
        return res.status(400).json({ error: 'productid and a valid quantity are required' });
    }

    try {
        const product = await productModel.getProductById(pid);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const addedItem = await cart_item.addItemToUserCart(userid, pid, qty);
        await shopping_cart.incrementTotalAmount(addedItem.cartid, product.price * qty);

        return res.status(201).json(addedItem);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Unable to add item to cart' });
    }
}

async function getCartItems(req, res) {
    try {
        const userid = Number(req.params.userid);
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
