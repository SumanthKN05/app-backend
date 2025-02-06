import mongoose, {schema} from 'mongoose';
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";









const userSchema = new Schema({
  username:{
    type:String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20,
    index:true, //searching field optimisation
    lowercase:true
  },
  email:{
   type:String,
   required: true,
   unique: true,
   lowercase: true,
   trim: true,
  },
   validate: {
     validator: validator.isEmail,
     message: '{VALUE} is not a valid email',
   },
   fullname:{
     type:String,
     required: true,
     minlength: 3,
     maxlength: 50,
     trim:true,
     unique: true,
     index:true,
   },
   avatar:{
     type:String, //cloudinary services 
     required:true,
   },
   coverImage:{
    type:String, //cloudinary services 
   },
   watchHistory:
   {
     type:Schema.Types.ObjectId(),
     ref:'video'
   },
   password:{
     type:String,
     required: [true,"password is required"],
     minlength: 8,
     select: false, //not shown in response
   },
   refreshToken:{
     type:String,
   },
  },{timestamps:true})


  //passowrd Encryption
userSchema.pre("save",async function(next){
  if(!this.isModified("password"))return next();


this.password = bcrypt.hash(this.password,10)//encryption 
next()
})

userSchema.methods.isPasswordCorrect= async function(passowrd)  
{
  return await bcrypt.compare(password/*given pasword*/,this.passwword/*encrypted owner paswsord*/)  
  /*along with hashing bcrypt also compares the correct password enterd or not! it takes (data:string and encrypted:string)*/
}

//injecting methods into schema
userSchema.methods.generateAcessToken=function(){
  /*sign help u in genrating tokens and we need to give the below payload*/
  return jwt.sign({
    /*payload*/
    _id:this._id,
    username:this.username,
    email:this.email,
    fullname:this.fullname,
    avatar:this.avatar,
    coverImage:this.coverImage,
  })
  /*sign method helps in creating tokens, we need to provide the secret key, algorithm and the payload*/
  process.env.ACCESS_TOKEN_SECRET, /*this will return a token string*/
{
  expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
  algorithm:'HS512'
}


  userSchema.methods.generateRefreshToken=function(){
    /*sign help u in genrating tokens and we need to give the below payload*/
    return jwt.sign({
      /*payload*/
      _id:this._id,
    })
    /*sign method helps in creating tokens, we need to provide the secret key, algorithm and the payload*/
    process.env.ACCESS_TOKEN_SECRET, /*this will return a token string*/
  {
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
  }}
 

}

userSchema.methods.generateRefreshToken=function(){}
export const User=mongoose.model('User',userScehma)