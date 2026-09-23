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
            name: "Anarkali Suit",
            description: "A gorgeous flared Anarkali offering a truly striking ethnic grace.",
            category: "women",
            subCategory: "ethnic",
            type: "anarkali",
            baseImage: "",
            priceRange: { min: 2500, max: 8000 },
            isActive: true
        });

        await p.save();
        console.log("Successfully created Anarkali object in database!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
seed();
