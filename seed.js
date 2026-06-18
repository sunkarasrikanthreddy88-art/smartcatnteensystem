// Seed script to add default menu items to database
// Run this once to populate the database with initial menu items

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const MenuItem = require('./models/MenuItem');
const Admin = require('./models/Admin');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canteen', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const defaultMenuItems = [
    {
        name: 'Veg Sandwich',
        price: 60,
        category: 'Sandwiches',
        image: '/sandwich.jpg',
        available: true
    },
    {
        name: 'Thali Meal',
        price: 150,
        category: 'Meals',
        image: '/meal.jpeg',
        available: true
    },
    {
        name: 'Coffee',
        price: 40,
        category: 'Drinks',
        image: '/coffee.jpg',
        available: true
    },
    {
        name: 'Samosa',
        price: 20,
        category: 'Snacks',
        image: '/samosa.jpeg',
        available: true
    },
    {
        name: 'Biryanis',
        price: 300,
        category: 'Meals',
        image: '/briyanis.webp',
        available: true
    },
    {
        name: 'Milkshakes',
        price: 85,
        category: 'Drinks',
        image: '/milkshake.jpeg',
        available: true
    }
];

async function seedDatabase() {
    try {
        // Get the first admin (or create a default one)
        let admin = await Admin.findOne();

        if (!admin) {
            console.log('No admin found. Please create an admin account first.');
            console.log('Run the server and create an admin through the admin login page.');
            process.exit(1);
        }

        console.log(`Using admin: ${admin.username || admin.email}`);

        // Check if items already exist
        const existingCount = await MenuItem.countDocuments({ adminId: admin._id });

        if (existingCount > 0) {
            console.log(`Database already has ${existingCount} menu items.`);
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            readline.question('Do you want to add these items anyway? (yes/no): ', async (answer) => {
                readline.close();
                if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                    await addItems(admin._id);
                } else {
                    console.log('Seed cancelled.');
                    process.exit(0);
                }
            });
        } else {
            await addItems(admin._id);
        }

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

async function addItems(adminId) {
    try {
        // Add adminId to each item
        const itemsWithAdmin = defaultMenuItems.map(item => ({
            ...item,
            adminId: adminId
        }));

        // Insert items
        const result = await MenuItem.insertMany(itemsWithAdmin);
        console.log(`✅ Successfully added ${result.length} menu items to the database!`);

        process.exit(0);
    } catch (error) {
        console.error('Error adding items:', error);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase();
