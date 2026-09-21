const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const Product = require('./src/models/Product');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        await Product.updateMany({ name: /Salwar Suit/i }, { baseImage: '/images/products/salwar_suit.png' });
        console.log('Fixed Salwar Suit image!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
