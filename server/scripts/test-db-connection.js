import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root (one directory up from scripts)
dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

console.log('Testing MongoDB Connection...');
console.log('URI:', uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'Undefined'); // Mask password

if (!uri) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
}

mongoose.connect(uri)
    .then(async () => {
        const output = [];
        output.push('--- CONNECTION SUCCESSFUL ---');
        output.push('Database Name: ' + mongoose.connection.name);
        output.push('Host: ' + mongoose.connection.host);

        // List collections
        try {
            const collections = await mongoose.connection.db.listCollections().toArray();
            output.push('Collections: ' + JSON.stringify(collections.map(c => c.name), null, 2));
        } catch (e) {
            output.push('Error listing collections: ' + e.message);
        }

        fs.writeFileSync(path.join(__dirname, 'results.txt'), output.join('\n'));
        console.log('Results written to results.txt');
        process.exit(0);
    })
    .catch((err) => {
        console.error('ERROR: Failed to connect to MongoDB.');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        if (err.name === 'MongooseServerSelectionError') {
            console.error('Hint: Check your IP Whitelist in MongoDB Atlas or your internet connection.');
        }
        process.exit(1);
    });
