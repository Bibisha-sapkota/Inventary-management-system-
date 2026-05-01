const mongoose = require('mongoose');
require('dotenv').config();

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const invoices = mongoose.connection.db.collection('invoices');
        
        console.log('🔍 Checking invoices collection indexes...');
        const indexes = await invoices.indexes();
        console.log('Current indexes:', indexes.map(i => i.name));

        if (indexes.some(i => i.name === 'invoiceNumber_1')) {
            await invoices.dropIndex('invoiceNumber_1');
            console.log('✅ Successfully dropped unique index on invoiceNumber_1');
        } else {
            console.log('ℹ️ Index invoiceNumber_1 not found.');
        }

        console.log('✨ Database fix complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during index drop:', error);
        process.exit(1);
    }
};

dropIndex();
