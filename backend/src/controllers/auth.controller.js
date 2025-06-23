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
    res.send("Login Route");
}
export async function logout(req, res){
    res.send("logout Route");
}