import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path : './.env'
});

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.error(`Error Occur ! ${error}`);
        throw error;
    });
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.error(`MongoDB connected failed ! ${err}`);
})