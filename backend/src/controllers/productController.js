const Product = require('../models/Product');

// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
    try {
        const { category, subCategory, type, search, page = 1, limit = 20 } = req.query;
        const filter = { isActive: true };

        if (category) filter.category = category;
        if (subCategory) filter.subCategory = subCategory;
        if (type) filter.type = type;
        if (search) filter.name = new RegExp(search, 'i');

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .sort({ name: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: products.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            products,
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/products/categories
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: { category: '$category', subCategory: '$subCategory' },
                    types: { $addToSet: '$type' },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: '$_id.category',
                    subCategories: {
                        $push: {
                            name: '$_id.subCategory',
                            types: '$types',
                            count: '$count',
                        },
                    },
                },
            },
        ]);

        res.json({ success: true, categories });
    } catch (error) {
        next(error);
    }
};
