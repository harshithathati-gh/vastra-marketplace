const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const Product = require('./src/models/Product');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        // Find Kurta and update it
        const res = await Product.updateMany({ name: 'Kurta' }, { baseImage: '/images/products/kurta_mens.png' });
        console.log(res);
        console.log('Fixed Kurta image!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
