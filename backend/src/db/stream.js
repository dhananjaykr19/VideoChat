import dotenv from "dotenv";
import { StreamChat } from "stream-chat";

dotenv.config({
    path : './.env'
});

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error(`Stream API key or secret is missing`);
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try {
        if (!streamClient) {
            throw new Error("Stream client not initialized.");
        }
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.error("Error upserting Stream user ", error);
        throw error;
    }
};

export const generateStreamToken = (userId) => {};