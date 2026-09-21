const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const ColorCombination = require('./src/models/ColorCombination');

const combos = [
    {
        baseColor: { name: 'Royal Blue', hex: '#4169E1' },
        complementaryColors: [
            { name: 'Silver', hex: '#C0C0C0', styleType: 'contrast' },
            { name: 'Mustard Yellow', hex: '#FFDB58', styleType: 'accent' }
        ],
        description: 'A deeply majestic combination perfect for heavy embroidered ethnic wear like Lehengas or Sherwanis.',
        season: 'winter'
    },
    {
        baseColor: { name: 'Mint Green', hex: '#98FF98' },
        complementaryColors: [
            { name: 'Rose Pink', hex: '#FF66CC', styleType: 'complementary' },
            { name: 'Ivory', hex: '#FFFFF0', styleType: 'monochromatic' }
        ],
        description: 'A light, breathable daytime palette excellent for Kurtis and Spring/Summer occasion wear.',
        season: 'summer'
    },
    {
        baseColor: { name: 'Maroon', hex: '#800000' },
        complementaryColors: [
            { name: 'Gold', hex: '#FFD700', styleType: 'accent' },
            { name: 'Beige', hex: '#F5F5DC', styleType: 'contrast' }
        ],
        description: 'The classic Indian wedding combination. Rich and timeless.',
        season: 'all'
    }
];

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        await ColorCombination.deleteMany({});
        await ColorCombination.insertMany(combos);
        console.log('Colors seeded!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
