require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const res = await mongoose.connection.collection('products').updateOne(
            { _id: new mongoose.Types.ObjectId('6acc9ae7857228141ae4573c') },
            {
                $set: {
                    name: 'Kids Women Kurta Set',
                    type: 'kids women kurta',
                    category: 'women',
                    subCategory: 'ethnic',
                    description: 'Graceful and charming Kids Women Kurta Set tailored with delicate ethnic embroidery and breezy festive comfort.'
                }
            }
        );
        console.log('Update result:', res);
        const updated = await mongoose.connection.collection('products').findOne({ _id: new mongoose.Types.ObjectId('6acc9ae7857228141ae4573c') });
        console.log('Updated product in DB:', updated);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
