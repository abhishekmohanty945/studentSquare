const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('mongoDB connected...');
    } catch (error) {
        console.error(err.message);
        //exit process with error
        process.exit(1);
    }
}

module.exports = connectDB;