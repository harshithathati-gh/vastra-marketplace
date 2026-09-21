const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const Product = require('./src/models/Product');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        const doc = await Product.findOne({ type: 'blouse' });
        if (doc) {
            console.log("Found:", doc.name);
            await Product.updateOne({ _id: doc._id }, { baseImage: '/images/products/blouse.png' });
            console.log("Updated correctly.");
        } else {
            console.log("Not found.");
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
