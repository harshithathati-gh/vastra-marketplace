const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const Product = require('./src/models/Product');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        await Product.updateOne({ name: 'Saree Blouse' }, { baseImage: '/images/products/blouse.png' });
        await Product.updateOne({ name: 'Formal Shirt' }, { baseImage: '/images/products/formal_shirt.png' });
        await Product.updateOne({ subCategory: 'ethnic', category: 'kids', type: 'kurta' }, { baseImage: '/images/products/kurta_kids.png' });
        await Product.updateOne({ name: 'Classic Kurta' }, { baseImage: '/images/products/kurta_mens.png' });
        await Product.updateOne({ name: 'Everyday Kurti' }, { baseImage: '/images/products/kurti.png' });
        await Product.updateOne({ name: 'Bridal Lehenga' }, { baseImage: '/images/products/lehenga.png' });
        await Product.updateOne({ name: 'Wedding Sherwani' }, { baseImage: '/images/products/sherwani.png' });
        await Product.updateOne({ name: 'Two-Piece Suit' }, { baseImage: '/images/products/two_piece_suit.png' });
        await Product.updateMany({ $or: [{ name: /trouser/i }, { type: 'trousers' }] }, { baseImage: '/images/products/trouser_1.jpg' });
        console.log('Finished updating product images in DB!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
