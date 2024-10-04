const mongoose = require('mongoose');

const mongo_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(mongo_URI, {
            dbName: 'fcc-url-shortener',
        });
        console.log('MongoDB Connected...');
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = connectDB;