const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const promoteUser = async () => {
    const email = process.argv[2];
    const role = process.argv[3] || 'superadmin';

    if (!email) {
        console.error('❌ Please provide an email address: node promote.js <email> [role]');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`⚠️ User with email ${email} not found. Creating a new user...`);
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin@123', salt);
            
            user = await User.create({
                name: 'Super Admin',
                email: email.toLowerCase(),
                password: hashedPassword,
                role: role,
                status: 'active'
            });
            console.log(`✅ Created new user with default password: Admin@123`);
        } else {
            user.role = role;
            await user.save();
        }
        await user.save();

        console.log(`\n🎉 SUCCESS!`);
        console.log(`👤 User: ${user.name}`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`🚀 Role updated to: ${role.toUpperCase()}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error promoting user:', error.message);
        process.exit(1);
    }
};

promoteUser();
