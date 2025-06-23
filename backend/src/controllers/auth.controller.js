import { upsertStreamUser } from "../db/stream.js";
import { User } from "../models/User.model.js";
import  jwt  from "jsonwebtoken";

export async function signup(req, res){
    const {email, password, fullName } = req.body;
    try {
        if(!email || !password || !fullName){
            return res.status(400).json({
                message : "All fileds are required!"
            });
        }
        if(password.length  < 6){
            return res.status(400).json({
                message : "Password must be at least 6 character"
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({
                message : "Invalid email format"
            });
        }
        const existUser = await User.findOne({email});
        if(existUser){
            return res.status(400).json({
                message : "Email already existed please use a different one"
            });
        }

        // const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://i.pravatar.cc/300`;

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic : randomAvatar
        });

        try {
            await upsertStreamUser({
                id : newUser._id,
                name : newUser.fullName,
                image : newUser.profilePic || "",
            });
            console.log(`Stream user create for ${newUser.fullName}`);
        } catch (error) {
            console.log(`Error creating stream user ${error}`);
        }

        const token = jwt.sign({userId : newUser._id}, process.env.JWT_SECRET_KEY, {
            expiresIn : "7d"
        });

        res.cookie("jwt", token, {
            maxAge : 7 * 24 * 60 * 60 * 1000,
            httpOnly : true,
            sameSite : "strict",
            secure : process.env.NODE_ENV === "production"
        });

        res.status(201).json({
            success : true,
            user : newUser
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
}
export async function login(req, res){
    try {
        const { email, password }  = req.body;

        if(!email || !password ){
            return res.status(400).json({
                message : "All fields are required !"
            });
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message : "Invalid email or password"
            });
        }

        const isPasswordCorrect = await user.matchPassword(password);
        if(!isPasswordCorrect){
            return res.status(400).json({
                message : "Invalid Password"
            });
        }

        const token = jwt.sign({userId : user._id}, process.env.JWT_SECRET_KEY, {
            expiresIn : "7d"
        });

        res.cookie("jwt", token, {
            maxAge : 7 * 24 * 60 * 60 * 1000,
            httpOnly : true,
            sameSite : "strict",
            secure : process.env.NODE_ENV === "production"
        });

        res.status(200).json({
            success : true,
            user : user
        });
    } catch (error) {
        console.log("Error in login Controller :", error.message);
        res.status(500).json({
            message : "Internal server error"
        });
    }
}
export async function logout(req, res){
    res.clearCookie("jwt");
    res.status(200).json({
        success : true,
        message : "Logout Successfully!"
    });
}

export async function onboard(req, res) {
    try {
        const userId = req.user._id;

        const {fullName, bio, nativeLanguage, learningLanguage, location} = req.body;
        if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location){
            return res.status(400).json({
                message : "All fields are required",
                missingFields : [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ].filter(Boolean),
            });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded : true,
        }, {new : true});
        if(!updatedUser){
            return res.status(404).json({
                message : "User not found"
            });
        }

        res.status(200).json({
            success : true,
            user : updatedUser
        })

    } catch (error) {
        console.error("Onboarding error : ", error);
        res.status(500).json({
            message : "Internal server error"
        });
    }
}