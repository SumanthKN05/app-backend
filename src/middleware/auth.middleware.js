import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"; 
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Checking whether the tokens are in the cookies (small part of the browser) or header
    const token =
    req.cookies?.accessToken ||
    req.header("authorization")?.replace("Bearer ", ""); // removes 'Bearer ' from the token in the header
   // Here in the header, the token is sent with the name "Bearer", so we need to remove or replace it with an empty string to just get the token.


    // Validation
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verifying the token with the secret key (which is kept in the .env file)
    let decodedToken;
    try {
      console.log("Verifying Token...");
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log("Decoded Token:", decodedToken);
    } catch (err) {
      console.error("JWT Verification Failed:", err.message);
      throw new ApiError(401, "Invalid Access Token");
    }
    
    // If the token is valid, then find the user in the database with the ID of the user in the token
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    console.log("user found",user)

    // If the user is not found, then throw an error
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // If the user is found, then put it in the req object and move to the next middleware
    req.user = user;
    next();
  } catch (error) {
    // If any error occurs, then throw an error with the status code and the error message
    console.error("JWT Verification Failed:",error.message)
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
/*
JWT Verification Process (verifyJWT Middleware) 📌
1)Extract Token – The token is retrieved from either cookies (accessToken) or the Authorization header (removing "Bearer ").
2)Check Token Presence – If no token is found, an "Unauthorized request" error (401) is thrown.
3)Verify Token – The token is validated using the secret key from the .env file (ACCESS_TOKEN_SECRET).
4)Decode Token – If valid, extract the user ID from the token.
5)Find User in Database – Use the extracted ID to locate the user, excluding sensitive fields (-password -refreshToken).
6)Handle Invalid User – If the user is not found, throw an "Invalid Access Token" error (401).
7)Attach User to Request & Proceed – If valid, attach the user to req.user and pass control to the next middleware. 🚀
*/






