import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
videoFile:{
  type:String,//cloudinary url
  required:true
},
thumbnail:{
  type:String,
  required:true
},

title:{
  type:String,
  required:true
},

description:{
  type:String
},

channel:{
  type: mongoose.Schema.Types.ObjectId(),
  ref:'Channel',
  required:true
},
durations:{
  type:Number,
  required:true
},
views:{
  type:Number,
  default:0
},
published:{
  type:Boolean,
  default:false
},

likes:{
  type:Number,
  default:0
},
dislikes:{
  type:Number,
  default:0
},
owner:{
  type: mongoose.Schema.Types.ObjectId(),
  ref:'User',
  required:true
},








},{timestamps:true})


videoSchema.plugin(mongooseAggregatePaginate)
export const Video =mongoose.model('Video',videoSchema);