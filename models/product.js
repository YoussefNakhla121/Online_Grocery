const { supabase } = require('../util/database');

class product {
    constructor(name,price,category,description) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.description = description;
    }
    static async getAllProducts() {
        const { data, error } = await supabase
            .from('product')
            .select('*');
        if (error) throw error;
        return data.map(p => new product(p.name, p.price, p.category, p.description));
    }

    static async getAllProductsByCategory(category) {
        const { data, error } = await supabase
            .from('product')
            .select('*')
            .eq('category', category);
        if (error) throw error;
        return data.map(p => new product(p.name, p.price, p.category, p.description));
    }

    static async getProductById(productid) {
        const { data, error } = await supabase
            .from('product')
            .select('*')
            .eq('productid', productid)
            .single();
        if (error) throw error;
        return new product(data.name, data.price, data.category, data.description);
    }

    static async createProduct(name, price, category, description) {
        const { data, error } = await supabase
            .from('product')
            .insert([{ name, price, category, description }])
            .select()
            .single();
        if (error) throw error;
        return new product(data.name, data.price, data.category, data.description);
    }

}

module.exports = product;