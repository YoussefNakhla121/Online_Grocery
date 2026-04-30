const productModel = require('../models/product');

async function getAllProducts(req, res) {
    try {
        const category = req.query.category;
        const products = category
            ? await productModel.getAllProductsByCategory(category)
            : await productModel.getAllProducts();
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Unable to fetch products' });
    }
}

async function getProductById(req, res) {
    try {
        const productId = req.params.id;
        const product = await productModel.getProductById(productId);
        return res.status(200).json(product);
    } catch (error) {
        return res.status(404).json({ error: error.message || 'Product not found' });
    }
}

async function createProduct(req, res) {
    const { name, price, category, description } = req.body;
    if (!name || !price || !category) {
        return res.status(400).json({ error: 'name, price and category are required' });
    }

    try {
        const newProduct = await productModel.createProduct(name, price, category, description || '');
        return res.status(201).json(newProduct);
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Unable to create product' });
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
};
