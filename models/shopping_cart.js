const { supabase } = require('../util/database');

class shopping_cart{
    constructor(cartid, userid, totalamount) {
        this.cartid = cartid;
        this.userid = userid;
        this.totalamount = totalamount;
    }

    static async findByUserId(userid) {
        const { data, error } = await supabase
            .from('shopping_cart')
            .select('cartid, userid, totalamount')
            .eq('userid', userid)
            .maybeSingle();
        if (error) throw error;
        return data ? new shopping_cart(data.cartid, data.userid, data.totalamount) : null;
    }

    static async createCart(userid, totalamount) {
        const existingCart = await shopping_cart.findByUserId(userid);
        if (existingCart) {
            const error = new Error('A cart already exists for this user');
            error.status = 409;
            throw error;
        }

        const { data, error } = await supabase
            .from('shopping_cart')
            .insert([{ userid, totalamount }])
            .select('cartid, userid, totalamount')
            .single();
        if (error) throw error;
        return new shopping_cart(data.cartid, data.userid, data.totalamount);
    }

}

class cart_item {
    constructor(cartid, productid, quantity) {
        this.cartid = cartid;
        this.productid = productid;
        this.quantity = quantity;
    }
    static async addItem(cartid, productid, quantity) {
        const { data, error } = await supabase
            .from('cart_items')
            .insert([{ cartid, productid, quantity }])
            .select()
            .single();
        if (error) throw error;
        return new cart_item(cartid, productid, quantity);
    }

    static async getItemsByCartId(cartid) {
        const { data, error } = await supabase
            .from('cart_items')
            .select('cartid, productid, quantity')
            .eq('cartid', cartid);
        if (error) throw error;
        return data.map(i => ({
            productid: i.productid,
            quantity: i.quantity,
        }));
    }

    static async getItemsByUserCartId(userid) {
        const cart = await shopping_cart.findByUserId(userid);
        if (!cart) {
            const error = new Error('Cart not found for user');
            error.status = 404;
            throw error;
        }
        return cart_item.getItemsByCartId(cart.cartid);
    }

    static async addItemToUserCart(userid, productid, quantity) {
        const cart = await shopping_cart.findByUserId(userid);
        if (!cart) {
            const error = new Error('Cart not found for user');
            error.status = 404;
            throw error;
        }
        return cart_item.addItem(cart.cartid, productid, quantity);
    }
}

module.exports = { shopping_cart, cart_item };