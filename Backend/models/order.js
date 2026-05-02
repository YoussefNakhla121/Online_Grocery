const { supabase } = require('../util/database');

class Order {
    constructor(orderid, userid, orderdate, totalprice) {
        this.orderid = orderid;
        this.userid = userid;
        this.orderdate = orderdate;
        this.totalprice = totalprice;
    }

    static async createOrder(userid, totalprice) {
        const { data, error } = await supabase
            .from('order')
            .insert([{ userid, totalprice }])
            .select('orderid, userid, orderdate, totalprice')
            .single();
        if (error) throw error;
        return new Order(data.orderid, data.userid, data.orderdate, data.totalprice);
    }

    static async getOrdersByUser(userid) {
        const { data, error } = await supabase
            .from('order')
            .select('orderid, userid, orderdate, totalprice')
            .eq('userid', userid)
            .order('orderdate', { ascending: false });
        if (error) throw error;
        return data.map(o => new Order(o.orderid, o.userid, o.orderdate, o.totalprice));
    }

    static async getOrderById(orderid) {
        const { data, error } = await supabase
            .from('order')
            .select('orderid, userid, orderdate, totalprice')
            .eq('orderid', orderid)
            .single();
        if (error) throw error;
        return new Order(data.orderid, data.userid, data.orderdate, data.totalprice);
    }

    static async deleteOrderById(orderid) {
        const { error } = await supabase
            .from('order')
            .delete()
            .eq('orderid', orderid);
        if (error) throw error;
        return true;
    }
}

class OrderItem {
    constructor(orderid, productid, quantity) {
        this.orderid = orderid;
        this.productid = productid;
        this.quantity = quantity;
    }

    static async addItems(orderid, items) {
        // items is an array of { productid, quantity }
        const rows = items.map(item => ({
            orderid,
            productid: item.productid,
            quantity: item.quantity,
        }));
        const { data, error } = await supabase
            .from('order_items')
            .insert(rows)
            .select();
        if (error) throw error;
        return data.map(i => new OrderItem(i.orderid, i.productid, i.quantity));
    }

    static async getItemsByOrderId(orderid) {
        const { data, error } = await supabase
            .from('order_items')
            .select('orderid, productid, quantity')
            .eq('orderid', orderid);
        if (error) throw error;
        return data.map(i => new OrderItem(i.orderid, i.productid, i.quantity));
    }

    static async deleteItemsByOrderId(orderid) {
        const { error } = await supabase
            .from('order_items')
            .delete()
            .eq('orderid', orderid);
        if (error) throw error;
        return true;
    }
}

module.exports = { Order, OrderItem };
