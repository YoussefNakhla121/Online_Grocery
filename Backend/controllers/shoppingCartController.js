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

async function updateItem(req, res) {
    const userid = Number(req.params.userid);
    const productid = Number(req.params.productid);
    const quantity = Number(req.body.quantity);

    if (!productid || Number.isNaN(productid)) {
        return res.status(400).json({ error: 'Valid productid is required' });
    }
    if (Number.isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ error: 'Valid quantity is required' });
    }

    try {
        const product = await productModel.getProductById(productid);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const cart = await shopping_cart.findByUserId(userid);
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const items = await cart_item.getItemsByCartId(cart.cartid);
        const existing = items.find((item) => item.productid === productid);
        if (!existing) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        if (quantity === 0) {
            await cart_item.removeItem(cart.cartid, productid);
            await shopping_cart.incrementTotalAmount(cart.cartid, -(product.price * existing.quantity));
            return res.status(200).json({ removed: true });
        }

        const updatedItem = await cart_item.updateQuantity(cart.cartid, productid, quantity);
        const diff = quantity - existing.quantity;
        await shopping_cart.incrementTotalAmount(cart.cartid, product.price * diff);

        return res.status(200).json(updatedItem);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Unable to update cart item' });
    }
}

async function removeItem(req, res) {
    const userid = Number(req.params.userid);
    const productid = Number(req.params.productid);

    if (!productid || Number.isNaN(productid)) {
        return res.status(400).json({ error: 'Valid productid is required' });
    }

    try {
        const product = await productModel.getProductById(productid);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const cart = await shopping_cart.findByUserId(userid);
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const items = await cart_item.getItemsByCartId(cart.cartid);
        const existing = items.find((item) => item.productid === productid);
        if (!existing) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        await cart_item.removeItem(cart.cartid, productid);
        await shopping_cart.incrementTotalAmount(cart.cartid, -(product.price * existing.quantity));

        return res.status(204).send();
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Unable to remove cart item' });
    }
}

async function clearCart(req, res) {
    const userid = Number(req.params.userid);

    try {
        await cart_item.clearCartByUser(userid);
        return res.status(204).send();
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Unable to clear cart' });
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
    updateItem,
    removeItem,
    clearCart,
    getCartItems,
};
