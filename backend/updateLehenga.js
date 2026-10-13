const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const Product = require('./src/models/Product');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const res = await Product.updateMany(
            { $or: [{ name: /Lehenga/i }, { type: /lehenga/i }] },
            { baseImage: '/images/products/lehenga.jpg' }
        );
        console.log('Updated Lehenga in DB:', res);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
