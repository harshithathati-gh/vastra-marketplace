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
            name: "Premium Long Kurti",
            description: "An elegant, gracefully flowing long kurti exhibiting perfect traditional craftsmanship.",
            category: "women",
            subCategory: "ethnic",
            type: "long kurti",
            baseImage: "",
            priceRange: { min: 1400, max: 2800 },
            isActive: true
        });

        await p.save();
        console.log("Successfully created long kurti object in database!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
seed();
