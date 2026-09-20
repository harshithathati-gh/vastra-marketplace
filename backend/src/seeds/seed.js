const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const TailorProfile = require('../models/TailorProfile');
const Product = require('../models/Product');
const PlatformSettings = require('../models/PlatformSettings');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vastra');
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await TailorProfile.deleteMany({});
        await Product.deleteMany({});
        await PlatformSettings.deleteMany({});

        // ======= ADMIN USER =======
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@vastra.com',
            phone: '9999999999',
            password: 'admin123',
            role: 'admin',
            location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        });
        console.log('✅ Admin created: admin@vastra.com / admin123');

        // ======= CUSTOMERS =======
        const customers = await User.insertMany([
            {
                name: 'Priya Sharma',
                email: 'priya@example.com',
                phone: '9876543210',
                password: await bcrypt.hash('password123', 10),
                role: 'customer',
                location: { city: 'Delhi', state: 'Delhi', pincode: '110001' },
            },
            {
                name: 'Rahul Kumar',
                email: 'rahul@example.com',
                phone: '9876543211',
                password: await bcrypt.hash('password123', 10),
                role: 'customer',
                location: { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
            },
            {
                name: 'Ananya Patel',
                email: 'ananya@example.com',
                phone: '9876543212',
                password: await bcrypt.hash('password123', 10),
                role: 'customer',
                location: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' },
            },
        ]);
        console.log(`✅ ${customers.length} customers created`);

        // ======= TAILORS =======
        const tailorUsers = await User.insertMany([
            {
                name: 'Rajesh Darzi',
                email: 'rajesh@example.com',
                phone: '9876543220',
                password: await bcrypt.hash('password123', 10),
                role: 'tailor',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001', coordinates: { lat: 19.076, lng: 72.8777 } },
            },
            {
                name: 'Meena Boutique',
                email: 'meena@example.com',
                phone: '9876543221',
                password: await bcrypt.hash('password123', 10),
                role: 'tailor',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                location: { city: 'Jaipur', state: 'Rajasthan', pincode: '302001', coordinates: { lat: 26.9124, lng: 75.7873 } },
            },
            {
                name: 'Ahmed Silai Centre',
                email: 'ahmed@example.com',
                phone: '9876543222',
                password: await bcrypt.hash('password123', 10),
                role: 'tailor',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
                location: { city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', coordinates: { lat: 26.8467, lng: 80.9462 } },
            },
            {
                name: 'Lakshmi Tailors',
                email: 'lakshmi@example.com',
                phone: '9876543223',
                password: await bcrypt.hash('password123', 10),
                role: 'tailor',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
                location: { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', coordinates: { lat: 13.0827, lng: 80.2707 } },
            },
            {
                name: 'Suresh Fashion Studio',
                email: 'suresh@example.com',
                phone: '9876543224',
                password: await bcrypt.hash('password123', 10),
                role: 'tailor',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
                location: { city: 'Hyderabad', state: 'Telangana', pincode: '500001', coordinates: { lat: 17.385, lng: 78.4867 } },
            },
            {
                name: 'Kavita Designer Studio',
                email: 'kavita@example.com',
                phone: '9876543225',
                password: await bcrypt.hash('password123', 10),
                role: 'tailor',
                avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
                location: { city: 'Delhi', state: 'Delhi', pincode: '110002', coordinates: { lat: 28.6139, lng: 77.209 } },
            },
        ]);

        // Create tailor profiles
        const tailorProfiles = await TailorProfile.insertMany([
            {
                userId: tailorUsers[0]._id,
                bio: 'Expert in men\'s formal and ethnic wear with 15+ years of experience. Specializing in perfect-fit shirts and sherwanis for all occasions.',
                specializations: ['men_ethnic', 'men_western', 'embroidery'],
                experience: 15,
                serviceArea: ['Mumbai', 'Thane', 'Navi Mumbai', 'Pan India'],
                startingPrices: { shirt: 800, trousers: 600, kurta: 1200, sherwani: 8000, suit: 5000 },
                portfolio: [
                    { imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800', caption: 'Hand-embroidered Sherwani', category: 'ethnic' },
                    { imageUrl: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800', caption: 'Custom Formal Shirt', category: 'western' },
                    { imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', caption: 'Tailored Business Suit', category: 'western' },
                ],
                verificationStatus: 'approved',
                averageRating: 4.8,
                totalReviews: 124,
                totalOrders: 350,
                isActive: true,
            },
            {
                userId: tailorUsers[1]._id,
                bio: 'Specializing in bridal lehengas and ethnic women\'s wear. Every piece is handcrafted with love, using traditional Rajasthani techniques.',
                specializations: ['women_ethnic', 'bridal', 'embroidery', 'designer'],
                experience: 12,
                serviceArea: ['Jaipur', 'Jodhpur', 'Udaipur', 'Pan India'],
                startingPrices: { lehenga: 15000, blouse: 1500, kurti: 1000, saree_blouse: 1200, suit: 3000 },
                portfolio: [
                    { imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', caption: 'Bridal Lehenga', category: 'bridal' },
                    { imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800', caption: 'Designer Kurti Collection', category: 'ethnic' },
                ],
                verificationStatus: 'approved',
                averageRating: 4.9,
                totalReviews: 89,
                totalOrders: 210,
                isActive: true,
            },
            {
                userId: tailorUsers[2]._id,
                bio: 'Lucknow\'s finest Chikan embroidery specialist. Creating beautiful Chikankari kurtas and suits with intricate hand-embroidery work.',
                specializations: ['men_ethnic', 'women_ethnic', 'embroidery'],
                experience: 20,
                serviceArea: ['Lucknow', 'Kanpur', 'Varanasi', 'Pan India'],
                startingPrices: { kurta: 1500, kurti: 1200, suit: 3500, shirt: 1000 },
                portfolio: [
                    { imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800', caption: 'Chikankari Kurta', category: 'ethnic' },
                ],
                verificationStatus: 'approved',
                averageRating: 4.7,
                totalReviews: 156,
                totalOrders: 500,
                isActive: true,
            },
            {
                userId: tailorUsers[3]._id,
                bio: 'South Indian silk specialist. We create stunning Kanchipuram silk blouses and contemporary fusion wear for the modern woman.',
                specializations: ['women_ethnic', 'women_western', 'designer'],
                experience: 8,
                serviceArea: ['Chennai', 'Coimbatore', 'Madurai', 'Pan India'],
                startingPrices: { blouse: 2000, saree_blouse: 2500, kurti: 1500, dress: 3000 },
                portfolio: [
                    { imageUrl: 'https://images.unsplash.com/photo-1617627143233-46b3e7d89b89?w=800', caption: 'Silk Blouse Work', category: 'ethnic' },
                ],
                verificationStatus: 'approved',
                averageRating: 4.6,
                totalReviews: 67,
                totalOrders: 180,
                isActive: true,
            },
            {
                userId: tailorUsers[4]._id,
                bio: 'Complete fashion studio offering men\'s and women\'s tailoring. From everyday casuals to party wear, we do it all with precision.',
                specializations: ['men_western', 'women_western', 'men_ethnic', 'alterations'],
                experience: 10,
                serviceArea: ['Hyderabad', 'Secunderabad', 'Pan India'],
                startingPrices: { shirt: 700, trousers: 500, kurta: 900, kurti: 800, dress: 2000, suit: 4000 },
                portfolio: [
                    { imageUrl: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800', caption: 'Casual Collection', category: 'western' },
                ],
                verificationStatus: 'approved',
                averageRating: 4.4,
                totalReviews: 92,
                totalOrders: 280,
                isActive: true,
            },
            {
                userId: tailorUsers[5]._id,
                bio: 'Delhi-based designer studio specializing in bridal and party wear. Creating dream outfits with contemporary designs and traditional elegance.',
                specializations: ['bridal', 'designer', 'women_ethnic', 'women_western'],
                experience: 6,
                serviceArea: ['Delhi', 'Noida', 'Gurgaon', 'Pan India'],
                startingPrices: { lehenga: 20000, blouse: 2000, dress: 5000, suit: 6000, kurti: 2000 },
                portfolio: [
                    { imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', caption: 'Designer Bridal Collection', category: 'bridal' },
                    { imageUrl: 'https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?w=800', caption: 'Contemporary Fusion Wear', category: 'designer' },
                ],
                verificationStatus: 'approved',
                averageRating: 4.5,
                totalReviews: 45,
                totalOrders: 120,
                isActive: true,
            },
        ]);
        console.log(`✅ ${tailorProfiles.length} tailor profiles created`);

        // ======= PRODUCTS =======
        const products = await Product.insertMany([
            // Men's Ethnic
            {
                name: 'Kurta',
                category: 'men',
                subCategory: 'ethnic',
                type: 'kurta',
                description: 'Traditional Indian kurta in various styles — perfect for festivals, weddings, and daily wear.',
                baseImage: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800',
                designOptions: {
                    collarTypes: ['Mandarin', 'Band', 'Nehru', 'Spread'],
                    sleeveStyles: ['Full Sleeve', 'Half Sleeve', 'Three-Quarter', 'Roll-Up'],
                    fitTypes: ['Regular', 'Slim', 'Relaxed'],
                    embroideryOptions: ['None', 'Chikankari', 'Thread Work', 'Mirror Work', 'Zari'],
                    fabricTypes: ['Cotton', 'Silk', 'Linen', 'Khadi', 'Chanderi'],
                },
                priceRange: { min: 800, max: 5000 },
            },
            {
                name: 'Sherwani',
                category: 'men',
                subCategory: 'ethnic',
                type: 'sherwani',
                description: 'Royal sherwani for weddings and grand occasions. Available in various embroidery styles.',
                baseImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
                designOptions: {
                    collarTypes: ['Mandarin', 'Shawl', 'Notch'],
                    sleeveStyles: ['Full Sleeve'],
                    fitTypes: ['Regular', 'Slim'],
                    embroideryOptions: ['Zari', 'Thread Work', 'Sequin', 'Stone Work', 'Hand Embroidery'],
                    fabricTypes: ['Silk', 'Brocade', 'Velvet', 'Jacquard'],
                },
                priceRange: { min: 5000, max: 50000 },
            },
            // Men's Western
            {
                name: 'Formal Shirt',
                category: 'men',
                subCategory: 'western',
                type: 'shirt',
                description: 'Custom-fitted formal & casual shirts. Get the perfect fit tailored to your measurements.',
                baseImage: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800',
                designOptions: {
                    collarTypes: ['Regular', 'Spread', 'Button-Down', 'Mandarin', 'Cutaway', 'Wing'],
                    sleeveStyles: ['Full Sleeve', 'Half Sleeve', 'Roll-Up'],
                    fitTypes: ['Regular', 'Slim', 'Classic'],
                    fabricTypes: ['Cotton', 'Linen', 'Poly-Cotton', 'Oxford', 'Twill'],
                },
                priceRange: { min: 500, max: 3000 },
            },
            {
                name: 'Trousers',
                category: 'men',
                subCategory: 'western',
                type: 'trousers',
                description: 'Perfectly tailored trousers for work and casual occasions.',
                baseImage: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
                designOptions: {
                    fitTypes: ['Regular', 'Slim', 'Tapered', 'Straight'],
                    fabricTypes: ['Cotton', 'Poly-Cotton', 'Linen', 'Wool Blend', 'Chino'],
                },
                priceRange: { min: 400, max: 2500 },
            },
            {
                name: 'Suit (2-Piece)',
                category: 'men',
                subCategory: 'western',
                type: 'suit',
                description: 'Professional two-piece suit with jacket and trousers. Tailored for the perfect silhouette.',
                baseImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
                designOptions: {
                    collarTypes: ['Notch Lapel', 'Peak Lapel', 'Shawl Lapel'],
                    fitTypes: ['Regular', 'Slim', 'Classic'],
                    fabricTypes: ['Wool', 'Poly-Wool', 'Linen', 'Cotton'],
                },
                priceRange: { min: 3000, max: 25000 },
            },
            // Women's Ethnic
            {
                name: 'Lehenga',
                category: 'women',
                subCategory: 'ethnic',
                type: 'lehenga',
                description: 'Beautiful lehengas for weddings, engagements, and festive occasions.',
                baseImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
                designOptions: {
                    sleeveStyles: ['Sleeveless', 'Cap Sleeve', 'Full Sleeve', 'Puff Sleeve'],
                    necklineTypes: ['Round', 'V-Neck', 'Sweetheart', 'Boat Neck', 'Deep Back'],
                    embroideryOptions: ['Zari', 'Sequin', 'Thread Work', 'Mirror Work', 'Gota Patti', 'Resham'],
                    fabricTypes: ['Silk', 'Net', 'Georgette', 'Velvet', 'Satin', 'Brocade'],
                },
                priceRange: { min: 10000, max: 100000 },
            },
            {
                name: 'Blouse / Saree Blouse',
                category: 'women',
                subCategory: 'ethnic',
                type: 'blouse',
                description: 'Custom-stitched blouses for sarees. From simple to designer — get the perfect blouse.',
                baseImage: 'https://images.unsplash.com/photo-1617627143233-46b3e7d89b89?w=800',
                designOptions: {
                    sleeveStyles: ['Sleeveless', 'Cap Sleeve', 'Puff Sleeve', 'Full Sleeve', 'Three-Quarter', 'Bell Sleeve'],
                    necklineTypes: ['Round', 'V-Neck', 'Boat Neck', 'High Neck', 'Halter', 'Princess Cut'],
                    embroideryOptions: ['None', 'Thread Work', 'Zari', 'Mirror Work', 'Maggam Work', 'Patch Work'],
                    fabricTypes: ['Silk', 'Cotton', 'Brocade', 'Velvet', 'Net', 'Georgette'],
                },
                priceRange: { min: 800, max: 8000 },
            },
            {
                name: 'Kurti',
                category: 'women',
                subCategory: 'ethnic',
                type: 'kurti',
                description: 'Stylish kurtis for daily wear, office wear, and casual outings.',
                baseImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
                designOptions: {
                    collarTypes: ['Mandarin', 'Band', 'Peter Pan', 'Shirt Collar'],
                    sleeveStyles: ['Sleeveless', 'Cap Sleeve', 'Half Sleeve', 'Three-Quarter', 'Full Sleeve', 'Bell Sleeve'],
                    necklineTypes: ['Round', 'V-Neck', 'Keyhole', 'Boat Neck'],
                    fabricTypes: ['Cotton', 'Rayon', 'Silk', 'Georgette', 'Chanderi', 'Khadi'],
                },
                priceRange: { min: 500, max: 4000 },
            },
            {
                name: 'Salwar Suit',
                category: 'women',
                subCategory: 'ethnic',
                type: 'suit',
                description: 'Complete salwar suit set — kurta + salwar/churidar + dupatta. Traditional elegance.',
                baseImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
                designOptions: {
                    sleeveStyles: ['Half Sleeve', 'Three-Quarter', 'Full Sleeve', 'Bell Sleeve'],
                    necklineTypes: ['Round', 'V-Neck', 'Boat Neck', 'Collar'],
                    embroideryOptions: ['None', 'Chikankari', 'Phulkari', 'Thread Work', 'Mirror Work'],
                    fabricTypes: ['Cotton', 'Silk', 'Georgette', 'Lawn', 'Chanderi'],
                },
                priceRange: { min: 1500, max: 15000 },
            },
            // Women's Western
            {
                name: 'Dress',
                category: 'women',
                subCategory: 'western',
                type: 'dress',
                description: 'Custom dresses for every occasion — from casual to cocktail to evening wear.',
                baseImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
                designOptions: {
                    sleeveStyles: ['Sleeveless', 'Spaghetti', 'Cap Sleeve', 'Half Sleeve', 'Full Sleeve'],
                    necklineTypes: ['Round', 'V-Neck', 'Sweetheart', 'Halter', 'Off-Shoulder', 'Square'],
                    fitTypes: ['A-Line', 'Bodycon', 'Sheath', 'Wrap', 'Flared'],
                    fabricTypes: ['Cotton', 'Crepe', 'Georgette', 'Satin', 'Chiffon', 'Silk'],
                },
                priceRange: { min: 1500, max: 10000 },
            },
            // Kids
            {
                name: 'Kids Kurta Set',
                category: 'kids',
                subCategory: 'ethnic',
                type: 'kurta',
                description: 'Adorable ethnic wear for kids — kurta with pajama or dhoti for little ones.',
                baseImage: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800',
                designOptions: {
                    sleeveStyles: ['Half Sleeve', 'Full Sleeve'],
                    embroideryOptions: ['None', 'Simple Thread', 'Zari Border'],
                    fabricTypes: ['Cotton', 'Silk', 'Linen'],
                },
                priceRange: { min: 500, max: 3000 },
            },
        ]);
        console.log(`✅ ${products.length} products created`);

        // ======= PLATFORM SETTINGS =======
        await PlatformSettings.create({
            commissionPercentage: 10,
            minOrderAmount: 200,
            advancePercentage: 50,
            supportedLocations: [
                { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane'] },
                { state: 'Delhi', cities: ['New Delhi', 'Delhi'] },
                { state: 'Karnataka', cities: ['Bangalore', 'Mysore'] },
                { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur'] },
                { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai'] },
                { state: 'Telangana', cities: ['Hyderabad', 'Secunderabad'] },
                { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Varanasi'] },
                { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara'] },
            ],
        });
        console.log('✅ Platform settings created');

        console.log('\n🎉 Database seeded successfully!\n');
        console.log('Login credentials (all passwords: password123):');
        console.log('  Admin:    admin@vastra.com / admin123');
        console.log('  Customer: priya@example.com');
        console.log('  Customer: rahul@example.com');
        console.log('  Tailor:   rajesh@example.com');
        console.log('  Tailor:   meena@example.com');
        console.log('  Tailor:   ahmed@example.com');
        console.log('  Tailor:   lakshmi@example.com');
        console.log('  Tailor:   suresh@example.com');
        console.log('  Tailor:   kavita@example.com');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDB();
