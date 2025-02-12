import mongoose, { Schema } from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20,
    index: true, // Searching field optimization
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  fullname: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    trim: true,
    unique: true,
    index: true,
  },
  avatar: {
    type: String, // Cloudinary services
    required: true,
  },
  coverImage: {
    type: String, // Cloudinary services
  },
  watchHistory: {
    type: Schema.Types.ObjectId, // Removed unnecessary parentheses
    ref: 'video',
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minlength: 8,
    select: false, // Not shown in response
  },
  refreshToken: {
    type: String,
  },
}, { timestamps: true });

// Password Encryption Middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10); // Fixed bcrypt hashing
  next();
});

// Password Comparison Method
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // Fixed bcrypt comparison
};

// Generate Access Token
userSchema.methods.generateAcessToken = function () {
  return jwt.sign({
    _id: this._id,
    username: this.username,
    email: this.email,
    fullname: this.fullname,
    avatar: this.avatar,
    coverImage: this.coverImage,
  },
    process.env.ACCESS_TOKEN_SECRET, // Moved secret key inside sign function
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      algorithm: 'HS512'
    });
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({
    _id: this._id,
  },
    process.env.ACCESS_TOKEN_SECRET, // Moved secret key inside sign function
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
};

export const User = mongoose.model('User', userSchema); // Fixed typo in userSchema
