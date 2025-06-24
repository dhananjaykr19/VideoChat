import { User } from "../models/User.model.js";
import jwt from "jsonwebtoken";

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user._id;
        // const currentUser = await User.findById(currentUserId);
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and : [
                { _id : {$ne : currentUserId}}, // exclude current user
                { _id : {$nin : currentUser.friends }}, // exclude current user friends
                { isOnboarded : true},
            ],
        });
        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.log("Error in getRecommendedUsers controllers ", error.message);
        res.status(500).json({
            message : "Internal server error"
        });
    }
}

export async function getMyFriends(req, res) {
    
}