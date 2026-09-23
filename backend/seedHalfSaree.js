require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, default: '' },
    baseImage: { type: String, default: '' },
    priceRange: { min: Number, max: Number },
    isActive: { type: Boolean, default: true }
});

let Product;
try {
    Product = mongoose.model('Product');
} catch (error) {
    Product = mongoose.model('Product', productSchema);
}

async function seed() {
    try {
        console.log('Connecting to', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);

        const p = new Product({
            name: "Half Saree",
            description: "A gorgeous flared traditional Half Saree crafted with vibrant hues offering regal ethnic beauty.",
            category: "women",
            subCategory: "ethnic",
            type: "half saree",
            baseImage: "",
            priceRange: { min: 4500, max: 15000 },
            isActive: true
        });

        await p.save();
        console.log("Successfully created Half Saree object in database!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
seed();
