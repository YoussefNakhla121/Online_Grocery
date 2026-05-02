const { supabase } = require('../util/database');
const product = require('./product');

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

    static async findByCartId(cartid) {
        const { data, error } = await supabase
            .from('shopping_cart')
            .select('cartid, userid, totalamount')
            .eq('cartid', cartid)
            .single();
        if (error) throw error;
        return data ? new shopping_cart(data.cartid, data.userid, data.totalamount) : null;
    }

    static async incrementTotalAmount(cartid, amount) {
        const cart = await shopping_cart.findByCartId(cartid);
        if (!cart) {
            const error = new Error('Cart not found');
            error.status = 404;
            throw error;
        }

        const newTotal = Number(cart.totalamount) + Number(amount);
        const { data, error } = await supabase
            .from('shopping_cart')
            .update({ totalamount: newTotal })
            .eq('cartid', cartid)
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
        // Check if item already exists in cart
        const { data: existing, error: fetchError } = await supabase
            .from('cart_items')
            .select('cartid, productid, quantity')
            .eq('cartid', cartid)
            .eq('productid', productid)
            .maybeSingle();
        if (fetchError) throw fetchError;

        if (existing) {
            // Update existing item quantity
            const newQty = existing.quantity + quantity;
            const { data, error } = await supabase
                .from('cart_items')
                .update({ quantity: newQty })
                .eq('cartid', cartid)
                .eq('productid', productid)
                .select()
                .single();
            if (error) throw error;
            return new cart_item(data.cartid, data.productid, data.quantity);
        } else {
            // Insert new item
            const { data, error } = await supabase
                .from('cart_items')
                .insert([{ cartid, productid, quantity }])
                .select()
                .single();
            if (error) throw error;
            return new cart_item(data.cartid, data.productid, data.quantity);
        }
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
            // No cart yet — return empty array instead of erroring
            return [];
        }
        return cart_item.getItemsByCartId(cart.cartid);
    }

    static async addItemToUserCart(userid, productid, quantity) {
        let cart = await shopping_cart.findByUserId(userid);
        if (!cart) {
            // Auto-create a cart for the user
            cart = await shopping_cart.createCart(userid, 0);
        }
        return cart_item.addItem(cart.cartid, productid, quantity);
    }

    static async clearCartByUser(userid) {
        const cart = await shopping_cart.findByUserId(userid);
        if (!cart) return;

        // Delete all cart items
        const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('cartid', cart.cartid);
        if (deleteError) throw deleteError;

        // Reset cart total
        const { error: updateError } = await supabase
            .from('shopping_cart')
            .update({ totalamount: 0 })
            .eq('cartid', cart.cartid);
        if (updateError) throw updateError;
    }
}

module.exports = { shopping_cart, cart_item };