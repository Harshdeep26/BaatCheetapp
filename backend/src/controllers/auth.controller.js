import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const signup = async(req,res) => {
    const{fullname,email,password} = req.body
    try {
        
        if(!fullname || !email || !password){
            return res.status(400).json({message: "All field are required"});
        }


        if(password.length<6){
            return res.status(400).json({message: "password must be atleast 6 characters"});
        }
        
        const user = await User.findOne({email});

        if(user) return res.status(400).json({message: "Email already exists"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User({
            fullname,   // fullname:fullname,
            email,      // email:email,
            password:hashedPassword,
        })

        if(newUser){
            //generater token using jwt 
            generateToken(newUser._id , res)
            await newUser.save();

            //201- because something has been created
            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        }
        else{
            res.status(400).json({message: "Invalid User Data"});
        }

    } 
    catch (error) {
        console.log("Error in signup controller",error.message);
        res.status(500).json({message: "Internal server error"});
    }
};


export const login = async (req,res) => {
    const {email,password} = req.body
    try {
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }

        const IspasswordCorrect = await bcrypt.compare(password, user.password);

        if(!IspasswordCorrect){
            return res.status(400).json({message: "Incorrect password"});
        }

        generateToken(user._id,res);

        res.status(200).json({
            _id:user._id,
            fullname:user.fullname,
            email:user.email,
            profilePic:user.profilePic,
        })

    } 
    catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
};

export const logout = (req,res) => {
    try {
        res.cookie("jwt", "", {maxAge:0});
        res.status(200).json({message:"Logged out successfully"});
    }
    catch (error) {
        console.log("Error in logout controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
};

export const updateProfile = async (req,res) =>{
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({message: "Profile Pic Is Required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic); //cloudinary is just a bucket for our images, we have uploaded the image we need to update the profile pic in the database for the user

        const updateUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url}, {new:true}); 
        //helps to find and update the profile and By default, findOneAndUpdate() returns the document as it was before update was applied. If you set new: true, findOneAndUpdate() will instead give you the object after update was applied.

        res.status(200).json(updateUser);

    } catch (error) {
        console.log("Error in updating profile ",error.message);
        res.status(500).json({message:"Internal server error"});
    }
};

export const checkAuth = async (req,res) =>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checking authentication ",error.message);
        res.status(500).json({message:"Internal server error"});
    }
};