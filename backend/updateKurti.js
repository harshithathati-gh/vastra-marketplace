const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const Product = require('./src/models/Product');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        // Check if the name is just 'Kurti' and update it
        const res = await Product.updateMany({ name: 'Kurti' }, { baseImage: '/images/products/kurti.png' });
        console.log(res);
        console.log('Fixed Kurti image!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
