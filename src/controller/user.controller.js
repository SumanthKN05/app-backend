import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/apiResponse.js';
import jwt from "jsonwebtoken"; 

// the method used to generate tokens whenever required
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Log the userId to verify that it's correct
    console.log("Generating tokens for user ID:", userId);
    
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found with ID:", userId);
      throw new ApiError("User not found", 404);
    }

    const refreshToken = user.generateRefreshToken(); 
    const accessToken = user.generateAccessToken();

    console.log("Generated Refresh Token:", refreshToken);
    console.log("Generated Access Token:", accessToken);

    user.refreshToken = refreshToken; // Add refreshToken to the user object
    await user.save({ validateBeforeSave: false }); // Save user without validating password

    console.log("Tokens saved successfully");

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error while generating tokens:", error);
    throw new ApiError("Something went wrong while generating access and refresh token", 500);
  }
};


const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;
  console.log("Request body", req.body); // For accessing user details

  // Validation
  if ([username, email, fullname, password].some((field) => field?.trim() === "")) {
    console.log(username, email, fullname, password);
    throw new ApiError("All fields are required", 400);
  }

  // Checking if the user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError("User already exists", 409);
  }

  // Upload on local server
  const avatarLocalPath = req.files?.avatar?.[0]?.path; // The file is on the server
  if (!avatarLocalPath) {
    throw new ApiError("Please upload avatar", 400);
  }
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  if (!coverImageLocalPath) {
    throw new ApiError("Please upload cover image", 400);
  }

  // Uploading images to Cloudinary
  const avatarUploaded = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarUploaded) {
    throw new ApiError("Failed to upload avatar to Cloudinary", 500);
  }
  const coverImageUploaded = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImageUploaded) {
    throw new ApiError("Failed to upload cover image to Cloudinary", 500);
  }

  // Database entry
  const user = await User.create({
    fullname,
    avatar: avatarUploaded.url, // Cloudinary URL
    coverImage: coverImageUploaded?.url || "", // Cloudinary URL
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  // Checking if the user has been created
  if (!createdUser) {
    throw new ApiError("Failed to create user", 500);
  }

  // Successfully registered and getting the id
  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully")
  );
});

/* Login Page */
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError("Please provide email or username", 400);
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  }).select("+password"); // Ensure password is included
  
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Password check
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError("Password is invalid", 401);
  }

  // Generate access and refresh tokens and give them to the user
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  console.log("Access Token:", accessToken);
  console.log("Refresh Token:", refreshToken);
  

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // Send them in cookies
  const options = {
    httpOnly: true, // Cookies are sent in the object pattern design
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in Successfully", accessToken, refreshToken));
});

/* Logout */
const logoutUser = asyncHandler(async (req, res) => {
  // Remove refresh token from DB
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: "" } },  // ✅ This properly removes the field
    { new: true }
  );
  

  // Clearing cookies
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out Successfully"));
});

/*refresh token*/
const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
      throw new ApiError("No refresh token provided", 401);
    }
    //validation of refreshToken
    try {
      const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    } catch (error) {
      
    }
  
  
   const user=await User.findById(decodedToken?._id)
   if(!user){
    throw new ApiError(401,"Invalid User Token provided")
   }
   /*comparing  the incoming refresh token and the refresh token that we save in the above code in database need to be compare them*/
   if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(401,"Invalid Refresh Token provided or it is expired")
   }
   const {accessToken ,newrefreshToken}=await generateAccessAndRefreshTokens(user._id)
  
   const options={
    httpOnly: true,
    secure: true,
   }
   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", newrefreshToken, options)
  .json(
    new ApiResponse(200, "User refreshed access token successfully", accessToken, newrefreshToken)
  
  )
  } catch (error) {
    console.error("Error while refreshing access token:", error);
    throw new ApiError(400,error?.message || "Invalid refresh token");
    
  }
})

/*changing the current user's password*/
const changeCurrentPassword=asyncHandler(async(req,res)=>
  {
  const{oldPassword,newPassword}=req.body

  const user=await User.findById(req.user?._id)
  const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)
 if(!isPasswordCorrect){
  throw new ApiError("Old password is incorrect", 400);
 }

 user.password=newPassword
 await user.save({validateBeforeSave:false})

 return res
 .status(200)
 .json(new ApiResponse(200,{},"Passowrd changed"))


})

/*getting the current user*/
const getCurrentUser=asyncHandler(async(req,res)=>{
 return res
 .status(200)
 .json(new ApiResponse(200,req.user,"CurrentUser retrieved successfully")) 
  
})

/*Updating the account details like user 's email and password*/
const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullname,email}=req.body
  if(fullname||email){
    throw new ApiError("Fullname or email is required", 400);  // ��️ This validation should be performed on the server-side to prevent potential security vulnerabilities.  //
  }
const user=await User.findByIdAndUpdate(
  req.user?._id,
  {
    set:{
      fullname,
      email,
      updatedAt: new Date(),
    }
  },
  {new: true}
).select("-password")
//returning the response
return res
.status(200)
.json(new ApiResponse(200,req.user),"Account details updated successfully")
})

/*Updating the files*/
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError("Please upload an avatar", 400);
  }

  // Uploading to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError("Failed to upload avatar to Cloudinary", 500);
  }

  // Updating the user's avatar
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
        updatedAt: new Date(),
      },
    },
    { new: true }
  ).select("-password");

  // Sending a successful response
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"))
    .catch((error) => {
      console.error("Error while updating avatar:", error);
      throw new ApiError(500, error?.message || "Failed to update avatar");
    });
});


/*Updating the coverImge*/
const updateCoverImageAvatar = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError("Please upload Cover Image Avatar", 400);
  }

  // Uploading to Cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError("Failed to upload cover image to Cloudinary", 500);
  }

  // Updating the user's cover image
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
        updatedAt: new Date(),
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"))
    .catch((error) => {
      console.error("Error while updating cover image:", error);
      throw new ApiError(500, error?.message || "Failed to update cover image");
    });
});
















export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateCoverImageAvatar// Newly added function for refreshing access token  // ❗️ This function should be protected with JWT middleware to ensure only authenticated users can refresh their tokens.  // 🚨 This is just a basic implementation, you should implement proper token handling and validation.  // 🔒 Make sure to replace `process.env.REFRESH_TOKEN_SECRET` with your own secret key for refresh token generation and verification.  // 🔒 This function is not
};
