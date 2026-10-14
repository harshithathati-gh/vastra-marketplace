require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const TailorProfile = require('../src/models/TailorProfile');
const Order = require('../src/models/Order');
const connectDB = require('../src/config/db');

async function removeDemoTailors() {
    await connectDB();

    console.log('--- Scanning for Demo Tailors in MongoDB ---');
    
    // Demo tailors are identified by @example.com or @vastra.app domains
    const demoTailors = await User.find({
        role: 'tailor',
        $or: [
            { email: { $regex: /@example\.com$/i } },
            { email: { $regex: /@vastra\.app$/i } }
        ]
    });

    console.log(`Found ${demoTailors.length} demo tailors:`);
    demoTailors.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.name} (${t.email}) - Location: ${t.location?.city || 'N/A'}`);
    });

    if (demoTailors.length === 0) {
        console.log('No demo tailors found in database.');
    } else {
        const demoTailorIds = demoTailors.map(t => t._id);

        // 1. Delete TailorProfiles for demo tailors
        const profilesDeleted = await TailorProfile.deleteMany({ userId: { $in: demoTailorIds } });
        console.log(`[-] Deleted ${profilesDeleted.deletedCount} demo TailorProfile documents.`);

        // 2. Delete demo orders associated with these demo tailors
        const ordersDeleted = await Order.deleteMany({ tailorId: { $in: demoTailorIds } });
        console.log(`[-] Deleted ${ordersDeleted.deletedCount} demo orders placed with demo tailors.`);

        // 3. Delete demo tailor Users
        const usersDeleted = await User.deleteMany({ _id: { $in: demoTailorIds } });
        console.log(`[-] Deleted ${usersDeleted.deletedCount} demo tailor User documents.`);
    }

    // Check remaining tailors
    console.log('\n--- Active Registered Real Tailors ---');
    const remainingTailors = await User.find({ role: 'tailor' });
    console.log(`Total real tailors remaining: ${remainingTailors.length}`);

    for (const t of remainingTailors) {
        let profile = await TailorProfile.findOne({ userId: t._id });
        if (!profile) {
            console.log(`[!] Creating default approved profile for real tailor: ${t.name} (${t.email})`);
            profile = await TailorProfile.create({
                userId: t._id,
                bio: `Master Artisan based in ${t.location?.city || 'Telangana'}, offering custom tailoring and bespoke stitching.`,
                specializations: ['men_ethnic', 'women_ethnic', 'alterations'],
                experience: 5,
                serviceArea: [t.location?.city || 'Hyderabad', 'Telangana', 'Pan India'],
                startingPrices: { shirt: 500, kurta: 800, blouse: 700, suit: 2500, lehenga: 3500 },
                verificationStatus: 'approved',
                isActive: true,
            });
        } else {
            // Ensure real tailor is approved and active
            if (profile.verificationStatus !== 'approved' || !profile.isActive) {
                profile.verificationStatus = 'approved';
                profile.isActive = true;
                await profile.save();
                console.log(`[*] Activated & approved profile for: ${t.name}`);
            }
        }
        console.log(`  ✓ ${t.name} | Email: ${t.email} | Phone: ${t.phone || 'N/A'} | City: ${t.location?.city || 'Telangana'} | Status: ${profile.verificationStatus} (Active: ${profile.isActive})`);
    }

    console.log('\nDemo tailors cleanup complete!');
    await mongoose.disconnect();
    process.exit(0);
}

removeDemoTailors().catch(err => {
    console.error('Error removing demo tailors:', err);
    process.exit(1);
});
