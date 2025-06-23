import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        console.log(`MongoDB connected to successfully`);
    } catch (error) {
        console.error(`DB connected failed : ${error}`);
        process.exit(1);
    }
};

export default connectDB;