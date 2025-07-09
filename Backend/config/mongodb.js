import mongoose from "mongoose";
import fs from 'fs';
//const MONGODB_URI = "mongodb+srv://myAtlasDBUser:sivaganesh@cluster0.az1eh.mongodb.net/e-commerce?retryWrites=true&w=majority"

const connectDB = async () => {

    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        //useNewUrlParser: true,
        //useUnifiedTopology: true,
        bufferCommands: false,
        serverSelectionTimeoutMS: 30000,
      });
        console.log('MongoDB connected');
      } catch (err) {
        console.log('MongoDB connection error:', err.message);
        process.exit(1);
      }}


export default connectDB;
