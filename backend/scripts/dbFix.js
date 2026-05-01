const mongoose = require('mongoose');
require('dotenv').config();

const dbFix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        if (collectionNames.includes('orders')) {
            console.log('🔍 Checking orders collection indexes...');
            const orders = mongoose.connection.db.collection('orders');
            
            // Try to drop invoiceNumber_1 if it exists
            try {
                await orders.dropIndex('invoiceNumber_1');
                console.log('✅ Dropped unique index on invoiceNumber_1');
            } catch (e) {
                console.log('ℹ️ Index invoiceNumber_1 not found or already dropped.');
            }
        }

        console.log('✨ Database repair complete! Mongoose will recreate indexes correctly on restart.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during database fix:', error);
        process.exit(1);
    }
};

dbFix();
