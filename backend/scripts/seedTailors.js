require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const TailorProfile = require('../src/models/TailorProfile');
const connectDB = require('../src/config/db');

async function seed() {
    await connectDB();

    const categories = [
        ['men_ethnic', 'Men\'s Ethnic Expert'],
        ['men_western', 'Men\'s Western Specialist'],
        ['women_ethnic', 'Women\'s Ethnic Boutique'],
        ['women_western', 'Modern Western Women\'s Core'],
        ['kids', 'Little Stitches Kids Pro'],
        ['bridal', 'Premium Bridal Collections'],
        ['uniforms', 'Corporate Uniform Factory'],
        ['alterations', 'Express Alteration Master'],
        ['embroidery', 'Handloom Embroidery Artist'],
        ['designer', 'Exquisite Designer Wear']
    ];

    for (let i = 0; i < categories.length; i++) {
        const cat = categories[i][0];
        const nameDesc = categories[i][1];
        const nameKey = cat.replace(/[^a-zA-Z]/g, '').toLowerCase();
        const email = `mock_${nameKey}@vastra.app`;

        let user = await User.findOne({ email });
        if (!user) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            user = await User.create({
                name: `Vastra ${nameDesc}`,
                email,
                password: hashedPassword,
                phone: `987654321${i}`,
                role: 'tailor',
                isVerified: true,
                location: { city: 'Mumbai', state: 'MH', coordinates: { lat: 19.0760, lng: 72.8777 } }
            });

            await TailorProfile.create({
                userId: user._id,
                bio: `Premier specialist catering exclusively to ${nameDesc} designs with impeccable Vastra standards.`,
                specializations: [cat],
                experience: 5 + i,
                serviceArea: ['Mumbai'],
                startingPrices: { shirt: 500, suit: 2000, lehenga: 5000 },
                portfolio: [],
                verificationStatus: 'approved',
                averageRating: 4.8,
                totalReviews: 12,
                isActive: true
            });
            console.log(`[+] Seeded tailor for category: ${cat}`);
        } else {
            console.log(`[*] Tailor for ${cat} already exists.`);
            await TailorProfile.findOneAndUpdate(
                { userId: user._id },
                { $addToSet: { specializations: cat } }
            );
        }
    }

    console.log('Seeding complete.');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
