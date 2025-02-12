import { asyncHandler } from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js';
import { User } from "../models/user.models.js";

import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/apiResponse.js';

const registerUser=asyncHandler(async (req,res)=>{
  
  //get user detail from frontend
  //validation- not empty
  //check if user already exist:username,email
  //check for images
 //check for avtar
 //upload them for cloudinary
 //check wether the avtar has uploaded in cloudinary
 //create userobject - create entry  in db
 //remove password and refersh tokens  field  from response to show on frontend
 //check for user creation 
 //return response 


const {username,email,fullname,password} =req.body;
console.log("Request body",req.body)//for accesing user details
//validation
if ([username, email, fullname, password].some((field) => field?.trim() === "")) {
  console.log( username,email,fullname,password)
  throw new ApiError("All fields are required", 400);
  

}

//checking if the user already exist or not

const existedUser=await User.findOne({
  $or: [{ username }, { email }],
  if(existedUser){
    throw new ApiError("User already exist", 409);
  }
})


//upload on server
const avatarLocalPath=req.files?.avatar[0]?.path//the file is on the server
if(!avatarLocalPath){
  throw new ApiError("Please upload avatar", 400);
}
const coverImageLocalPath=req.files?.coverImage[0]?.path
if(!coverImageLocalPath){
  throw new ApiError("Please upload cover image", 400);
}
//uploading images to cloudinary

const avatarUploaded=await uploadOnCloudinary(avatarLocalPath)
if(!avatarUploaded){
  throw new ApiError("Failed to upload avatar to cloudinary", 500);
}
const coverImageUploaded=await uploadOnCloudinary(coverImageLocalPath)
if(!coverImageUploaded){
  throw new ApiError("Failed to upload cover image to cloudinary", 500);
}

/*Datbase entry*/
const user = await User.create({
  fullname,
  avatar: avatarUploaded.url,  // Corrected
  coverImage: coverImageUploaded?.url || "",  // Corrected
  email,
  password,
  username: username.toLowerCase(),
});

//to check if user has been created
const createdUser = await User.findById(user._id).select("-password -refreshToken");
if(!createdUser){
  throw new ApiError("Failed to create user", 500);
}
//succesfully 
return res.status(201).json(
  new ApiResponse(200,createdUser,"UserRegistred Succesfully Created")
)











































})

export {registerUser}

