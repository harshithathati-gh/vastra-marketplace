require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const TailorProfile = require('../src/models/TailorProfile');
const connectDB = require('../src/config/db');

async function seed() {
    await connectDB();

    console.log('[*] Flushing old Vastra system mock tailors...');
    const oldMocks = await User.find({ email: /@vastra\.app$/ });
    if (oldMocks.length > 0) {
        const oldMockIds = oldMocks.map(u => u._id);
        await TailorProfile.deleteMany({ userId: { $in: oldMockIds } });
        await User.deleteMany({ _id: { $in: oldMockIds } });
        console.log(`[-] Removed ${oldMocks.length} old generic tailors from the database.`);
    }

    const authenticTailors = [
        ['men_ethnic', 'Rajesh Masterji - Kurta Specialists', 'rajesh_ethnic@vastra.app', 'Expert in bespoke sherwanis and traditional kurtas for over 15 years.', 'Mumbai'],
        ['men_western', 'Alok Custom Fits', 'alok_western@vastra.app', 'Specializing in sharp, modern western suits and tailored formalwear for men.', 'Delhi'],
        ['women_ethnic', 'Ayesha Designer Boutique', 'ayesha_ethnic@vastra.app', 'Handcrafted traditional wear, anarkalis, and sarees sourced from artisan fabrics.', 'Jaipur'],
        ['women_western', 'Priya Modern Stitches', 'priya_western@vastra.app', 'Contemporary western tailoring, custom dresses, and evening gowns for women.', 'Bangalore'],
        ['kids', 'Little Wonders Tailoring', 'wonders_kids@vastra.app', 'Comfortable, stylish, and exact-fit clothing crafted specifically for children.', 'Pune'],
        ['bridal', 'Kareena Bridal Couture', 'kareena_bridal@vastra.app', 'Exquisite, detailed, and luxurious wedding attire. Making your big day truly special.', 'Hyderabad'],
        ['uniforms', 'Apex Uniform Tailors', 'apex_uniforms@vastra.app', 'Bulk and custom corporate, school, and industrial uniform manufacturers.', 'Chennai'],
        ['alterations', 'QuickFix Stitches by Amit', 'amit_alterations@vastra.app', 'Fast, reliable, and precise alteration services for all types of garments.', 'Kolkata'],
        ['embroidery', 'Shilpa Handloom Studio', 'shilpa_embroidery@vastra.app', 'Intricate handloom embroidery, zardosi work, and traditional threading.', 'Surat'],
        ['designer', 'Arjun Fashion Labs', 'arjun_designer@vastra.app', 'Avant-garde designer tailoring, blending modern silhouettes with classic techniques.', 'Goa']
    ];

    for (let i = 0; i < authenticTailors.length; i++) {
        const [cat, nameDesc, email, bioDesc, cityId] = authenticTailors[i];

        const hashedPassword = await bcrypt.hash('password123', 10);
        let user = await User.create({
            name: nameDesc,
            email,
            password: hashedPassword,
            phone: `998877665${i}`,
            role: 'tailor',
            isVerified: true,
            location: { city: cityId, state: 'MH', coordinates: { lat: 19.0760, lng: 72.8777 } }
        });

        await TailorProfile.create({
            userId: user._id,
            bio: bioDesc,
            specializations: [cat],
            experience: 8 + i,
            serviceArea: [cityId, 'Pan India'],
            startingPrices: { shirt: 400 + (i * 100), suit: 2500, lehenga: 4000 },
            portfolio: [],
            verificationStatus: 'approved',
            averageRating: (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1),
            totalReviews: Math.floor(Math.random() * 80) + 10,
            isActive: true
        });
        console.log(`[+] Seeded authentic tailor: ${nameDesc} (${cat})`);
    }

    console.log('Authentic seeding complete.');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
