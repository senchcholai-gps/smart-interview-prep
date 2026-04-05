import mongoose from "mongoose";
const connectDB = async (): Promise<void> => {
    try {
        mongoose.set('strictQuery', false);
        console.log("Connected to:", process.env.MONGODB_URI); // TEMP LOG
        // Add timeout to prevent hanging
        const conn = await mongoose.connect(
            process.env.MONGODB_URI || "mongodb://localhost:27017/smart-interview-prep",
            { 
                serverSelectionTimeoutMS: 5000, // 5 second timeout
                socketTimeoutMS: 45000 
            }
        );
        console.log(`? MongoDB Connected: ${conn.connection.host}`);
        return;
    } catch (error: any) {
        console.error(`? MongoDB Connection Error: ${error.message}`);
        throw error; // Re-throw so index.ts knows it failed
    }
};
export default connectDB;
