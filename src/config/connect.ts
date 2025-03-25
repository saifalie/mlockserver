import mongoose from 'mongoose';
import { DB_URL } from '../../secrets.js';

// Function to establish a connection to the MongoDB database
export const connectDB = async () => {
    try {
        // Attempt to connect to the MongoDB database using the provided DB_URL
        const connectionInstance = await mongoose.connect(`${DB_URL}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        // Log an error message if the connection fails
        console.log(`MongoDB connection failed error: ${error}`);

        // Exit the process with a failure code
        process.exit(1);
    }
};
