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

    console.log('Mock tailors cleanup complete. No demo tailors seeded.');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
