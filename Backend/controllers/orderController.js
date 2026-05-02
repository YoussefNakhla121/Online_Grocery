const { Order, OrderItem } = require('../models/order');
const { cart_item } = require('../models/shopping_cart');
const productModel = require('../models/product');

async function placeOrder(req, res) {
    const userid = Number(req.params.userid);

    try {
        // 1. Get cart items for the user
        const cartItems = await cart_item.getItemsByUserCartId(userid);
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // 2. Calculate total price
        let totalprice = 0;
        for (const item of cartItems) {
            const product = await productModel.getProductById(item.productid);
            totalprice += product.price * item.quantity;
        }

        // 3. Create the order
        const order = await Order.createOrder(userid, totalprice);

        // 4. Insert order items
        await OrderItem.addItems(order.orderid, cartItems);

        // 5. Clear the user's cart
        await cart_item.clearCartByUser(userid);

        return res.status(201).json({
            message: 'Order saved successfully',
            order: {
                orderid: order.orderid,
                userid: order.userid,
                orderdate: order.orderdate,
                totalprice: order.totalprice,
            },
        });
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Unable to place order' });
    }
}

async function getOrders(req, res) {
    const userid = Number(req.params.userid);

    try {
        const orders = await Order.getOrdersByUser(userid);

        // For each order, fetch order items with product details
        const result = await Promise.all(
            orders.map(async (order) => {
                const items = await OrderItem.getItemsByOrderId(order.orderid);
                // Enrich items with product info
                const enrichedItems = await Promise.all(
                    items.map(async (item) => {
                        try {
                            const product = await productModel.getProductById(item.productid);
                            return {
                                productid: item.productid,
                                productname: product.name,
                                price: product.price,
                                quantity: item.quantity,
                            };
                        } catch {
                            return {
                                productid: item.productid,
                                productname: 'Unknown Product',
                                price: 0,
                                quantity: item.quantity,
                            };
                        }
                    })
                );
                return {
                    orderid: order.orderid,
                    orderdate: order.orderdate,
                    totalprice: order.totalprice,
                    items: enrichedItems,
                };
            })
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Unable to fetch orders' });
    }
}

async function cancelOrder(req, res) {
    const orderid = Number(req.params.orderid);

    try {
        const order = await Order.getOrderById(orderid);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await OrderItem.deleteItemsByOrderId(orderid);
        await Order.deleteOrderById(orderid);

        return res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Unable to cancel order' });
    }
}

module.exports = { placeOrder, getOrders, cancelOrder };
