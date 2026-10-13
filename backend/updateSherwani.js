const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const Product = require('./src/models/Product');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const images = [
      '/images/products/sherwani_1.jpg',
      '/images/products/sherwani_2.jpg',
      '/images/products/sherwani_3.jpg',
      '/images/products/sherwani_4.jpg',
      '/images/products/sherwani_5.jpg'
    ];

    const res = await Product.updateMany(
      {
        $or: [
          { name: /sherwani/i },
          { type: /sherwani/i }
        ]
      },
      {
        baseImage: '/images/products/sherwani_1.jpg',
        images: images,
        category: 'men',
        subCategory: 'ethnic'
      }
    );
    console.log('Sherwani updated in DB:', res);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
