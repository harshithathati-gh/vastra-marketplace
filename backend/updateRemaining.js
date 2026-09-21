const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const Product = require('./src/models/Product');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        await Product.updateMany({ name: /Lehenga/i }, { baseImage: '/images/products/lehenga.png' });
        await Product.updateMany({ name: /Sherwani/i }, { baseImage: '/images/products/sherwani.png' });
        await Product.updateMany({ name: /Suit/i }, { baseImage: '/images/products/two_piece_suit.png' });
        await Product.updateMany({ name: /Trousers/i }, { baseImage: '/images/products/trousers.png' });
        await Product.updateMany({ name: /Shirt/i }, { baseImage: '/images/products/formal_shirt.png' });
        console.log('Fixed remaining images with regex!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
