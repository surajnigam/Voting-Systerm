import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// const mongoUrl = 'mongodb://localhost:27017/dummy_database';
// const mongoUrl = 'mongodb+srv://nigamsuraj232_db_user:Dbnigam232@nodepro1.xnuzwep.mongodb.net/';

// const mongoUrl = process.env.MONGO_URL_LOCAL;
const mongoUrl = process.env.MONGO_URL;

mongoose.connect(mongoUrl); // ✅ no options

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.on('connected', () => {
    console.log('✅ Connected to MongoDB');
});

db.on('disconnected', () => {
    console.log('❌ Disconnected from MongoDB');
});

db.on('reconnected', () => {
    console.log('🔄 Reconnected to MongoDB');
});

export default db;