import { FriendRequest } from "../models/FriendRequest.model.js";
import { User } from "../models/User.model.js";
import jwt from "jsonwebtoken";

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user.id;
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
    try {
        const user = await User.findById(req.user._id)
        .select("friends")
        .populate("friends", "fullName profilePic nativeLanguage learningLanguage location");
        
        res.status(200).json(user.friends);
    } catch (error) {
        console.log("Error in getMyFriends controller : ", error.message);
        res.status(500).json({
            message : "Internal server error"
        });
    }
}

export async function sendFriendRequest(req, res){
    try {
        const myId = req.user._id;
        const { id : recipientId } = req.params;
    
        // prevent sending req to yourself
        if(myId === recipientId){
            return res.status(400).json({
                message : "You can't send friend request to yourself"
            });
        }
    
        const recipient = await User.findById(recipientId);
        if(!recipient){
            return res.status(404).json({
                message : "Recipient not found"
            });
        }

        // check if user is already friend
        if(recipient.friends.includes(myId)){
            return res.status(400).json({
                message : "You are already friends of this user"
            });
        }

        // check if a req already exists
        const existingRequest = await FriendRequest.findOne({
            $or : [
                {sender : myId, recipient : recipientId},
                {sender : recipientId, recipient : myId}
            ],
        });
        if(existingRequest){
            return res.status(400).json({
                message : "A friend request already exists between you and this user"
            });
        }

        // creating friend request
        const friendRequest = await FriendRequest.create({
            sender : myId,
            recipient : recipientId,
        });

        res.status(201).json(friendRequest);
    } catch (error) {
        console.log("Error in sendFriendRequest controller : ", error.message);
        res.status(500).json({
            message : "Internal server error"
        });
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const { id : requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);
        if(!friendRequest){
            return res.status(404).json({
                message : "friend request not found"
            });
        }

        // verify the current user is recipient
        if(friendRequest.recipient.toString() !== req.user._id){
            return res.status(403).json({
                message : "You are not authorized to accept this request"
            });
        }

        if (friendRequest.status === "accepted") {
            return res.status(400).json({ message: "Friend request already accepted" });
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        // add each user to the other's frineds array
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet : { friends : friendRequest.recipient},
        });
        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet : { friends : friendRequest.sender},
        });

        res.status(200).json({
            message : "Friend request accepted"
        });
    } catch (error) {
        console.log("Error in acceptFriendRequest controller : ", error.message);
        res.status(500).json({
            message : "Internal server error"
        });
    }
}

export async function getFriendRequests(req, res) {
    try {
        const incomingReqs = await FriendRequest.find({
            recipient : req.user._id,
            status : "pending",
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage location");

        const acceptRequest = await FriendRequest.find({
            sender : req.user._id,
            status : "accepted"
        }).populate("recipient", "fullName profilePic");

        res.status(200).json({incomingReqs, acceptRequest});
    } catch (error) {
        console.error("Error in getFriendRequests controller:", error.message);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function getOutgoingRequest(req, res) {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender : req.user._id,
            status : "pending"
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage location");

        res.status(200).json(outgoingRequests);
    } catch (error) {
        console.error("Error in getOutgoingRequests controller:", error.message);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}