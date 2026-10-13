const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const Product = require('./src/models/Product');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const images = [
      '/images/products/suit_1.jpg',
      '/images/products/suit_2.jpg',
      '/images/products/suit_3.jpg',
      '/images/products/suit_4.jpg',
      '/images/products/suit_5.jpg'
    ];

    const res = await Product.updateMany(
      {
        $or: [
          { name: /Suit \(2-Piece\)/i },
          { name: /Two-Piece Suit/i },
          { name: /3-Piece/i },
          { name: /Three-Piece/i },
          { name: /^Suit/i, category: 'men' }
        ]
      },
      {
        name: 'Suit (3-Piece)',
        description: 'Sophisticated three-piece suit complete with jacket, waistcoat, and trousers. Tailored for a sharp, refined silhouette.',
        baseImage: '/images/products/suit_1.jpg',
        images: images,
        category: 'men',
        subCategory: 'western',
        type: 'suit'
      }
    );
    console.log('Suit updated in DB:', res);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
