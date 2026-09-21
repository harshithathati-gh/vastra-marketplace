const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const ColorCombination = require('./src/models/ColorCombination');

const newCombos = [
    {
        baseColor: { name: 'Peach', hex: '#FFE5B4' },
        complementaryColors: [
            { name: 'Sea Green', hex: '#2E8B57', styleType: 'contrast' },
            { name: 'Soft Gold', hex: '#F3E5AB', styleType: 'accent' }
        ],
        description: 'An elegant, pastel summer vibe perfect for daytime functions and lightweight ethnic gowns.',
        season: 'summer'
    },
    {
        baseColor: { name: 'Navy Blue', hex: '#000080' },
        complementaryColors: [
            { name: 'Silver', hex: '#C0C0C0', styleType: 'accent' },
            { name: 'Burgundy', hex: '#800020', styleType: 'contrast' }
        ],
        description: 'A sleek and sophisticated evening wear palette. Great for Mens Sherwanis and sharp Suits.',
        season: 'winter'
    },
    {
        baseColor: { name: 'Mustard Yellow', hex: '#FFDB58' },
        complementaryColors: [
            { name: 'Hot Pink', hex: '#FF69B4', styleType: 'complementary' },
            { name: 'Teal', hex: '#008080', styleType: 'contrast' }
        ],
        description: 'A highly vibrant and traditional combination, ideal for festive celebrations like Haldi ceremonies.',
        season: 'all'
    },
    {
        baseColor: { name: 'Magenta', hex: '#FF00FF' },
        complementaryColors: [
            { name: 'Antique Gold', hex: '#B8860B', styleType: 'accent' },
            { name: 'Orange', hex: '#FFA500', styleType: 'accent' }
        ],
        description: 'A rich and heavy festive look that pops beautifully in photographs.',
        season: 'all'
    },
    {
        baseColor: { name: 'Ivory', hex: '#FFFFF0' },
        complementaryColors: [
            { name: 'Rose Gold', hex: '#B76E79', styleType: 'accent' },
            { name: 'Champagne', hex: '#F7E7CE', styleType: 'monochromatic' }
        ],
        description: 'A subtle, elegant modern bridal look. Very popular for minimalist Lehengas.',
        season: 'all'
    },
    {
        baseColor: { name: 'Emerald Green', hex: '#50C878' },
        complementaryColors: [
            { name: 'Rust', hex: '#B7410E', styleType: 'contrast' },
            { name: 'Copper', hex: '#B87333', styleType: 'accent' }
        ],
        description: 'A deep, royal contrast that works well for velvet fabrics and winter weddings.',
        season: 'winter'
    }
];

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        // Append the new ones rather than overwriting
        await ColorCombination.insertMany(newCombos);
        console.log('Extra colors seeded!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
